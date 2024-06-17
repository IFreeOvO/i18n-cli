import type { CommandOptions, FileExtension, TranslateConfig, PrettierConfig } from '../types'
import fs from 'fs-extra'
import chalk from 'chalk'
import inquirer from 'inquirer'
import path from 'path'
import prettier from 'prettier'
import cliProgress from 'cli-progress'
import glob from 'glob'
import merge from 'lodash/merge'
import cloneDeep from 'lodash/cloneDeep'
import transform from './transform'
import log from './utils/log'
import { getAbsolutePath } from './utils/getAbsolutePath'
import Collector from './collector'
import translate from './translate'
import getLang from './utils/getLang'
import { YOUDAO, GOOGLE, BAIDU, ALICLOUD } from './utils/constants'
import StateManager from './utils/stateManager'
import exportExcel from './exportExcel'
import { getI18nConfig } from './utils/initConfig'
import { saveLocaleFile } from './utils/saveLocaleFile'
import { isObject } from './utils/assertType'

interface InquirerResult {
  translator?: 'google' | 'youdao' | 'baidu' | 'alicloud'
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

function saveLocale(localePath: string) {
  const keyMap = Collector.getKeyMap()
  const localeAbsolutePath = getAbsolutePath(process.cwd(), localePath)

  if (!fs.existsSync(localeAbsolutePath)) {
    fs.ensureFileSync(localeAbsolutePath)
  }

  if (!fs.statSync(localeAbsolutePath).isFile()) {
    log.error(`路径${localePath}不是一个文件,请重新设置localePath参数`)
    process.exit(1)
  }
  saveLocaleFile(keyMap, localeAbsolutePath)
  log.verbose(`输出中文语言包到指定位置:`, localeAbsolutePath)
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
  } else if (answers.translator === BAIDU) {
    return {
      translator: answers.translator,
      baidu: {
        key: answers.key,
        secret: answers.secret,
      },
    }
  } else if (answers.translator === ALICLOUD) {
    return {
      translator: answers.translator,
      alicloud: {
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
        { name: '百度翻译', value: BAIDU },
        { name: '阿里云机器翻译', value: ALICLOUD },
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
    {
      type: 'input',
      name: 'key',
      message: '请输入百度翻译appId',
      default: oldConfigCache.key || '',
      when(answers) {
        return answers.translator === BAIDU
      },
      validate(input) {
        return input.length === 0 ? 'appKey不能为空' : true
      },
    },
    {
      type: 'input',
      name: 'secret',
      message: '请输入百度翻译appSecret',
      default: oldConfigCache.secret || '',
      when(answers) {
        return answers.translator === BAIDU
      },
      validate(input) {
        return input.length === 0 ? 'appSecret不能为空' : true
      },
    },
    {
      type: 'input',
      name: 'key',
      message: '请输入阿里云机器翻译accessKeyId',
      default: oldConfigCache.key || '',
      when(answers) {
        return answers.translator === ALICLOUD
      },
      validate(input) {
        return input.length === 0 ? 'accessKeyId不能为空' : true
      },
    },
    {
      type: 'input',
      name: 'secret',
      message: '请输入阿里云机器翻译accessKeySecret',
      default: oldConfigCache.secret || '',
      when(answers) {
        return answers.translator === ALICLOUD
      },
      validate(input) {
        return input.length === 0 ? 'accessKeySecret不能为空' : true
      },
    },
  ])

  const newConfigCache = Object.assign(oldConfigCache, answers)
  fs.writeFileSync(cachePath, JSON.stringify(newConfigCache), 'utf8')

  const result = formatInquirerResult(answers)
  return result
}

function formatCode(code: string, ext: string, prettierConfig: PrettierConfig): string {
  let stylizedCode = code
  if (isObject(prettierConfig)) {
    stylizedCode = prettier.format(code, {
      ...prettierConfig,
      parser: getPrettierParser(ext),
    })
    log.verbose(`格式化代码完成`)
  }
  return stylizedCode
}

export default async function (options: CommandOptions) {
  let i18nConfig = getI18nConfig(options)
  if (!i18nConfig.skipTranslate) {
    const translationConfig = await getTranslationConfig()
    i18nConfig = merge(i18nConfig, translationConfig)
  }
  // 全局缓存脚手架配置
  StateManager.setToolConfig(i18nConfig)

  const {
    input,
    exclude,
    output,
    rules,
    localePath,
    locales,
    skipExtract,
    skipTranslate,
    adjustKeyMap,
    localeFileType,
  } = i18nConfig
  log.debug(`命令行配置信息:`, i18nConfig)

  let oldPrimaryLang: Record<string, string> = {}
  const primaryLangPath = getAbsolutePath(process.cwd(), localePath)
  if (!fs.existsSync(primaryLangPath)) {
    fs.ensureFileSync(primaryLangPath)
  }
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
      Collector.resetCountOfAdditions()
      Collector.setCurrentCollectorPath(sourceFilePath)
      const { code } = transform(sourceCode, ext, rules, sourceFilePath)
      log.verbose(`完成中文提取和语法转换:`, sourceFilePath)

      // 只有文件提取过中文，或文件规则forceImport为true时，才重新写入文件
      if (Collector.getCountOfAdditions() > 0 || rules[ext].forceImport) {
        const stylizedCode = formatCode(code, ext, i18nConfig.prettier)
        const outputPath = getOutputPath(input, output, sourceFilePath)
        fs.writeFileSync(outputPath, stylizedCode, 'utf8')
        log.verbose(`生成文件:`, outputPath)
      }

      // 自定义当前文件的keyMap
      if (adjustKeyMap) {
        const newkeyMap = adjustKeyMap(
          cloneDeep(Collector.getKeyMap()),
          Collector.getCurrentFileKeyMap(),
          sourceFilePath
        )
        Collector.setKeyMap(newkeyMap)
        Collector.resetCurrentFileKeyMap()
      }

      bar.increment()
    })
    // 增量转换时，保留之前的提取的中文结果
    if (i18nConfig.incremental) {
      const newkeyMap = merge(oldPrimaryLang, Collector.getKeyMap())
      Collector.setKeyMap(newkeyMap)
    }

    const extName = path.extname(localePath)
    const savePath = localePath.replace(extName, `.${localeFileType}`)
    saveLocale(savePath)
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
      baidu: i18nConfig.baidu,
      alicloud: i18nConfig.alicloud,
    })
  }

  log.success('转换完毕!')

  if (i18nConfig.exportExcel) {
    log.info(`正在导出excel翻译文件`)
    exportExcel()
    log.success(`导出完毕!`)
  }
}
