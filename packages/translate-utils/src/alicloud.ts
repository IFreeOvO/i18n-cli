import alimt20181012, * as $alimt20181012 from '@alicloud/alimt20181012'
import { Config } from '@alicloud/openapi-client'
import { RuntimeOptions } from '@alicloud/tea-util'

export interface AlicloudConfig {
  key?: string
  secret?: string
}

export function createClient(key = '', secret = ''): alimt20181012 {
  const config = new Config({
    accessKeyId: key,
    accessKeySecret: secret,
    endpoint: 'mt.aliyuncs.com',
  })
  return new alimt20181012(config)
}

function toAlicloudLangCode(locale: string): string {
  const lower = locale.toLowerCase()
  if (lower === 'zh-tw' || lower === 'zh-cht' || lower === 'zh-hant') {
    return 'zht'
  }
  return lower.split('-')[0]
}

export async function alicloudTranslate(
  word: string,
  originLang: string,
  targetLang: string,
  option: AlicloudConfig
): Promise<string> {
  const key = option.key
  const secret = option.secret

  const client = createClient(key, secret)
  const translateGeneralRequest = new $alimt20181012.TranslateGeneralRequest({
    formatType: 'text',
    sourceLanguage: toAlicloudLangCode(originLang),
    targetLanguage: toAlicloudLangCode(targetLang),
    scene: 'general',
    sourceText: word,
  })
  const runtime = new RuntimeOptions({})

  return new Promise((resolve, reject) => {
    client
      .translateGeneralWithOptions(translateGeneralRequest, runtime)
      .then((resp) => {
        if (resp.statusCode === 200) {
          if (resp.body?.code === 200) {
            resolve(resp.body?.data?.translated ?? '')
          } else {
            reject(resp.body)
          }
        } else {
          reject(resp.body)
        }
      })
      .catch((e: any) => {
        reject(e)
      })
  })
}
