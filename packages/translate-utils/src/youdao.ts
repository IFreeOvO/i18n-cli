import md5 from 'md5'
import qs from 'qs'
import { Response } from 'got/dist/source/core/index'
const got = require('got')

export interface YoudaoConfig {
  key?: string
  secret?: string
}

export async function youdaoTranslate(
  word: string,
  originLang: string,
  targetLang: string,
  option: YoudaoConfig
): Promise<string> {
  const key = option.key
  const secret = option.secret
  const salt = Math.random()
  const sign = md5(key + word + salt + secret)
  const baseUrl = 'https://openapi.youdao.com/api'
  const params = {
    from: originLang,
    to: targetLang,
    appKey: key,
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
        if (res.errorCode === '0') {
          resolve(res.translation[0])
        } else {
          reject(body)
        }
      })
      .catch((e: any) => {
        reject(e)
      })
  })
}
