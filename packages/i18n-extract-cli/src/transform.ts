import chalk from 'chalk'
import type { Rules, FileExtension } from '../types'
import transformJs from './transformJs'
import { initParse } from './parse'
const presetTypescript = require('@babel/preset-typescript')

function transform(code: string, ext: FileExtension, rules: Rules) {
  switch (ext) {
    case 'cjs':
    case 'mjs':
    case 'js':
    case 'jsx':
      return transformJs(code, ext, {
        rules,
        parse: initParse(),
      })
    case 'ts':
    case 'tsx':
      return transformJs(code, ext, {
        rules,
        parse: initParse([[presetTypescript, { isTSX: true, allExtensions: true }]]),
      })
    default:
      throw new Error(chalk.red(`不支持对.${ext}后缀的文件进行提取`))
  }
}

export default transform
