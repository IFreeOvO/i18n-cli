import chalk from 'chalk'

const log = {
  info: (msg: string) => console.log('\n' + chalk.cyan(msg)),
  warning: (msg: string) => console.log('\n' + chalk.yellow(msg)),
  success: (msg: string) => console.log('\n' + chalk.green(msg)),
  error: (msg1: unknown, msg2: unknown = '') =>
    console.log('\n' + chalk.red(msg1), chalk.red(msg2)),
  verbose: (label: string, msg: unknown = '') =>
    process.env.CLI_VERBOSE && console.log('\n' + chalk.gray(label), msg),
  debug: (label: string, msg: unknown = '') =>
    process.env.CLI_DEBUG && console.log('\n' + chalk.magenta(label), msg),
}

export default log
