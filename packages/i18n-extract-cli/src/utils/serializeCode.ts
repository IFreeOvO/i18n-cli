import prettier from 'prettier'
import serialize from 'serialize-javascript'
import StateManager from './stateManager'

export function serializeCode(source: unknown) {
  const prettierConfig = StateManager.getToolConfig().prettier

  const code = `
    module.exports = ${serialize(source, {
      unsafe: true,
    })}
  `
  const stylizedCode = prettier.format(code, {
    ...prettierConfig,
    parser: 'babel',
  })
  return stylizedCode
}
