import fs from 'fs-extra'
import prettier from 'prettier'
import serialize from 'serialize-javascript'
import { getAbsolutePath } from '../../utils/getAbsolutePath'
import defaultConfig from '../../default.config'
import { CONFIG_FILE_NAME } from '../../utils/constants'

function execInit() {
  const configPath = getAbsolutePath(process.cwd(), CONFIG_FILE_NAME)
  const code = `
    module.exports = ${serialize(defaultConfig, {
      unsafe: true,
    })}
  `
  const stylizedCode = prettier.format(code, {
    singleQuote: true,
    semi: false,
    parser: 'babel',
  })

  fs.outputFileSync(configPath, stylizedCode)
}

export default execInit
