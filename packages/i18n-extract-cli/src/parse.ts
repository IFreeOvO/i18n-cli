import path from 'node:path'
import StateManager from './utils/stateManager'

const babel = require('@babel/core')
const presetEnv = require('@babel/preset-env')
const presetReact = require('@babel/preset-react')
const typescriptPresets = require('@babel/preset-typescript')
const pluginSyntaxDecorators = require('@babel/plugin-syntax-decorators')

function langToExtension(lang = 'js') {
  switch (lang.toLowerCase()) {
    case 'js':
    case 'mjs':
    case 'javascript':
      return '.js'
    case 'ts':
    case 'typescript':
      return '.ts'
    case 'jsx':
      return '.jsx'
    case 'tsx':
      return '.tsx'
    default:
      throw new Error(`vue script标签里存在未知的lang属性值: ${lang}`)
  }
}

function getSourceFileName() {
  const sourcePath = StateManager.getCurrentSourcePath()
  const lang = StateManager.getVueScriptLang()
  const ext = path.extname(sourcePath)
  const isVueFile = ext === '.vue'

  const basename = path.basename(sourcePath, ext)
  const filename = isVueFile ? basename + langToExtension(lang) : basename + ext
  return filename
}

export function initParse() {
  return function (code: string) {
    return babel.parseSync(code, {
      ast: true,
      configFile: false,
      filename: getSourceFileName(),
      presets: [presetEnv, presetReact, typescriptPresets],
      plugins: [[pluginSyntaxDecorators, { legacy: true }]],
    })
  }
}
