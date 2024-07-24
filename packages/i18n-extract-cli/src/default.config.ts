import { Config, Rule } from '../types'

// 参数path，在生成配置文件时需要展示在文件里，所以这里去掉eslint校验
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getCustomizeKey(key: string, path?: string): string {
  return key
}

function getCustomSlot(slotValue: string): string {
  return `{${slotValue}}`
}

function getCommonRule(): Rule {
  return {
    caller: '',
    functionName: 't',
    customizeKey: getCustomizeKey,
    customSlot: getCustomSlot,
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
      customSlot: getCustomSlot,
      importDeclaration: '',
      tagOrder: ['template', 'script', 'style'],
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
  locales: ['en-US'],
  globalRule: {
    ignoreMethods: [],
  },
  // 参数currentFileKeyMap和currentFilePath，在生成配置文件时需要展示在文件里，所以这里去掉eslint校验
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  adjustKeyMap(allKeyValue, currentFileKeyMap, currentFilePath) {
    return allKeyValue
  },
}

export default config
