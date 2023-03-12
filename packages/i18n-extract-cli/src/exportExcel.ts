import fs from 'fs-extra'
import StateManager from './utils/stateManager'
import { getExcelHeader, buildExcel } from './utils/excelUtil'
import { getAbsolutePath } from './utils/getAbsolutePath'
import getLang from './utils/getLang'
import log from './utils/log'
import { getLocaleDir } from './utils/getLocaleDir'

export default function exportExcel() {
  const { localeFileType, excelPath } = StateManager.getToolConfig()
  const headers = getExcelHeader()
  const matchResult = excelPath.match(new RegExp(`([A-Za-z-]+.xlsx)`, 'g')) ?? []
  const excelFileName = matchResult[0] ?? ''

  // 获取语言包存放路径
  const localeDirPath = getLocaleDir()
  const locales = headers.slice(1)

  // 遍历每个语言包，并组成excel的data
  const data: string[][] = []
  for (const locale of locales) {
    const currentLocalePath = getAbsolutePath(localeDirPath, `${locale}.${localeFileType}`)
    let lang: Record<string, string> = {}
    if (fs.existsSync(currentLocalePath)) {
      lang = getLang(currentLocalePath)
    } else {
      log.error(`${locale}语言包不存在`)
      break
    }

    // 遍历中文时，存入key和value，并创建数据行
    if (locale === 'zh-CN') {
      Object.keys(lang).forEach((key, index) => {
        data.push([])
        data[index].push(key) // 放入字段key
        data[index].push(lang[key]) // 放入中文翻译
      })
    } else {
      Object.keys(lang).forEach((key, index) => {
        data[index].push(lang[key])
      })
    }
  }
  const excelBuffer = buildExcel(headers, data, excelFileName)

  fs.writeFileSync(getAbsolutePath(process.cwd(), excelPath), excelBuffer, 'utf8')
}
