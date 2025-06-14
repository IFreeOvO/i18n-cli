import { statSync } from 'node:fs'

export default function isDirectory(filePath: string): boolean {
  return statSync(filePath).isDirectory()
}
