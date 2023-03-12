import type { Command } from 'commander'
import { program, Option } from 'commander'
import leven from 'leven'
import minimist from 'minimist'
import execCommand from './core'

const chalk = require('chalk')

program
  .version(`${process.env.PACKAGE_NAME} ${process.env.PACKAGE_VERSION}`)
  .usage('[command] [options]')

program
  .option('-i, --input <path>', '输入文件路径')
  .option('-o, --output <path>', '输出文件路径')
  .option('-c, --config-file <path>', '配置文件所在路径')
  .option('-v, --verbose', '控制台打印更多调试信息')
  .option('--skip-extract', '跳过中文提取阶段')
  .option('--skip-translate', '跳过中文翻译阶段')
  .option('--incremental', '开启增量转换')
  .option('--locales <locales...>', '根据中文语言包自动翻译成其他语言')
  .option('--localePath <path>', '指定提取的中文语言包所存放的路径')
  .option('--excelPath <path>', '语言包excel的存放路径')
  .option('--exportExcel', '将所有翻译导入到excel。用于人工校对翻译')
  .action((options) => {
    execCommand(options)
  })

program
  .command('init')
  .description('在项目里初始化一个配置文件')
  .action(() => {
    require('./commands/init/index').default()
  })

program
  .command('loadExcel')
  .description('导入翻译语言的excel')
  .option('-v, --verbose', '控制台打印更多调试信息')
  .option('-c, --config-file <path>', '配置文件所在路径')
  .option('--localePath <path>', '指定提取的中文语言包所存放的路径')
  .option('--excelPath <path>', '语言包excel的存放路径')
  .action(() => {
    // TODO: 不知道为什么，这里commander没有直接返回指令参数，先用minimist自己处理
    const options = minimist(process.argv.slice(3))
    if (options.c) {
      options.configFile = options.c
    }
    require('./commands/loadExcel').default(options)
  })

program.addOption(new Option('-d, --debug').hideHelp())

program.on('option:verbose', function () {
  process.env.CLI_VERBOSE = program.opts().verbose
})
program.on('option:debug', function () {
  process.env.CLI_DEBUG = program.opts().debug
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
