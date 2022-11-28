import fs from 'fs-extra'
import https from 'https'
import ProxyAgent from 'proxy-agent'
import md5 from 'md5'
import qs from 'qs'
import { translate as googleTranslate } from '@vitalets/google-translate-api'
import type { TranslateConfig, YoudaoConfig } from '../types'
import { getAbsolutePath } from './utils/getAbsolutePath'
import log from './utils/log'
import { GOOGLE, YOUDAO } from './utils/constants'
import getLang from './utils/getLang'

async function request(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, function (req) {
        let data = ''
        req.on('data', function (chunk) {
          data += chunk
        })

        // 监听end 获取返回的参数
        req.on('end', function () {
          const res = JSON.parse(data)
          if (res.errorCode === '0') {
            const result = res.translation[0]
            resolve(result)
          } else {
            log.error('接口出错:', `${res.status} ${res.error}`)
            reject('')
          }
        })
      })
      .on('error', () => {
        log.error('接口出错')
        reject('')
      })
  })
}

async function translateByGoogle(
  word: string,
  targetLang: string,
  proxy: string | undefined
): Promise<string> {
  try {
    if (!proxy) {
      log.error('未配置谷歌代理地址')
      process.exit(1)
    }
    const agent = ProxyAgent(proxy)
    const { text } = await googleTranslate(word, {
      fetchOptions: { agent },
      from: 'zh-CN',
      to: targetLang,
    })
    return text || ''
  } catch (e: any) {
    if (e.name === 'TooManyRequestsError') {
      log.error('请求超过谷歌api调用次数限制')
      process.exit(1)
    }
    log.error('接口出错')
    return ''
  }
}

async function translateByYoudao(
  word: string,
  targetLang: string,
  option: YoudaoConfig
): Promise<string> {
  const key = option.key
  const secret = option.secret
  const salt = Math.random()
  const sign = md5(key + word + salt + secret)
  const baseUrl = 'https://openapi.youdao.com/api'
  const params = {
    from: 'zh-CN',
    to: targetLang,
    appKey: key,
    salt,
    sign,
    q: word,
  }
  const url = `${baseUrl}?${qs.stringify(params)}`

  try {
    const res = await request(url)
    return res
  } catch {
    return ''
  }
}

export default async function (
  localePath: string,
  translations: string[],
  oldPrimaryLang: Record<string, string>,
  options: TranslateConfig
) {
  if (![GOOGLE, YOUDAO].includes(options.translator || '')) {
    log.error('翻译失败，请确认translator参数是否配置正确')
    process.exit(1)
  }
  const primaryLangPath = getAbsolutePath(process.cwd(), localePath)
  const newPrimaryLang = require(primaryLangPath)

  for (const targetTranslation of translations) {
    const targetPath = localePath.replace(/\/[A-Za-z-]+.json/g, `/${targetTranslation}.json`)
    const targetLocalePath = getAbsolutePath(process.cwd(), targetPath)
    let oldTargetLang: Record<string, string> = {}
    const newTargetLang: Record<string, string> = {}
    if (fs.existsSync(targetLocalePath)) {
      oldTargetLang = getLang(targetLocalePath)
    } else {
      fs.ensureFileSync(targetLocalePath)
    }

    const keyList = Object.keys(newPrimaryLang)
    for (const key of keyList) {
      const isNotChanged = oldPrimaryLang[key] === newPrimaryLang[key]
      if (isNotChanged && oldTargetLang[key]) {
        newTargetLang[key] = oldTargetLang[key]
      } else {
        if (options.translator === GOOGLE) {
          if (!options.google || !options.google?.proxy) {
            log.error('翻译失败，当前翻译器为谷歌，请完善google配置参数')
            process.exit(1)
          }
          newTargetLang[key] = await translateByGoogle(key, targetTranslation, options.google.proxy)
        } else if (options.translator === YOUDAO) {
          if (!options.youdao || !options.youdao?.key || !options.youdao?.secret) {
            log.error('翻译失败，当前翻译器为有道，请完善youdao配置参数')
            process.exit(1)
          }
          newTargetLang[key] = await translateByYoudao(key, targetTranslation, options.youdao)
        }
      }
    }
    log.info(`完成${targetTranslation}语言包翻译`)
    fs.writeFileSync(targetLocalePath, JSON.stringify(newTargetLang, null, 2), 'utf8')
  }
}
