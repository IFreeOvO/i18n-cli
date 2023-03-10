import { Config, Rule } from '../types'

function getCustomizeKey(key: string) {
  return key
}

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
      functionName: '$t',
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
  skipTranslate: false,
  locales: ['en-US'],
  globalRule: {
    ignoreMethods: [],
  },
}

export default config
