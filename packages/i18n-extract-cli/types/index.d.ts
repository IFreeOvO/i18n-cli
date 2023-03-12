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
  parse?: (code: string) => ParseResult
  isJsInVue?: boolean
}

export interface Rule {
  caller: string
  functionName: string
  importDeclaration: string
  customizeKey: (key: string) => string
  // TODO: 可优化成根据范型动态生成规则
  functionSnippets?: string
}

export type Rules = {
  [k in keyof Config['rules']]: Config['rules'][k]
}

export type FileExtension = 'js' | 'ts' | 'cjs' | 'mjs' | 'jsx' | 'tsx' | 'vue'

export interface YoudaoConfig {
  key?: string
  secret?: string
}
export interface TranslateConfig {
  translator?: 'google' | 'youdao'
  google?: {
    proxy?: string
  }
  youdao?: YoudaoConfig
}
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
    vue: Rule
  }
  prettier: Options
  skipExtract: boolean
  skipTranslate: boolean
  incremental: boolean
  globalRule: GlobalRule
  excelPath: string
  exportExcel: boolean
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
