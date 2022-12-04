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
    jsx: getCommonRule(),
    tsx: getCommonRule(),
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
  skipExtract: false,
  skipTranslate: true,
  localePath: './locales/zh-CN.json',
  translations: ['en-US'],
  translator: 'youdao',
  google: {
    proxy: '',
  },
  youdao: {
    key: '',
    secret: '',
  },
}

export default config
