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
  // 记录每个文件执行提取的次数
  private countOfAdditions = 0

  add(key: string) {
    log.verbose('提取中文：', key)
    this.keyMap[key] = key
    this.countOfAdditions++
  }

  getKeyMap(): Record<string, string> {
    return this.keyMap
  }

  setKeyMap(value: Record<string, string>) {
    this.keyMap = value
  }

  resetCountOfAdditions() {
    this.countOfAdditions = 0
  }

  getCountOfAdditions(): number {
    return this.countOfAdditions
  }
}

export default Collector.getInstance()
