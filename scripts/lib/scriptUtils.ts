import { spawn } from 'node:child_process'

import { bgGreen, white, bgRed, bgBlue } from 'colors'
import { Spinner } from 'picospinner'

export type CommandInput =
  | string
  | {
      cmd: string
      args?: string[]
      stdinData?: string
      shell?: boolean
    }

/*Simple logger singleton with success, error, and info methods.
Each method outputs a colored label followed by the message.
*/
export const Logger = {
  success: (message: string) => {
    console.log(bgGreen(white(' SUCCESS ')), message)
  },
  error: (message: string) => {
    console.error(bgRed(white(' ERROR ')), message)
  },
  info: (message: string) => {
    console.log(bgBlue(white(' INFO ')), message)
  },
}

/*
Validate that required arguments are present in the args object.
If any required argument is missing, the onfail callback is executed.
 */
export const validateArguments = <T extends object>(
  args: T,
  requiredArgs: (keyof T)[],
  onfail: () => void
): boolean | void => {
  for (const arg of requiredArgs) {
    const value = (args as Record<string, unknown>)[arg as string]
    if (!value) {
      return onfail()
    }
  }
  return true
}

/*
Run a command with a spinner. If verbose is true, output command output directly.
Otherwise, capture output and show spinner until command completes.
*/
export const runCommandWithSpinner = (
  command: CommandInput,
  spinnerText: string,
  verbose: boolean
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const spinner = new Spinner({
      text: `${bgBlue(white(' RUNNING '))} ${spinnerText}`,
    })

    const isStringCommand = typeof command === 'string'

    if (verbose) {
      Logger.info(spinnerText)
      if (isStringCommand) {
        const child = spawn(command, {
          stdio: 'inherit',
          shell: true,
        })

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
        if (!command.cmd) {
          reject(new Error('No command provided'))
          return
        }

        const child = spawn(command.cmd, command.args ?? [], {
          stdio: 'pipe',
          shell: command.shell ?? false,
        })

        if (command.stdinData) {
          child.stdin?.write(command.stdinData)
          child.stdin?.end()
        }

        child.stdout?.pipe(process.stdout)
        child.stderr?.pipe(process.stderr)

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
      }
    } else {
      spinner.start()
      let stdout = ''
      let stderr = ''

      if (isStringCommand) {
        const child = spawn(command, {
          stdio: 'pipe',
          shell: true,
        })

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
      } else {
        if (!command.cmd) {
          spinner.stop()
          reject(new Error('No command provided'))
          return
        }

        const child = spawn(command.cmd, command.args ?? [], {
          stdio: 'pipe',
          shell: command.shell ?? false,
        })

        if (command.stdinData) {
          child.stdin?.write(command.stdinData)
          child.stdin?.end()
        }

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
    }
  })
}
