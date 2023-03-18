import fs from 'fs-extra'
import type { StringObject } from '../../types'
import StateManager from './stateManager'
import { serializeCode } from './serializeCode'

export function saveLocaleFile(locale: StringObject, path: string) {
  const { localeFileType } = StateManager.getToolConfig()
  if (!fs.existsSync(path)) {
    fs.ensureFileSync(path)
  }
  if (localeFileType === 'json') {
    fs.writeFileSync(path, JSON.stringify(locale, null, 2), 'utf8')
  } else {
    fs.writeFileSync(path, serializeCode(locale), 'utf8')
  }
}
