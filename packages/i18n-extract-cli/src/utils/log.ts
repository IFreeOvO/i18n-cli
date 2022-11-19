import chalk from 'chalk'

const log = {
  info: (msg: string) => console.log(chalk.cyan(msg)),
  warning: (msg: string) => console.log(chalk.yellow(msg)),
  success: (msg: string) => console.log(chalk.green(msg)),
  error: (msg1: string, msg2: unknown = '') => console.log(chalk.red(msg1), chalk.red(msg2)),
  verbose: (label: string, msg: unknown = '') =>
    process.env.CLI_VERBOSE && console.log(chalk.gray(label), msg),
}

export default log
