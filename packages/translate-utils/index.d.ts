interface YoudaoConfig {
  key?: string
  secret?: string
}

interface BaiduConfig {
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

  export declare function baiduTranslate(
    word: string,
    originLang: string,
    targetLang: string,
    option: BaiduConfig
  ): Promise<string>
}

export = TranslateUtils
