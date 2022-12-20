import chalk from 'chalk'
import type { Rules, FileExtension } from '../types'
import transformJs from './transformJs'
import transformVue from './transformVue'
import { initParse } from './parse'
const presetTypescript = require('@babel/preset-typescript')

function transform(
  code: string,
  ext: FileExtension,
  rules: Rules
): {
  code: string
} {
  switch (ext) {
    case 'cjs':
    case 'mjs':
    case 'js':
    case 'jsx':
      return transformJs(code, {
        rule: rules[ext],
        parse: initParse(),
      })
    case 'ts':
    case 'tsx':
      return transformJs(code, {
        rule: rules[ext],
        parse: initParse([[presetTypescript, { isTSX: true, allExtensions: true }]]),
      })
    case 'vue':
      return transformVue(code, rules[ext])
    default:
      throw new Error(chalk.red(`不支持对.${ext}后缀的文件进行提取`))
  }
}

export default transform
