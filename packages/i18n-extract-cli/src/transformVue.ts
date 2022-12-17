import type { SFCScriptBlock, SFCStyleBlock, SFCTemplateBlock } from '@vue/compiler-sfc'
import { parse } from '@vue/compiler-sfc'
import * as htmlparser2 from 'htmlparser2'
import prettier from 'prettier'
import mustache from 'mustache'
import type { Rule } from '../types'
import { includeChinese } from './utils/includeChinese'
import log from './utils/log'
import transformJs from './transformJs'
import { initParse } from './parse'
import Collector from './collector'
import { IGNORE_REMARK } from './utils/constants'
const presetTypescript = require('@babel/preset-typescript')

function parseJsSyntax(source: string, rule: Rule): string {
  const { code } = transformJs(source, 'tsx', {
    rule: {
      ...rule,
      caller: '',
      importDeclaration: '',
    },
    parse: initParse([[presetTypescript, { isTSX: true, allExtensions: true }]]),
  })

  const stylizedCode = prettier.format(code, {
    singleQuote: true,
    semi: false,
    parser: 'babel',
  })
  return stylizedCode.endsWith('\n') ? stylizedCode.slice(0, stylizedCode.length - 1) : stylizedCode
}

function handleTemplate(code: string, rule: Rule): string {
  let htmlString = ''

  function getReplaceValue(key: string): string {
    const { functionName, customizeKey } = rule
    // 表达式结构 $t('xx')
    const expression = `${functionName}('${customizeKey(key)}')`
    return expression
  }

  function formatValue(value: string): string {
    value = value.trim()
    if (value.startsWith('\n')) {
      value = value.slice(1, value.length - 1).trimStart()
    }
    if (value.endsWith('\n')) {
      value = value.slice(0, value.length - 1)
    }
    return value
  }

  let shouldIgnore = false
  const parser = new htmlparser2.Parser(
    {
      onopentag(tagName, attributes) {
        let attrs = ''
        if (shouldIgnore) {
          for (const key in attributes) {
            const attrValue = attributes[key]
            attrs += ` ${key}="${attrValue}" `
          }
          htmlString += `<${tagName} ${attrs}>`
          return
        }

        for (const key in attributes) {
          const attrValue = attributes[key]
          const isVueDirective = key.startsWith(':') || key.startsWith('@') || key.startsWith('v-')
          if (includeChinese(attrValue) && isVueDirective) {
            const source = parseJsSyntax(attrValue, rule)
            // 处理属性类似于:xx="'xx'"，这种属性值不是js表达式的情况。attrValue === source即属性值不是js表达式
            // attrValue.startsWith是为了排除:xx="$t('xx')"的情况
            if (attrValue === source && !attrValue.startsWith(rule.functionName)) {
              Collector.add(removeQuotes(attrValue))
              attrs += ` ${key}="${rule.functionName}(${attrValue})" `
            } else {
              attrs += ` ${key}="${source}" `
            }
          } else if (includeChinese(attrValue) && !isVueDirective) {
            attrs += ` :${key}="${getReplaceValue(attrValue)}" `
            Collector.add(attrValue)
          } else if (isVueDirective && key === 'v-else') {
            attrs += key
          } else {
            attrs += ` ${key}="${attrValue}" `
          }
        }
        htmlString += `<${tagName} ${attrs}>`
      },

      ontext(text) {
        if (shouldIgnore) {
          htmlString += text
          return
        }
        let str = ''
        const tokens = mustache.parse(text)
        for (const token of tokens) {
          const type = token[0]
          let value = token[1]

          if (includeChinese(value)) {
            value = formatValue(value)
            if (type === 'text') {
              str += `{{${getReplaceValue(value)}}}`
              Collector.add(value)
            } else if (type === 'name') {
              const source = parseJsSyntax(value, rule)
              str += `{{${source}}}`
            }
          } else {
            if (type === 'text') {
              str += value
            } else if (type === 'name') {
              str += `{{${value}}}`
            }
          }
        }

        htmlString += str
      },

      onclosetag(tagName, isImplied) {
        shouldIgnore = false
        // 如果是自闭合标签
        if (isImplied) {
          htmlString = htmlString.slice(0, htmlString.length - 2) + '/>'
          return
        }
        htmlString += `</${tagName}>`
      },

      oncomment(comment) {
        if (comment.includes(IGNORE_REMARK)) {
          shouldIgnore = true
        }
        htmlString += `<!--${comment}-->`
      },
    },
    {
      lowerCaseTags: false,
      recognizeSelfClosing: true,
      lowerCaseAttributeNames: false,
      // xmlMode: true,
    }
  )

  parser.write(code)
  parser.end()
  return htmlString
}

function handleScript(source: string, rule: Rule): string {
  const { code } = transformJs(source, 'tsx', {
    rule,
    isJsInVue: true, // 标记处理vue里的js
    parse: initParse([[presetTypescript, { isTSX: true, allExtensions: true }]]),
  })
  return code
}

function mergeCode(templateCode: string, scriptCode: string, stylesCode: string): string {
  return templateCode + '\n' + scriptCode + '\n' + stylesCode
}

function removeQuotes(value: string): string {
  if (['"', "'"].includes(value.charAt(0)) && ['"', "'"].includes(value.charAt(value.length - 1))) {
    value = value.substring(1, value.length - 1)
  }

  return value
}

function getWrapperTemplate(sfcBlock: SFCTemplateBlock | SFCScriptBlock | SFCStyleBlock): string {
  const { type, lang, attrs } = sfcBlock
  let template = `<${type}`

  if (lang) {
    template += ` lang="${lang}"`
  }
  if ((sfcBlock as SFCScriptBlock).setup) {
    template += ` setup`
  }
  if ((sfcBlock as SFCStyleBlock).scoped) {
    template += ` scoped`
  }
  for (const attr in attrs) {
    if (!['lang', 'scoped', 'setup'].includes(attr)) {
      template += ` ${attr}="${attrs[attr]}"`
    }
  }
  template += `>{{&code}}</${type}>`
  return template
}

function transformVue(
  code: string,
  rule: Rule
): {
  code: string
} {
  const { descriptor, errors } = parse(code)
  if (errors.length > 0) {
    log.error('vue文件解析出现错误：', errors[0].toString())
    return {
      code,
    }
  }

  const { template, script, scriptSetup, styles } = descriptor
  let templateCode = ''
  let scriptCode = ''
  let stylesCode = ''

  if (template) {
    const wrapperTemplate = getWrapperTemplate(template)
    const source = handleTemplate(template.content, rule)
    templateCode = mustache.render(wrapperTemplate, {
      code: source,
    })
  }

  if (script) {
    const wrapperTemplate = getWrapperTemplate(script)
    const source = '\n' + handleScript(script.content, rule) + '\n'
    scriptCode = mustache.render(wrapperTemplate, {
      code: source,
    })
  }

  if (scriptSetup) {
    const wrapperTemplate = getWrapperTemplate(scriptSetup)
    const source = '\n' + handleScript(scriptSetup.content, rule) + '\n'
    scriptCode = mustache.render(wrapperTemplate, {
      code: source,
    })
  }

  if (styles) {
    for (const style of styles) {
      const wrapperTemplate = getWrapperTemplate(style)
      const source = style.content
      stylesCode +=
        mustache.render(wrapperTemplate, {
          code: source,
        }) + '\n'
    }
  }

  code = mergeCode(templateCode, scriptCode, stylesCode)
  return {
    code,
  }
}

export default transformVue
