import xlsx from 'node-xlsx'
import type { StringObject } from '../../../types'
import { CommandOptions } from '../../../types/index'
import { getAbsolutePath } from '../../utils/getAbsolutePath'
import { getI18nConfig } from '../../utils/initConfig'
import { getLocaleDir } from '../../utils/getLocaleDir'
import StateManager from '../../utils/stateManager'
import { saveLocaleFile } from '../../utils/saveLocaleFile'
import log from '../../utils/log'
import { spreadObject } from '../../utils/spreadObject'

function getLangList(locales: string[], rows: string[][]): StringObject[] {
  const langList: Record<string, string>[] = []
  const result: StringObject[] = []

  locales.forEach((locale, i) => {
    // 创建一个对象，存储该语言的翻译
    langList.push({})
    rows.forEach((row) => {
      const key = row[0]
      const value = row[i + 1]
      langList[i][key] = value
    })
    // 对象的key可能是xx.xx这种形式，需要转成{xx:{xx:1}}
    result[i] = spreadObject(langList[i])
  })

  return result
}

function execLoadExcel(options: CommandOptions) {
  log.info(`正在导入excel翻译文件`)

  const i18nConfig = getI18nConfig(options)
  // 全局缓存脚手架配置
  StateManager.setToolConfig(i18nConfig)

  const { excelPath } = i18nConfig
  const xlsxData = xlsx.parse(getAbsolutePath(process.cwd(), excelPath))[0].data as string[][]

  if (xlsxData.length === 0) {
    return
  }
  // 获取待生成的语言
  const locales = xlsxData[0].slice(1)
  const rows = xlsxData.slice(1)
  const langList: StringObject[] = getLangList(locales, rows)

  // 将excel翻译内容更新到本地
  locales.forEach((locale, i) => {
    const localeDirPath = getLocaleDir()
    const currentLocalePath = getAbsolutePath(
      localeDirPath,
      `${locale}.${i18nConfig.localeFileType}`
    )
    const localePack = langList[i]
    log.verbose(`写入到指定文件:`, currentLocalePath)
    saveLocaleFile(localePack, currentLocalePath)
  })
  log.success(`导入完毕!`)
}

export default execLoadExcel
