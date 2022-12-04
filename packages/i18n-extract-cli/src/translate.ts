import fs from 'fs-extra'
import { googleTranslate, youdaoTranslate } from '@ifreeovo/translate-utils'
import type { TranslateConfig } from '../types'
import { getAbsolutePath } from './utils/getAbsolutePath'
import log from './utils/log'
import { GOOGLE, YOUDAO } from './utils/constants'
import getLang from './utils/getLang'

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
    process.exit(1)
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
    process.exit(1)
  }
}

export default async function (
  localePath: string,
  locales: string[],
  oldPrimaryLang: Record<string, string>,
  options: TranslateConfig
) {
  if (![GOOGLE, YOUDAO].includes(options.translator || '')) {
    log.error('翻译失败，请确认translator参数是否配置正确')
    process.exit(1)
  }
  log.verbose('当前使用的翻译器：', options.translator)
  const primaryLangPath = getAbsolutePath(process.cwd(), localePath)
  const newPrimaryLang = require(primaryLangPath)

  for (const targetLocale of locales) {
    log.info(`正在翻译${targetLocale}语言包`)
    const targetPath = localePath.replace(/\/[A-Za-z-]+.json/g, `/${targetLocale}.json`)
    const targetLocalePath = getAbsolutePath(process.cwd(), targetPath)
    let oldTargetLangPack: Record<string, string> = {}
    const newTargetLangPack: Record<string, string> = {}
    if (fs.existsSync(targetLocalePath)) {
      oldTargetLangPack = getLang(targetLocalePath)
    } else {
      fs.ensureFileSync(targetLocalePath)
    }

    const keyList = Object.keys(newPrimaryLang)
    for (const key of keyList) {
      // 主语言同一个key的value不变，就复用原有的翻译结果
      const isNotChanged = oldPrimaryLang[key] === newPrimaryLang[key]
      if (isNotChanged && oldTargetLangPack[key]) {
        newTargetLangPack[key] = oldTargetLangPack[key]
      } else {
        if (options.translator === GOOGLE) {
          newTargetLangPack[key] = await translateByGoogle(
            newPrimaryLang[key],
            targetLocale,
            options
          )
        } else if (options.translator === YOUDAO) {
          newTargetLangPack[key] = await translateByYoudao(
            newPrimaryLang[key],
            targetLocale,
            options
          )
        }
      }
    }
    log.info(`完成${targetLocale}语言包翻译`)
    fs.writeFileSync(targetLocalePath, JSON.stringify(newTargetLangPack, null, 2), 'utf8')
  }
}
