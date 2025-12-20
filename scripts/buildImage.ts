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
}

export interface AvailableArgsShort {
  v?: AvailableArgs['verbose']
  tr?: AvailableArgs['target']
  dt?: AvailableArgs['docker-target']
  tg?: AvailableArgs['tag']
  dr?: AvailableArgs['dry-run']
  cs?: AvailableArgs['copy-scripts']
  se?: AvailableArgs['script-excludes']
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
    'docker-target': rawArgs.dt ?? rawArgs['docker-target'] ?? false,
    tag: rawArgs.tg ?? rawArgs.tag,
    'dry-run': rawArgs.dr ?? rawArgs['dry-run'] ?? false,
    'copy-scripts': rawArgs.cs ?? rawArgs['copy-scripts'] ?? false,
    'script-excludes': rawArgs.se ?? rawArgs['script-excludes'],
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

const validateTargetUrl = (url: string) => {
  const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:[0-9]{1,5})?(\/.*)?$/
  return urlPattern.test(url)
}
