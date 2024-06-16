interface YoudaoConfig {
  key?: string
  secret?: string
}

interface BaiduConfig {
  key?: string
  secret?: string
}

export interface AlicloudConfig {
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

  export declare function alicloudTranslate(
    word: string,
    originLang: string,
    targetLang: string,
    option: AlicloudConfig
  ): Promise<string>
}

export = TranslateUtils
