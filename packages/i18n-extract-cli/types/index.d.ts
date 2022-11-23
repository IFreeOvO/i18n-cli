import type { ParseResult } from '@babel/core'
import type { Options } from 'prettier'

export type deepPartial<T extends object> = {
  [K in keyof T]?: T[K] extends object ? deepPartial<T[K]> : T[K]
}

export interface transformOptions {
  rule: Rule
  parse(code: string): ParseResult
  [k: string]: unknown
}

export interface Rule {
  caller: string
  functionName: string
  importDeclaration: string
  customizeKey: (key: string) => string
}

export type Rules = {
  [k in keyof Config['rules']]: Rule
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
  translations: string[]
  exclude: string[]
  rules: {
    js: Rule
    ts: Rule
    cjs: Rule
    mjs: Rule
    tsx: Rule
    jsx: Rule
    vue: Rule
  }
  prettier: Options
  skipExtract: boolean
  skipTranslate: boolean
} & TranslateConfig

export interface CommandOptions {
  input?: string
  output?: string
  localePath?: string
  configFile?: string
  translations?: string[]
  verbose?: boolean
  skipExtract?: boolean
  skipTranslate?: boolean
}
