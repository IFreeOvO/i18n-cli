import StateManager from './stateManager'

export function getLocaleDir(): string {
  const { localeFileType, localePath } = StateManager.getToolConfig()
  const reg = new RegExp(`/[A-Za-z-]+.${localeFileType}`, 'g')
  const localeDirPath = localePath.replace(reg, '')
  return localeDirPath
}
