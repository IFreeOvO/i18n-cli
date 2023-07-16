import fs from 'fs-extra'
import merge from 'lodash/merge'

import { deepPartial, CommandOptions, Config } from '../../types/index'
import defaultConfig from '../default.config'
import { getAbsolutePath } from './getAbsolutePath'
import log from './log'

function getUserConfig(configFile?: string): deepPartial<Config> {
  if (configFile) {
    const configPath = getAbsolutePath(process.cwd(), configFile)
    if (!fs.existsSync(configPath)) {
      log.warning('配置文件路径不存在，请重新设置指令参数 -c 或 --config-file 的值')
      return {}
    } else {
      const config = require(configPath)
      // prettier为true时删除，是为了走默认的配置
      if (config.prettier === true) {
        delete config.prettier
      }
      return config
    }
  } else {
    return {}
  }
}

export function getI18nConfig(options: CommandOptions): Config {
  const userConfig = getUserConfig(options.configFile)
  const config = merge(defaultConfig, options, userConfig)
  return config
}
