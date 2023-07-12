import md5 from 'md5'
import qs from 'qs'
import { Response } from 'got/dist/source/core/index'
const got = require('got')

export interface BaiduConfig {
  key?: string
  secret?: string
}

export async function baiduTranslate(
  word: string,
  originLang: string,
  targetLang: string,
  option: BaiduConfig
): Promise<Array<{ src: string; dst: string }>> {
  const key = option.key
  const secret = option.secret
  const salt = Math.random()
  const sign = md5(key + word + salt + secret)
  const baseUrl = 'https://fanyi-api.baidu.com/api/trans/vip/translate'
  const params = {
    from: originLang,
    to: targetLang.split('-')[0],
    appid: key,
    salt,
    sign,
    q: word,
  }

  const url = `${baseUrl}?${qs.stringify(params)}`

  return new Promise((resolve, reject) => {
    got
      .get(url)
      .then(({ body }: Response<string>) => {
        const res = JSON.parse(body)
        if (!res.error_code) {
          resolve(res.trans_result)
        } else {
          reject(body)
        }
      })
      .catch((e: any) => {
        reject(e)
      })
  })
}
