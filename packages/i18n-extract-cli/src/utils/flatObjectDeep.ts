import type { StringObject } from '../../types'
import { isObject } from './assertType'

/**
 * @example
 * 将{a: {bb: 1}} 转成 {'a.bb': 1}
 */
export function flatObjectDeep(data: StringObject): Record<string, string> {
  const keyValueMap: Record<string, string> = {}
  function collectMap(obj: StringObject, upperKey?: string) {
    Object.keys(obj).forEach((key) => {
      const currentKey = upperKey ? `${upperKey}.${key}` : key
      const value = obj[key]
      if (isObject(value)) {
        collectMap(value, currentKey)
      } else {
        keyValueMap[currentKey] = value
      }
    })
  }
  collectMap(data)
  return keyValueMap
}
