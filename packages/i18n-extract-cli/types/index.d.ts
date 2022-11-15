import type { ParseResult } from '@babel/core'

type deepPartial<T extends object> = {
  [K in keyof T]?: T[K] extends object ? deepPartial<T[K]> : T[K]
}

export interface transformOptions {
  rules: Rules
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

export type FileExtension = 'js' | 'ts' | 'cjs' | 'mjs' | 'jsx' | 'tsx'

export interface Config {
  input: string
  output: string
  localePath: string
  exclude: string[]
  rules: {
    js: Rule
    ts: Rule
    cjs: Rule
    mjs: Rule
    tsx: Rule
    jsx: Rule
    // vue: Rule
  }
}

export type CommandOptions = deepPartial<Config> & { configFile?: string }
