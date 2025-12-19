import { spawn } from 'node:child_process'

import { bgGreen, white, bgRed, bgBlue } from 'colors'
import { Spinner } from 'picospinner'

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

  try {
    const buildArgs = []
    if (args.target) {
      buildArgs.push('--target', args.target)
    } else if (!args.target && args['docker-target']) {
      buildArgs.push('--target', 'production-docker')
    }

    // Always add a tag - use provided tag or default to 'dosebot:latest'
    buildArgs.push('--tag', args.tag || 'dosebot:latest')

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
  // Simple regex to validate URL format
  const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:[0-9]{1,5})?(\/.*)?$/
  return urlPattern.test(url)
}

/**
 * Runs a command with spinner integration using async spawn
 * In verbose mode: shows command output directly
 * In non-verbose mode: shows animated spinner and captures output, displaying only on error
 */
const runCommandWithSpinner = (
  command: string,
  spinnerText: string,
  verbose: boolean
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const spinner = new Spinner({
      text: `${bgBlue(white(' RUNNING '))} ${spinnerText}`,
    })

    if (verbose) {
      // In verbose mode, show the command output directly
      Logger.info(spinnerText)
      const child = spawn(command, { stdio: 'inherit', shell: true })

      child.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Command failed with exit code ${code}`))
        }
      })

      child.on('error', (err) => {
        reject(err)
      })
    } else {
      // In non-verbose mode, show spinner and capture output
      spinner.start()
      let stdout = ''
      let stderr = ''

      const child = spawn(command, { stdio: 'pipe', shell: true })

      child.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      child.on('close', (code) => {
        spinner.stop()
        if (code === 0) {
          resolve()
        } else {
          // Show output only on error
          Logger.error('Command failed with output:')
          if (stdout) console.log(stdout)
          if (stderr) console.error(stderr)
          reject(new Error(`Command failed with exit code ${code}`))
        }
      })

      child.on('error', (err) => {
        spinner.stop()
        reject(err)
      })
    }
  })
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
