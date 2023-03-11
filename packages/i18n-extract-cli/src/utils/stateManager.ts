import type { Config } from '../../types'
import defaultConfig from '../default.config'

class StateManager {
  private static _instance: StateManager
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  private cliConfig: Config = defaultConfig

  static getInstance() {
    if (!this._instance) {
      this._instance = new StateManager()
    }
    return this._instance
  }

  setCliConfig(config: Config): void {
    this.cliConfig = config
  }
  getCliConfig(): Config {
    return this.cliConfig
  }
}

export default StateManager.getInstance()
