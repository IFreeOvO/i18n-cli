import fs from 'fs-extra'
import { getAbsolutePath } from '../../utils/getAbsolutePath'
import defaultConfig from '../../default.config'
import { CONFIG_FILE_NAME } from '../../utils/constants'
import { serializeCode } from '../../utils/serializeCode'

function execInit() {
  const configPath = getAbsolutePath(process.cwd(), CONFIG_FILE_NAME)
  const code = serializeCode(defaultConfig, false)

  fs.outputFileSync(configPath, code)
}

export default execInit
