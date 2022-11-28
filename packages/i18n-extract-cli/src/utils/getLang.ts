function getLang(langPath: string): Record<string, string> {
  try {
    return require(langPath)
  } catch {
    return {}
  }
}
export default getLang
