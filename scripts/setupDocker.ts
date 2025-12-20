import buildImage, {
  type AvailableArgs as AvailableBuildArgs,
} from './buildImage'
import { runCommandWithSpinner, Logger } from './lib/scriptUtils'

interface AvailableArgsLong {
  username?: string
  password?: string
  registry?: string
  verbose?: boolean
  build?: AvailableBuildArgs
}

interface AvailableArgsShort {
  u?: string
  p?: string
  r?: string
  v?: AvailableArgsLong['verbose']
  b?: AvailableBuildArgs
}

type AvailableArgs = AvailableArgsLong & AvailableArgsShort

interface Args {
  _: string[]
  args: AvailableArgs
}

/*
This script will allow you to set up your Docker credentials and registry to push the built DoseBot image to.
This will usually be if you want to build your own customised image and push it a private registry.

Available args:
  --username (string): Your Docker registry username.
  --password (string): Your Docker registry password.
  --registry (string): The Docker registry URL (e.g., myRegistry.com).
  --build (object): Build arguments to pass to the buildImage script.

 If you want to build the image after setting up the Docker credentials, you can pass build arguments as well.
 These can be found in the buildImage script.

Example usage:
  1. Set up Docker credentials only:
     yarn cedar exec ./scripts/setupDocker.ts -- --username=myUsername --password=myPassword --registry=myRegistry.com


*/
export default async ({ args }: Args) => {
  const normalizedArgs: AvailableArgs = {
    username: args.u ?? args.username,
    password: args.p ?? args.password,
    registry: args.r ?? args.registry,
    verbose: args.v ?? args.verbose ?? false,
    build: args.b ?? args.build,
  }

  console.log('----------------------------------')
  console.log('DoseBot Docker Setup Script')
  switch (normalizedArgs.verbose) {
    case true:
      Logger.info('Verbose logging enabled.')
      Logger.info('Detailed docker output will be shown.')
      break
  }
  console.log('----------------------------------')

  if (
    !normalizedArgs.username ||
    !normalizedArgs.password ||
    !normalizedArgs.registry
  ) {
    Logger.error(
      'Missing required arguments: username, password, and registry are required.'
    )
    process.exit(1)
  }

  if (!validateRegistryUrl(normalizedArgs.registry)) {
    Logger.error(
      `The provided registry: "${normalizedArgs.registry}" is not a valid URL.`
    )
    process.exit(1)
  }

  try {
    await runCommandWithSpinner(
      {
        cmd: 'docker',
        args: [
          'login',
          normalizedArgs.registry,
          '-u',
          normalizedArgs.username,
          '--password-stdin',
        ],
        stdinData: normalizedArgs.password,
      },
      `Logging into ${normalizedArgs.registry}...`,
      normalizedArgs.verbose
    )

    Logger.success(`Logged into ${normalizedArgs.registry} successfully.`)

    const buildArgsRaw = normalizedArgs.build ?? normalizedArgs.b
    if (buildArgsRaw) {
      const buildArgs: AvailableBuildArgs = {
        verbose: buildArgsRaw.v ?? buildArgsRaw.verbose ?? false,
        target: buildArgsRaw.tr ?? buildArgsRaw.target,
        'docker-target': buildArgsRaw.dt ?? buildArgsRaw['docker-target'],
        tag: buildArgsRaw.tg ?? buildArgsRaw.tag,
        'dry-run': buildArgsRaw.dr ?? buildArgsRaw['dry-run'],
        'copy-scripts': buildArgsRaw.cs ?? buildArgsRaw['copy-scripts'],
        'script-excludes': buildArgsRaw.se ?? buildArgsRaw['script-excludes'],
      }

      await buildImage({ _: [], args: buildArgs })
    }
  } catch (error) {
    Logger.error('An error occurred during Docker setup.')
    normalizedArgs.verbose && console.error(error)
    process.exit(1)
  }
}

const validateRegistryUrl = (url: string) => {
  const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:[0-9]{1,5})?(\/.*)?$/
  return urlPattern.test(url)
}
