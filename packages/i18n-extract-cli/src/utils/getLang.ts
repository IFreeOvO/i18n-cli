import fs from 'fs-extra'
import StateManager from './stateManager'

function getLang(langPath: string): Record<string, string> {
  const localeFileType = StateManager.getCliConfig().localeFileType

  try {
    if (localeFileType === 'json') {
      // json文件直接require拿不到文件内容，故改成下面写法
      const content = fs.readFileSync(langPath).toString()
      return JSON.parse(content)
    } else {
      const content = require(langPath)
      return content
    }
  } catch {
    return {}
  }
}
export default getLang
