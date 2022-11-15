import type { CommandOptions, FileExtension } from 'packages/i18n-extract-cli/types'
import fs from 'fs-extra'
import path from 'path'
import defaultConfig from './default.config'
import transform from './transform'
import glob from 'glob'
import merge from 'lodash/merge'
import log from './utils/log'
import { getAbsolutePath } from './utils/getAbsolutePath'
import Collector from './collector'

function isValidInput(input: string) {
  const inputPath = getAbsolutePath(process.cwd(), input)

  if (!fs.existsSync(inputPath)) {
    log.error('input路径不存在,请重新设置input参数')
    process.exit(1)
  }
  if (!fs.statSync(inputPath).isDirectory()) {
    log.error('input不是一个目录,请重新设置input参数')
    process.exit(1)
  }
  return true
}

function getSourceFiles(input: string, exclude: string[]) {
  if (isValidInput(input)) {
    return glob.sync(`${input}/**/*.{cjs,mjs,js,ts,tsx,jsx,vue}`, {
      ignore: exclude,
    })
  } else {
    return []
  }
}

function getUserConfig(configFile?: string) {
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

function getI18nConfig(options: CommandOptions) {
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
    log.error('localePath指向的路径不是一个文件,请重新设置localePath参数')
    process.exit(1)
  }
  log.verbose(`输出字典文件到指定位置:`, localeAbsolutePath)
  fs.writeFileSync(localeAbsolutePath, JSON.stringify(keyMap, null, 2), 'utf8')
}

export default function (options: CommandOptions) {
  const i18nConfig = getI18nConfig(options)
  const { input, exclude, output, rules, localePath } = i18nConfig
  log.verbose(`脚手架配置信息:`, i18nConfig)
  const sourceFiles = getSourceFiles(input, exclude)

  sourceFiles.forEach((sourceFile) => {
    log.verbose(`正在提取文件中的汉字:`, sourceFile)
    const sourceCode = fs.readFileSync(sourceFile, 'utf8')
    const ext = path.extname(sourceFile).replace('.', '') as FileExtension
    const { code } = transform(sourceCode, ext, rules)
    log.verbose(`完成汉字提取和语法转换:`, sourceFile)

    if (output) {
      const filePath = sourceFile.replace(input + '/', '')
      const outputPath = getAbsolutePath(process.cwd(), output, filePath)
      fs.ensureFileSync(outputPath)
      fs.writeFileSync(outputPath, code, 'utf8')
      log.verbose(`生成文件:`, outputPath)
    } else {
      const outputPath = getAbsolutePath(process.cwd(), sourceFile)
      fs.writeFileSync(outputPath, code, 'utf8')
      log.verbose(`覆盖文件:`, outputPath)
    }
  })

  saveLocale(localePath)
}
