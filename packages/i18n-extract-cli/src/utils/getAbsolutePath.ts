import path from 'path'
import slash from 'slash'

export function getAbsolutePath(...paths: string[]) {
  return slash(path.resolve(...paths))
}
