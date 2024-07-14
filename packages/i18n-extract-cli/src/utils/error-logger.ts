import log from './log'
class ErrorLogger {
  private _filerPath = ''

  private _errorList: string[] = []

  private _delimiter = '\n=======================================\n'

  setFilePath(path: string) {
    this._filerPath = path
  }

  reportFileError(errorMessage: string) {
    this._errorList.push(
      `${this._delimiter}解析${this._filerPath}文件时遇到未知错误：\n${errorMessage}\n\n已跳过文件转换，请手动处理${this._delimiter}`
    )
  }

  reportTemplateError(originSource: string, errorMessage: string) {
    this._errorList.push(
      `${this._delimiter}解析${this._filerPath}文件里的模版内容\n${originSource}\n时遇到未知错误：\n${errorMessage}\n\n已跳过此段模版转换，请手动处理${this._delimiter}`
    )
  }

  printErrors() {
    if (this._errorList.length === 0) {
      return
    }
    this._errorList.forEach((err) => {
      log.error(err)
    })
    log.error(
      `总计出现 ${this._errorList.length} 处错误，需要手动处理。建议去issue里反馈相关问题https://github.com/IFreeOvO/i18n-cli/issues，以协助作者完善代码♪(･ω･)ﾉ`
    )
  }
}

export default new ErrorLogger()
