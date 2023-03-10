import type { Config } from '../../types'

export function setCliConfig(config: Config): void {
  process.env.CLI_CONFIG = JSON.stringify(config)
}

export function getCliConfig(): Config {
  return JSON.parse(process.env.CLI_CONFIG || '')
}
