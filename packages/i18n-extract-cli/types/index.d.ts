import type { ParseResult } from '@babel/core'
import type { Options } from 'prettier'

export type deepPartial<T extends object> = {
  [K in keyof T]?: T[K] extends object ? deepPartial<T[K]> : T[K]
}

export interface GlobalRule {
  ignoreMethods: string[]
}

export interface transformOptions {
  rule: Rule
  parse: (code: string) => ParseResult
  isJsInVue?: boolean
  filePath?: string
}

export type CustomizeKey = (key: string, path?: string) => string

export type GetCustomSlot = (slotValue: string) => string

export interface Rule {
  caller: string
  functionName?: string
  importDeclaration: string
  vueImportDeclaration?: string
  customizeKey: CustomizeKey
  customSlot: GetCustomSlot
  // TODO: 可优化成根据范型动态生成规则
  functionSnippets?: string
  forceImport?: boolean
  functionNameInTemplate?: string
  functionNameInScript?: string
}

export type Rules = {
  [k in keyof Config['rules']]: Config['rules'][k]
}

export type FileExtension = 'js' | 'ts' | 'cjs' | 'mjs' | 'jsx' | 'tsx' | 'vue'

export type StringObject = {
  [key: string]: string | StringObject
}

export type AdjustKeyMap = (
  allKeyValue: StringObject,
  currentPathKeyValue: Record<string, string>,
  path
) => StringObject

export interface YoudaoConfig {
  key?: string
  secret?: string
}

export interface BaiduConfig {
  key?: string
  secret?: string
}

interface AlicloudConfig {
  key?: string
  secret?: string
}

export type translatorType = 'google' | 'youdao' | 'baidu' | 'alicloud'
export interface TranslateConfig {
  translator?: translatorType
  google?: {
    proxy?: string
  }
  youdao?: YoudaoConfig
  baidu?: BaiduConfig
  alicloud?: AlicloudConfig
}

export type PrettierConfig = Options | boolean

export type TagOrder = Array<'template' | 'script' | 'style'>

export type Config = {
  input: string
  output: string
  localePath: string
  localeFileType: string
  locales: string[]
  exclude: string[]
  rules: {
    js: Rule
    ts: Rule
    cjs: Rule
    mjs: Rule
    tsx: Rule & {
      functionSnippets: string
    }
    jsx: Rule & {
      functionSnippets: string
    }
    vue: Rule & {
      tagOrder: TagOrder
    }
  }
  prettier: PrettierConfig
  skipExtract: boolean
  skipTranslate: boolean
  incremental: boolean
  globalRule: GlobalRule
  excelPath: string
  exportExcel: boolean
  adjustKeyMap?: AdjustKeyMap
} & TranslateConfig

export interface CommandOptions {
  input?: string
  output?: string
  localePath?: string
  configFile?: string
  locales?: string[]
  verbose?: boolean
  skipExtract?: boolean
  skipTranslate?: boolean
  excelPath?: string
  exportExcel?: boolean
}
