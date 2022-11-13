import { Config, Rule } from '../types'

function getCustomizeKey(key: string) {
  return key
}

function getCommonRule(): Rule {
  return {
    caller: 'i18n',
    functionName: '$t',
    customizeKey: getCustomizeKey,
    importDeclaration: 'import i18n from "i18n"',
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
  },
}

export default config
