import type { CommandOptions, FileExtension, deepPartial, Config, TranslateConfig } from '../types'
import fs from 'fs-extra'
import chalk from 'chalk'
import inquirer from 'inquirer'
import path from 'path'
import prettier from 'prettier'
import cliProgress from 'cli-progress'
import glob from 'glob'
import merge from 'lodash/merge'
import defaultConfig from './default.config'
import transform from './transform'
import log from './utils/log'
import { getAbsolutePath } from './utils/getAbsolutePath'
import Collector from './collector'
import translate from './translate'
import getLang from './utils/getLang'
import { YOUDAO, GOOGLE } from './utils/constants'

interface InquirerResult {
  translator?: 'google' | 'youdao'
  key?: string
  secret?: string
  proxy?: string
}

function isValidInput(input: string): boolean {
  const inputPath = getAbsolutePath(process.cwd(), input)

  if (!fs.existsSync(inputPath)) {
    log.error(`路径${inputPath}不存在,请重新设置input参数`)
    process.exit(1)
  }
  if (!fs.statSync(inputPath).isDirectory()) {
    log.error(`路径${inputPath}不是一个目录,请重新设置input参数`)
    process.exit(1)
  }
  return true
}

function getSourceFilePaths(input: string, exclude: string[]): string[] {
  if (isValidInput(input)) {
    return glob.sync(`${input}/**/*.{cjs,mjs,js,ts,tsx,jsx,vue}`, {
      ignore: exclude,
    })
  } else {
    return []
  }
}

function getUserConfig(configFile?: string): deepPartial<Config> {
  if (configFile) {
    const configPath = getAbsolutePath(process.cwd(), configFile)
    if (!fs.existsSync(configPath)) {
      log.warning('配置文件路径不存在，请重新设置指令参数 -c 或 --config-file 的值')
      return {}
    } else {
      const config = require(configPath)
      return config
    }
  } else {
    return {}
  }
}

function getI18nConfig(options: CommandOptions): Config {
  const userConfig = getUserConfig(options.configFile)
  const config = merge(defaultConfig, options, userConfig)
  return config
}

function saveLocale(localePath: string) {
  const keyMap = Collector.keyMap
  const localeAbsolutePath = getAbsolutePath(process.cwd(), localePath)

  if (!fs.existsSync(localeAbsolutePath)) {
    fs.ensureFileSync(localeAbsolutePath)
  }

  if (!fs.statSync(localeAbsolutePath).isFile()) {
    log.error(`路径${localePath}不是一个文件,请重新设置localePath参数`)
    process.exit(1)
  }
  log.verbose(`输出中文语言包到指定位置:`, localeAbsolutePath)
  fs.writeFileSync(localeAbsolutePath, JSON.stringify(keyMap, null, 2), 'utf8')
}

function getPrettierParser(ext: string): string {
  switch (ext) {
    case 'vue':
      return 'vue'
    case 'ts':
    case 'tsx':
      return 'babel-ts'
    default:
      return 'babel'
  }
}

function getOutputPath(input: string, output: string, sourceFilePath: string): string {
  let outputPath
  if (output) {
    const filePath = sourceFilePath.replace(input + '/', '')
    outputPath = getAbsolutePath(process.cwd(), output, filePath)
    fs.ensureFileSync(outputPath)
  } else {
    outputPath = getAbsolutePath(process.cwd(), sourceFilePath)
  }
  return outputPath
}

function formatInquirerResult(answers: InquirerResult): TranslateConfig {
  if (answers.translator === YOUDAO) {
    return {
      translator: answers.translator,
      youdao: {
        key: answers.key,
        secret: answers.secret,
      },
    }
  } else {
    return {
      translator: answers.translator,
      google: {
        proxy: answers.proxy,
      },
    }
  }
}

async function getTranslationConfig() {
  const cachePath = getAbsolutePath(__dirname, '../.cache/configCache.json')
  fs.ensureFileSync(cachePath)
  const cache = fs.readFileSync(cachePath, 'utf8') || '{}'
  const oldConfigCache: InquirerResult = JSON.parse(cache)

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'translator',
      message: '请选择翻译接口',
      default: YOUDAO,
      choices: [
        { name: '有道翻译', value: YOUDAO },
        { name: '谷歌翻译', value: GOOGLE },
      ],
      when(answers) {
        return !answers.skipTranslate
      },
    },
    {
      type: 'input',
      name: 'proxy',
      message: '使用谷歌服务需要翻墙，请输入代理地址',
      default: oldConfigCache.proxy || '',
      when(answers) {
        return answers.translator === GOOGLE
      },
      validate(input) {
        return input.length === 0 ? '代理地址不能为空' : true
      },
    },
    {
      type: 'input',
      name: 'key',
      message: '请输入有道翻译appKey',
      default: oldConfigCache.key || '',
      when(answers) {
        return answers.translator === YOUDAO
      },
      validate(input) {
        return input.length === 0 ? 'appKey不能为空' : true
      },
    },
    {
      type: 'input',
      name: 'secret',
      message: '请输入有道翻译appSecret',
      default: oldConfigCache.secret || '',
      when(answers) {
        return answers.translator === YOUDAO
      },
      validate(input) {
        return input.length === 0 ? 'appSecret不能为空' : true
      },
    },
  ])

  const newConfigCache = Object.assign(oldConfigCache, answers)
  fs.writeFileSync(cachePath, JSON.stringify(newConfigCache), 'utf8')

  const result = formatInquirerResult(answers)
  return result
}

export default async function (options: CommandOptions) {
  let i18nConfig = getI18nConfig(options)
  if (!i18nConfig.skipTranslate) {
    const translationConfig = await getTranslationConfig()
    i18nConfig = merge(i18nConfig, translationConfig)
  }
  const { input, exclude, output, rules, localePath, locales, skipExtract, skipTranslate } =
    i18nConfig
  log.debug(`命令行配置信息:`, i18nConfig)
  let oldPrimaryLang: Record<string, string> = {}
  const primaryLangPath = getAbsolutePath(process.cwd(), localePath)
  oldPrimaryLang = getLang(primaryLangPath)
  if (!skipExtract) {
    log.info('正在转换中文，请稍等...')

    const sourceFilePaths = getSourceFilePaths(input, exclude)
    const bar = new cliProgress.SingleBar(
      {
        format: `${chalk.cyan('提取进度:')} [{bar}] {percentage}% {value}/{total}`,
      },
      cliProgress.Presets.shades_classic
    )
    const startTime = new Date().getTime()
    bar.start(sourceFilePaths.length, 0)
    sourceFilePaths.forEach((sourceFilePath) => {
      log.verbose(`正在提取文件中的中文:`, sourceFilePath)
      const sourceCode = fs.readFileSync(sourceFilePath, 'utf8')
      const ext = path.extname(sourceFilePath).replace('.', '') as FileExtension
      const { code } = transform(sourceCode, ext, rules)
      log.verbose(`完成中文提取和语法转换:`, sourceFilePath)
      const stylizedCode = prettier.format(code, {
        ...i18nConfig.prettier,
        parser: getPrettierParser(ext),
      })
      log.verbose(`格式化代码完成`)
      const outputPath = getOutputPath(input, output, sourceFilePath)
      fs.writeFileSync(outputPath, stylizedCode, 'utf8')
      log.verbose(`生成文件:`, outputPath)
      bar.increment()
    })
    // 增量转换时，保留之前的提取的中文结果
    if (i18nConfig.incremental) {
      Collector.keyMap = Object.assign(oldPrimaryLang, Collector.keyMap)
    }
    saveLocale(localePath)
    bar.stop()
    const endTime = new Date().getTime()
    log.info(`耗时${((endTime - startTime) / 1000).toFixed(2)}s`)
  }

  console.log('') // 空一行
  if (!skipTranslate) {
    await translate(localePath, locales, oldPrimaryLang, {
      translator: i18nConfig.translator,
      google: i18nConfig.google,
      youdao: i18nConfig.youdao,
    })
  }
  log.success('转换完毕!')
}
