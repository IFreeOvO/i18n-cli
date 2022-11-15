import log from './utils/log'

class Collector {
  static keyMap: Record<string, string> = {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static add(key: string) {
    log.verbose('提取汉字：', key)
    Collector.keyMap[key] = ''
  }
}

export default Collector
