import ProxyAgent from 'proxy-agent'
import { translate } from '@vitalets/google-translate-api'

export async function googleTranslate(
  word: string,
  originLang: string,
  targetLang: string,
  proxy: string | undefined
): Promise<string> {
  return new Promise((resolve, reject) => {
    const agent = ProxyAgent(proxy)
    translate(word, {
      fetchOptions: { agent },
      from: originLang,
      to: targetLang,
    })
      .then((res) => {
        resolve(res.text || '')
      })
      .catch((e: any) => {
        reject(e)
      })
  })
}
