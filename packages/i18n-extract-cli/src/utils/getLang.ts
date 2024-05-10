import fs from 'fs-extra'
import StateManager from './stateManager'
import log from './log'

function getLang(langPath: string): Record<string, string> {
  const localeFileType = StateManager.getToolConfig().localeFileType

  try {
    if (localeFileType === 'json') {
      // json文件直接require拿不到文件内容，故改成下面写法
      const content = fs.readFileSync(langPath).toString()
      return JSON.parse(content)
    } else {
      if (!fs.existsSync(langPath)) {
        log.error(`文件${langPath}不存在`)
        return {}
      }
      // TODO: 因为默认生成的是esm的js文件，先简单处理下。后期还是兼容esm和commonjs比较好
      const str = fs.readFileSync(langPath).toString().replace('export default', 'return')
      const content = new Function(str)()
      return content
    }
  } catch (e) {
    log.error(`读取文件路径${langPath}出错:`, e)
    return {}
  }
}
export default getLang
