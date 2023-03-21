import type { StringObject } from '../../types'
import set from 'lodash/set'

export function spreadObject(obj: Record<string, string>): StringObject {
  const newObject: StringObject = {}
  Object.keys(obj).forEach((key) => {
    const keyList = key.split('.')
    set(newObject, keyList, obj[key])
  })
  return newObject
}
