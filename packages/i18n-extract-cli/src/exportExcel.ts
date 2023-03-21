import fs from 'fs-extra'
import type { StringObject } from '../types'
import StateManager from './utils/stateManager'
import { getExcelHeader, buildExcel } from './utils/excelUtil'
import { getAbsolutePath } from './utils/getAbsolutePath'
import getLang from './utils/getLang'
import log from './utils/log'
import { getLocaleDir } from './utils/getLocaleDir'
import { flatObjectDeep } from './utils/flatObjectDeep'

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
    let lang: StringObject = {}
    if (fs.existsSync(currentLocalePath)) {
      lang = getLang(currentLocalePath)
    } else {
      log.error(`${locale}语言包不存在`)
      break
    }

    // 遍历中文时，存入key和value，并创建数据行
    if (locale === 'zh-CN') {
      let rowIndex = 0
      const keyValueMap = flatObjectDeep(lang)
      Object.keys(keyValueMap).forEach((key) => {
        data.push([])
        data[rowIndex].push(key) // 放入字段key
        data[rowIndex].push(keyValueMap[key]) // 放入中文翻译
        rowIndex++
      })
    } else {
      let rowIndex = 0
      const keyValueMap = flatObjectDeep(lang)
      Object.keys(keyValueMap).forEach((key) => {
        data[rowIndex].push(keyValueMap[key]) // 放入中文翻译
        rowIndex++
      })
    }
  }

  const excelBuffer = buildExcel(headers, data, excelFileName)
  fs.writeFileSync(getAbsolutePath(process.cwd(), excelPath), excelBuffer, 'utf8')
}
