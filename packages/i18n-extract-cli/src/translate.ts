import fs from 'fs-extra'
import { googleTranslate, youdaoTranslate } from '@ifreeovo/translate-utils'
import type { TranslateConfig, StringObject, translatorType } from '../types'
import { getAbsolutePath } from './utils/getAbsolutePath'
import log from './utils/log'
import { GOOGLE, YOUDAO } from './utils/constants'
import getLang from './utils/getLang'
import StateManager from './utils/stateManager'
import { saveLocaleFile } from './utils/saveLocaleFile'
import { flatObjectDeep } from './utils/flatObjectDeep'
import { spreadObject } from './utils/spreadObject'

async function translateByGoogle(
  word: string,
  locale: string,
  options: TranslateConfig
): Promise<string> {
  if (!options.google || !options.google?.proxy) {
    log.error('翻译失败，当前翻译器为谷歌，请完善google配置参数')
    process.exit(1)
  }
  try {
    return await googleTranslate(word, 'zh-CN', locale, options.google.proxy)
  } catch (e: any) {
    if (e.name === 'TooManyRequestsError') {
      log.error('翻译失败，请求超过谷歌api调用次数限制')
    } else {
      log.error('谷歌翻译请求出错', e)
    }
    return ''
  }
}

async function translateByYoudao(
  word: string,
  locale: string,
  options: TranslateConfig
): Promise<string> {
  if (!options.youdao || !options.youdao?.key || !options.youdao?.secret) {
    log.error('翻译失败，当前翻译器为有道，请完善youdao配置参数')
    process.exit(1)
  }
  try {
    return await youdaoTranslate(word, 'zh-CN', locale, options.youdao)
  } catch (e) {
    log.error('有道翻译请求出错', e)
    return ''
  }
}

export default async function (
  localePath: string,
  locales: string[],
  oldPrimaryLang: StringObject,
  options: TranslateConfig
) {
  if (![GOOGLE, YOUDAO].includes(options.translator || '')) {
    log.error('翻译失败，请确认translator参数是否配置正确')
    process.exit(1)
  }
  log.verbose('当前使用的翻译器：', options.translator)
  const primaryLangPath = getAbsolutePath(process.cwd(), localePath)
  const newPrimaryLang = flatObjectDeep(getLang(primaryLangPath))
  const localeFileType = StateManager.getToolConfig().localeFileType

  for (const targetLocale of locales) {
    log.info(`正在翻译${targetLocale}语言包`)

    const reg = new RegExp(`/[A-Za-z-]+.${localeFileType}`, 'g')
    const targetPath = localePath.replace(reg, `/${targetLocale}.${localeFileType}`)
    const targetLocalePath = getAbsolutePath(process.cwd(), targetPath)
    let oldTargetLangPack: Record<string, string> = {}
    let newTargetLangPack: Record<string, string> = {}
    if (fs.existsSync(targetLocalePath)) {
      oldTargetLangPack = flatObjectDeep(getLang(targetLocalePath))
    } else {
      fs.ensureFileSync(targetLocalePath)
    }

    const keyList = Object.keys(newPrimaryLang)
    const willTranslateText: Record<string, string> = {}

    for (const key of keyList) {
      // 主语言同一个key的value不变，就复用原有的翻译结果
      const oldLang = flatObjectDeep(oldPrimaryLang)
      const isNotChanged = oldLang[key] === newPrimaryLang[key]
      if (isNotChanged && oldTargetLangPack[key]) {
        newTargetLangPack[key] = oldTargetLangPack[key]
      } else {
        willTranslateText[key] = newPrimaryLang[key]
      }
    }

    // 翻译新增键值对内容
    const translator = new Translator({
      provider: options.translator || YOUDAO,
      targetLocale,
      providerOptions: options,
    })
    const incrementalTranslation = await translator.translate(willTranslateText)
    newTargetLangPack = {
      ...newTargetLangPack,
      ...incrementalTranslation,
    }

    const fileContent = spreadObject(newTargetLangPack)
    saveLocaleFile(fileContent, targetLocalePath)
    log.info(`完成${targetLocale}语言包翻译`)
  }
}

type tranlateFunction = (word: string, locale: string, options: TranslateConfig) => Promise<string>

interface TranslatorConstructor {
  provider: translatorType
  targetLocale: string
  providerOptions: TranslateConfig
}
class Translator {
  #provider: tranlateFunction
  #targetLocale: string
  #providerOptions: TranslateConfig
  #textLengthLimit = 5000
  #separator = '\n' // 翻译文本拼接用的分隔符

  constructor({ provider, targetLocale, providerOptions }: TranslatorConstructor) {
    switch (provider) {
      case YOUDAO:
        this.#provider = translateByYoudao
        break
      case GOOGLE:
        this.#provider = translateByGoogle
        break
    }
    this.#targetLocale = targetLocale
    this.#providerOptions = providerOptions
  }

  async translate(dictionary: Record<string, string>): Promise<Record<string, string>> {
    const allTextArr = Object.keys(dictionary).map((key) => dictionary[key])
    let restTextBundleArr = allTextArr
    const translationCount = 100
    let startIndex = 0
    const result: string[] = []

    // 每轮循环，先判断100行key-value的字符数量
    // 如果字符小于1w，以两倍速度递增，扩大翻译行数，以尽可能翻译更多的行数
    // 如果字符大于1w，以两倍倍速度递减，扩小翻译行数，以尽可能翻译更多的行数
    // 确定了行数后开始翻译，一直循环到翻译完所有行
    while (startIndex < allTextArr.length && restTextBundleArr.length > 0) {
      const maxTranslationCount = this.getMaxTranslationCount(
        restTextBundleArr,
        0,
        translationCount
      )
      const textBundleArr = allTextArr.slice(startIndex, startIndex + maxTranslationCount)
      restTextBundleArr = allTextArr.slice(startIndex + maxTranslationCount)
      startIndex = startIndex + maxTranslationCount
      const [res] = await Promise.all([
        this.#provider(
          textBundleArr.join(this.#separator), // 文本中可能有逗号，为了防止后面分割字符出错，使用\\$代替逗号
          this.#targetLocale,
          this.#providerOptions
        ),
        new Promise((resolve) => setTimeout(resolve, 1000)), // 有道翻译接口限制每秒1次请求
      ])

      const resArr = res.split(this.#separator)
      result.push(...resArr)
    }

    const incrementalTranslation: Record<string, string> = {}
    Object.keys(dictionary).forEach((key, index) => {
      // 翻译后有可能字符串前后会多出一个空格，这里做一下过滤
      let translatedText = result[index] || ''
      if (!dictionary[key].startsWith(' ') && translatedText.startsWith(' ')) {
        translatedText = translatedText.slice(1)
      }
      if (!dictionary[key].endsWith(' ') && translatedText.endsWith(' ')) {
        translatedText = translatedText.slice(0, -1)
      }
      incrementalTranslation[key] = translatedText
    })
    return incrementalTranslation
  }

  // 递归获取1w字以内的能够翻译的最大行数
  getMaxTranslationCount(
    textArr: string[],
    allowTranslationCount: number,
    tryTranslationCount: number
  ): number {
    const textNum = textArr.length
    const diff = Math.min(tryTranslationCount, textNum)
    const textBundleArr = textArr.slice(0, diff)
    const textBundleLength = textBundleArr.join(this.#separator).length
    // allowTranslationCount > tryTranslationCount 是指待翻译内容一开始就超出限制字数的情况
    // allowTranslationCount === textNum 是指待翻译内容一开始就小于限制字数的情况
    if (allowTranslationCount > tryTranslationCount || allowTranslationCount === textNum) {
      return allowTranslationCount
    } else if (textBundleLength <= this.#textLengthLimit) {
      return this.getMaxTranslationCount(textArr, diff, tryTranslationCount * 2)
    } else {
      const midCount = Math.floor((tryTranslationCount - allowTranslationCount) / 2)
      return this.getMaxTranslationCount(textArr, allowTranslationCount, midCount)
    }
  }
}
