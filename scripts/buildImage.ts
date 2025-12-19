import { execSync } from 'node:child_process'

import { Spinner } from 'cli-spinner'
import { bgGreen, white, bgRed, bgBlue } from 'colors'

interface AvailableArgs {
  verbose: boolean
  // The docker registry url to push to
  target?: string
  'docker-target'?: boolean
  tag?: string
  'dry-run'?: boolean
}

interface AvailableArgsShort {
  v?: AvailableArgs['verbose']
  tr?: AvailableArgs['target']
  dt?: AvailableArgs['docker-target']
  tg?: AvailableArgs['tag']
  dr?: AvailableArgs['dry-run']
}

type CombinedArgs = AvailableArgs & AvailableArgsShort

interface Args {
  _: string[]
  args: CombinedArgs
}

/*
   Build the Docker image for DoseBot
   This script will not be copied to ./script, even if the seed feature flag is enabled,
   it should only be used in development or CI/CD environments.
*/
export default async ({ args: rawArgs }: Args) => {
  const spinner = new Spinner()

  const args: AvailableArgs = {
    verbose: rawArgs.v ?? rawArgs.verbose ?? false,
    target: rawArgs.tr ?? rawArgs.target,
    'docker-target': rawArgs.dt ?? rawArgs['docker-target'] ?? false,
    tag: rawArgs.tg ?? rawArgs.tag,
    'dry-run': rawArgs.dr ?? rawArgs['dry-run'] ?? false,
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

  Logger.info('Starting Docker image build process...')
  spinner.start()
  try {
    const buildArgs = []
    if (args.target) {
      buildArgs.push('--target', args.target)
    } else if (!args.target && args['docker-target']) {
      buildArgs.push('--target', 'production-docker')
    }

    if (args.tag) {
      buildArgs.push('--tag', args.tag ?? 'dosebot:latest')
    }

    if (args.verbose) {
      buildArgs.push('--progress=plain')
    }

    if (args['dry-run']) {
      Logger.info('Dry run enabled. Building image locally for testing...')
      buildArgs.splice(0, 2, '--tag', 'dosebot:test')
      buildArgs.push('--load')
      execSync(`docker build . ${buildArgs.join(' ')}`, { stdio: 'inherit' })

      spinner.stop(true)
      Logger.success('Docker image built successfully as dosebot:test')
      Logger.info(
        'You can now test the image locally with: docker run dosebot:test'
      )
      Logger.info('Optionally you can also run docker-compose up to test it.')
    } else {
      execSync(`docker build . ${buildArgs.join(' ')}`, { stdio: 'inherit' })

      spinner.stop(true)
      Logger.success('Docker image built successfully.')

      if (args.target) {
        Logger.info(`Pushing Docker image to target: ${args.target} ...`)
        spinner.start()
        execSync(`docker push ${args.target}`, { stdio: 'inherit' })
        spinner.stop(true)
        Logger.success('Docker image pushed successfully.')
      }
    }
  } catch (error) {
    spinner.stop(true)
    Logger.error(`An error occurred during the Docker image build process.`)
    args.verbose && console.error(error)
    process.exit(1)
  }
}

const validateTargetUrl = (url: string) => {
  // Simple regex to validate URL format
  const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:[0-9]{1,5})?(\/.*)?$/
  return urlPattern.test(url)
}

/* Simple logger singleton for displaying some nice colors*/
const Logger = {
  success: (message: string) => {
    console.log(bgGreen(white(` SUCCESS `)), message)
  },
  error: (message: string) => {
    console.error(bgRed(white(` ERROR `)), message)
  },
  info: (message: string) => {
    console.log(bgBlue(white(` INFO `)), message)
  },
}
