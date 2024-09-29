import chalk from 'chalk'
import type { Rules, FileExtension } from '../types'
import transformJs from './transformJs'
import transformVue from './transformVue'
import { initParse } from './parse'
const presetTypescript = require('@babel/preset-typescript')

function transform(
  code: string,
  ext: FileExtension,
  rules: Rules,
  filePath: string
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
        parse: initParse(),
      })
    case 'vue':
      // 规则functionName废弃掉，使用functionNameInScript代替
      rules[ext].functionName = rules[ext].functionNameInScript ?? ''
      return transformVue(code, {
        rule: rules[ext],
        filePath,
      })
    default:
      throw new Error(chalk.red(`不支持对.${ext}后缀的文件进行提取`))
  }
}

export default transform
