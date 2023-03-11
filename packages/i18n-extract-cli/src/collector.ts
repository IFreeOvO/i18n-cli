import log from './utils/log'

class Collector {
  private static _instance: Collector
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static getInstance() {
    if (!this._instance) {
      this._instance = new Collector()
    }
    return this._instance
  }

  private keyMap: Record<string, string> = {}

  add(key: string) {
    log.verbose('提取中文：', key)
    this.keyMap[key] = key
  }

  getKeyMap() {
    return this.keyMap
  }

  setKeyMap(value: Record<string, string>) {
    this.keyMap = value
  }
}

export default Collector.getInstance()
