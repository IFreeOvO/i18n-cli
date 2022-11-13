import type { CommandOptions, FileExtension } from 'packages/i18n-extract-cli/types'
import fs from 'fs-extra'
import path from 'path'
import defaultConfig from './default.config'
import transform from './transform'
import glob from 'glob'
import merge from 'lodash/merge'
import isEmpty from 'lodash/isEmpty'
import log from './utils/log'
import { getAbsolutePath } from './utils/getAbsolutePath'

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
  let config = merge(defaultConfig, options)
  if (!isEmpty(userConfig)) {
    config = merge(config, userConfig)
  }
  return config
}

export default function (options: CommandOptions) {
  const i18nConfig = getI18nConfig(options)
  const { input, exclude, output, rules } = i18nConfig
  log.verbose(`脚手架配置信息:`, i18nConfig)
  const sourceFiles = getSourceFiles(input, exclude)

  sourceFiles.forEach((sourceFile) => {
    const sourceCode = fs.readFileSync(sourceFile, 'utf8')
    const ext = path.extname(sourceFile).replace('.', '') as FileExtension
    const { code } = transform(sourceCode, ext, rules)

    if (output) {
      const filePath = sourceFile.replace(input + '/', '')
      const outputPath = getAbsolutePath(process.cwd(), output, filePath)
      fs.ensureFileSync(outputPath)
      fs.writeFileSync(outputPath, code, 'utf8')
    } else {
      const outputPath = getAbsolutePath(process.cwd(), sourceFile)
      fs.writeFileSync(outputPath, code, 'utf8')
    }
  })
}
