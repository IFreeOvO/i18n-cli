import fs from 'fs-extra'

function getLang(langPath: string): Record<string, string> {
  try {
    const content = fs.readFileSync(langPath).toString()
    return JSON.parse(content)
  } catch {
    return {}
  }
}
export default getLang
