import log from './log'
class ErrorLogger {
  private _filerPath?: string

  setFilePath(path: string) {
    this._filerPath = path
  }

  reportFileError(errorMessage: string) {
    log.error(
      `\n解析${this._filerPath}文件时遇到未知错误：\n${errorMessage}\n\n已跳过文件转换，请手动处理`
    )
  }

  reportTemplateError(originSource: string, errorMessage: string) {
    log.error(
      `\n解析${this._filerPath}文件里的模版内容\n${originSource}\n时遇到未知错误：\n${errorMessage}\n\n已跳过此段模版转换，请手动处理`
    )
  }
}

export default new ErrorLogger()
