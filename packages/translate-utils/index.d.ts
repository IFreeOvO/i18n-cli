interface YoudaoConfig {
  key?: string
  secret?: string
}

declare namespace TranslateUtils {
  export declare function googleTranslate(
    word: string,
    originLang: string,
    targetLang: string,
    proxy: string | undefined
  ): Promise<string>

  export declare function youdaoTranslate(
    word: string,
    originLang: string,
    targetLang: string,
    option: YoudaoConfig
  ): Promise<string>
}

export = TranslateUtils
