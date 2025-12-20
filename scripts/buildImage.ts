import { runCommandWithSpinner, Logger } from './lib/scriptUtils'

export interface AvailableArgsLong {
  verbose: boolean
  // Full image reference to build (and push, if requested)
  target?: string
  // Optional local tag when not pushing
  tag?: string
  // Push image after build
  push?: boolean
}

export interface AvailableArgsShort {
  v?: AvailableArgs['verbose']
  tr?: AvailableArgs['target']
  tg?: AvailableArgs['tag']
  ps?: AvailableArgs['push']
}

export type AvailableArgs = AvailableArgsLong & AvailableArgsShort

interface Args {
  _: string[]
  args: AvailableArgs
}

/*
   Build the Docker image for DoseBot
   This script will not be copied to ./script, even if the seed feature flag is enabled,
   it should only be used in development or CI/CD environments.
*/
export default async ({ args: rawArgs }: Args) => {
  const args: AvailableArgs = {
    verbose: rawArgs.v ?? rawArgs.verbose ?? false,
    target: rawArgs.tr ?? rawArgs.target,
    tag: rawArgs.tg ?? rawArgs.tag,
    push: rawArgs.ps ?? rawArgs.push ?? false,
  }

  console.log('----------------------------------')
  console.log('DoseBot Docker Image Build Script')
  switch (args.verbose) {
    case true:
      Logger.info('Verbose logging enabled.')
      Logger.info('Detailed build output will be shown.')
      break
  }
  console.log('----------------------------------')

  if (args.push && !args.target) {
    Logger.error('Pushing requires --target to specify the destination image.')
    process.exit(1)
  }

  const imageTag = args.push
    ? (args.target as string)
    : args.target || args.tag || 'dosebot:latest'

  try {
    const buildArgs = ['--tag', imageTag]

    if (args.verbose) {
      buildArgs.push('--progress=plain')
    }

    await runCommandWithSpinner(
      `docker build . ${buildArgs.join(' ')}`,
      `Building Docker image as ${imageTag}...`,
      args.verbose
    )

    Logger.success(`Docker image built successfully as ${imageTag}.`)

    if (args.push && args.target) {
      await loginToRegistry(args.target)

      await runCommandWithSpinner(
        `docker push ${args.target}`,
        `Pushing Docker image to ${args.target}...`,
        args.verbose
      )
      Logger.success('Docker image pushed successfully.')
    }
  } catch (error) {
    Logger.error(`An error occurred during the Docker image build process.`)
    args.verbose && console.error(error)
    process.exit(1)
  }
}

export const loginToRegistry = async (target: string) => {
  const registry = extractRegistryFromTarget(target)
  const loginTarget = registry ?? ''
  const spinnerLabel = registry
    ? `Logging into ${registry}...`
    : 'Logging into Docker Hub...'

  // Use verbose mode for login so docker can prompt for credentials interactively.
  await runCommandWithSpinner(
    loginTarget ? `docker login ${loginTarget}` : 'docker login',
    spinnerLabel,
    true
  )

  Logger.success(
    registry
      ? `Logged into ${registry} successfully.`
      : 'Logged into Docker Hub successfully.'
  )
}

const extractRegistryFromTarget = (target: string): string | null => {
  const normalized = target.replace(/^https?:\/\//, '')
  const [first] = normalized.split('/')

  if (!first) return null

  if (first.includes('.') || first.includes(':') || first === 'localhost') {
    return first
  }

  return null
}
