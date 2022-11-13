import chalk from 'chalk'

const log = {
  info: (msg: string) => console.log(chalk.cyan(msg)),
  warning: (msg: string) => console.log(chalk.yellow(msg)),
  success: (msg: string) => console.log(chalk.green(msg)),
  error: (msg: string) => console.log(chalk.red(msg)),
  verbose: (label: string, info: unknown) =>
    process.env.CLI_VERBOSE && console.log(chalk.gray(label), info),
}

export default log
