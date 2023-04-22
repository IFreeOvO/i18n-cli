import prettier from 'prettier'
import serialize from 'serialize-javascript'

export function serializeCode(source: unknown) {
  const code = `
  export default ${serialize(source, {
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
