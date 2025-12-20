import { runCommandWithSpinner, Logger } from './lib/scriptUtils'

export interface AvailableArgsLong {
  verbose: boolean
  // The docker registry url to push to
  target?: string
  'docker-target'?: boolean
  tag?: string
  'dry-run'?: boolean
  'copy-scripts'?: boolean
  'script-excludes'?: string
  login?: boolean
  username?: string
  password?: string
  registry?: string
}

export interface AvailableArgsShort {
  v?: AvailableArgs['verbose']
  tr?: AvailableArgs['target']
  dt?: AvailableArgs['docker-target']
  tg?: AvailableArgs['tag']
  dr?: AvailableArgs['dry-run']
  cs?: AvailableArgs['copy-scripts']
  se?: AvailableArgs['script-excludes']
  l?: AvailableArgs['login']
  u?: AvailableArgs['username']
  p?: AvailableArgs['password']
  r?: AvailableArgs['registry']
}

export type AvailableArgs = AvailableArgsLong & AvailableArgsShort

export interface DockerLoginConfig {
  username: string
  password: string
  registry: string
}

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
    'docker-target': rawArgs.dt ?? rawArgs['docker-target'] ?? false,
    tag: rawArgs.tg ?? rawArgs.tag,
    'dry-run': rawArgs.dr ?? rawArgs['dry-run'] ?? false,
    'copy-scripts': rawArgs.cs ?? rawArgs['copy-scripts'] ?? false,
    'script-excludes': rawArgs.se ?? rawArgs['script-excludes'],
    login: rawArgs.l ?? rawArgs.login ?? false,
    username: rawArgs.u ?? rawArgs.username,
    password: rawArgs.p ?? rawArgs.password,
    registry: rawArgs.r ?? rawArgs.registry,
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

  if (args.target && !validateTargetUrl(args.target)) {
    Logger.error(`The provided target: "${args.target}" is not a valid URL.`)
    process.exit(1)
  }

  const loginConfig = buildLoginConfig(args)

  try {
    const buildArgs = []
    if (args.target) {
      buildArgs.push('--target', args.target)
    } else if (!args.target && args['docker-target']) {
      buildArgs.push('--target', 'production-docker')
    }

    // Always add a tag - use provided tag or default to 'dosebot:latest'
    buildArgs.push('--tag', args.tag || 'dosebot:latest')

    if (args['copy-scripts']) {
      buildArgs.push('--build-arg', 'COPY_SCRIPTS=1')
    }

    if (args['script-excludes']) {
      buildArgs.push(
        '--build-arg',
        `SCRIPT_EXCLUDES=${args['script-excludes']}`
      )
    }

    if (args.verbose) {
      buildArgs.push('--progress=plain')
    }

    if (args['dry-run']) {
      Logger.info('Dry run enabled. Building image locally for testing...')
      // Replace the tag with test tag for dry-run
      const tagIndex = buildArgs.indexOf('--tag')
      if (tagIndex !== -1) {
        buildArgs[tagIndex + 1] = 'dosebot:test'
      }
      buildArgs.push('--load')

      await runCommandWithSpinner(
        `docker build . ${buildArgs.join(' ')}`,
        'Building Docker image (test mode)...',
        args.verbose
      )

      Logger.success('Docker image built successfully as dosebot:test')
      Logger.info(
        'You can now test the image locally with: docker run dosebot:test'
      )
      Logger.info('Optionally you can also run docker-compose up to test it.')
    } else {
      await runCommandWithSpinner(
        `docker build . ${buildArgs.join(' ')}`,
        'Building Docker image...',
        args.verbose
      )

      Logger.success('Docker image built successfully.')
      if (loginConfig) {
        await loginToRegistry(loginConfig, args.verbose)
      }

      if (args.target) {
        await runCommandWithSpinner(
          `docker push ${args.target}`,
          `Pushing Docker image to ${args.target}...`,
          args.verbose
        )
        Logger.success('Docker image pushed successfully.')
      }
    }
  } catch (error) {
    Logger.error(`An error occurred during the Docker image build process.`)
    args.verbose && console.error(error)
    process.exit(1)
  }
}

export const loginToRegistry = async (
  config: DockerLoginConfig,
  verbose: boolean
) => {
  const { registry, username, password } = config

  if (!validateRegistryUrl(registry)) {
    Logger.error(`The provided registry: "${registry}" is not a valid URL.`)
    process.exit(1)
  }

  await runCommandWithSpinner(
    {
      cmd: 'docker',
      args: ['login', registry, '-u', username, '--password-stdin'],
      stdinData: password,
    },
    `Logging into ${registry}...`,
    verbose
  )

  Logger.success(`Logged into ${registry} successfully.`)
}

const validateTargetUrl = (url: string) => {
  const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:[0-9]{1,5})?(\/.*)?$/
  return urlPattern.test(url)
}

const validateRegistryUrl = (url: string) => {
  const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:[0-9]{1,5})?(\/.*)?$/
  return urlPattern.test(url)
}

const buildLoginConfig = (args: AvailableArgs): DockerLoginConfig | null => {
  const loginRequested = Boolean(
    args.login || args.username || args.password || args.registry
  )

  if (!loginRequested) return null

  const missing: string[] = []
  if (!args.username) missing.push('username (--username or -u)')
  if (!args.password) missing.push('password (--password or -p)')
  if (!args.registry) missing.push('registry (--registry or -r)')

  if (missing.length) {
    Logger.error(`Missing required login arguments: ${missing.join(', ')}`)
    process.exit(1)
  }

  if (!validateRegistryUrl(args.registry as string)) {
    Logger.error(
      `The provided registry: "${args.registry}" is not a valid URL.`
    )
    process.exit(1)
  }

  return {
    username: args.username as string,
    password: args.password as string,
    registry: args.registry as string,
  }
}
