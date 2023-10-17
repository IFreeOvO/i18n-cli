import prettier from 'prettier'
import serialize from 'serialize-javascript'

export function serializeCode(source: unknown, isESModule = true) {
  const exportStatement = isESModule ? 'export default' : 'module.exports ='
  const code = `
  ${exportStatement} ${serialize(source, {
    unsafe: true,
  })}
  `
  const stylizedCode = prettier.format(code, {
    semi: false,
    singleQuote: true,
    parser: 'babel',
  })
  return stylizedCode
}
