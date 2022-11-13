// import type { Command } from 'commander'
import { program, Command } from 'commander'
import leven from 'leven'
import execCommand from './core'

const chalk = require('chalk')

program.version(`${process.env.PACKAGE_NAME} ${process.env.PACKAGE_VERSION}`).usage('[options]')

program
  .option('-i, --input <path>', '输入文件路径')
  .option('-o, --output <path>', '输出文件路径')
  .option('-c, --config-file <path>', '配置文件所在路径')
  .option('-v --verbose', '控制台打印更多调试信息')
  .action((options) => {
    execCommand(options)
  })

program.on('option:verbose', function () {
  process.env.CLI_VERBOSE = program.opts().verbose
})

enhanceErrorMessages()

program.parse(process.argv)

function enhanceErrorMessages() {
  type CMD = Command & { Command: { prototype: { [key: string]: any } } }
  ;(program as CMD).Command.prototype['unknownOption'] = function (...options: any) {
    const unknownOption = options[0]
    this.outputHelp()
    console.log()
    console.log(`  ` + chalk.red(`Unknown option ${chalk.yellow(unknownOption)}.`))
    if (unknownOption.startsWith('--')) {
      suggestCommands(unknownOption.slice(2, unknownOption.length))
    }
    console.log()
    process.exit(1)
  }
}

function suggestCommands(unknownOption: string) {
  const availableOptions = ['input', 'output', 'config-file']
  let suggestion: string | undefined

  availableOptions.forEach((name) => {
    const isBestMatch = leven(name, unknownOption) < leven(suggestion || '', unknownOption)
    if (leven(name, unknownOption) < 3 && isBestMatch) {
      suggestion = name
    }
  })

  if (suggestion) {
    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(`--${suggestion}`)}?`))
  }
}
