import limax from 'limax'
import { Config, Rule, StringObject } from '../types'

function getCommonRule(): Rule {
  return {
    caller: '',
    functionName: 't',
    customizeKey: getCustomizeKey,
    importDeclaration: 'import { t } from "i18n"',
  }
}

const config: Config = {
  input: 'src',
  output: '',
  exclude: ['**/node_modules/**/*'],
  rules: {
    js: getCommonRule(),
    ts: getCommonRule(),
    cjs: getCommonRule(),
    mjs: getCommonRule(),
    jsx: {
      ...getCommonRule(),
      functionSnippets: '',
    },
    tsx: {
      ...getCommonRule(),
      functionSnippets: '',
    },
    vue: {
      caller: 'this',
      functionNameInTemplate: '$t',
      functionNameInScript: '$t',
      customizeKey: getCustomizeKey,
      importDeclaration: '',
    },
  },
  prettier: {
    semi: false,
    singleQuote: true,
  },
  incremental: false,
  skipExtract: false,
  localePath: './locales/zh-CN.json',
  localeFileType: 'json',
  excelPath: './locales.xlsx',
  exportExcel: false,
  skipTranslate: false,
  preferredDelimiter: '-',
  locales: ['en-US'],
  globalRule: {
    ignoreMethods: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  adjustKeyMap(allKeyValue, currentFileKeyMap, currentFilePath) {
    return allKeyValue
  },
}

// 第二个参数path，在生成配置文件时需要展示在文件里，所以不需要去掉
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getCustomizeKey(text: string, path?: string, keyMap?: StringObject): string {
  let key = limax(text, { separator: config.preferredDelimiter, tone: false }).slice(
    0,
    config.extractKeyMaxLength ?? Infinity
  )
  if (keyMap && Object.prototype.hasOwnProperty.call(keyMap, key) && keyMap[key] !== text) {
    let num = 0
    const originalKey = key
    do {
      key = `${originalKey}${config.preferredDelimiter}${num}`
      num += 1
    } while (keyMap && Object.prototype.hasOwnProperty.call(keyMap, key) && keyMap[key] !== text)
  }

  return key
}

export default config
