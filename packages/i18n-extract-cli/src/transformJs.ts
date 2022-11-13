import type { NodePath } from '@babel/traverse'
import type {
  Comment,
  StringLiteral,
  TemplateLiteral,
  ObjectProperty,
  ObjectMethod,
  SpreadElement,
  JSXText,
  JSXAttribute,
  Program,
  ImportDeclaration,
} from '@babel/types'
import type { FileExtension, transformOptions } from '../types'
import traverse from '@babel/traverse'
import babelGenerator from '@babel/generator'
import template from '@babel/template'
import generate from '@babel/generator'
import { includeChinese } from './utils/includeChinese'
import { isObject } from './utils/assertType'

const t = require('@babel/types')

type TemplateLiteralNode = NodePath<TemplateLiteral>['node']
type TemplateParams = {
  [k: string]:
    | string
    | {
        isAstNode: true
        value: TemplateLiteralNode
      }
}

function getObjectExpression(obj: TemplateParams) {
  const ObjectPropertyArr: Array<ObjectMethod | ObjectProperty | SpreadElement> = []
  Object.keys(obj).forEach((k) => {
    const tempValue = obj[k]
    let newValue
    if (isObject(tempValue)) {
      newValue = tempValue.value
    } else {
      newValue = t.identifier(tempValue)
    }
    ObjectPropertyArr.push(t.objectProperty(t.identifier(k), newValue))
  })
  const ast = t.objectExpression(ObjectPropertyArr)
  return generate(ast).code
}

function transformJs(code: string, ext: FileExtension, options: transformOptions) {
  const rule = options.rules[ext]
  let hasImportI18n = false

  function getReplaceValue(key: string, params?: TemplateParams) {
    const { caller, functionName, customizeKey } = rule
    // 表达式结构 obj.fn('xx',{xx:xx})
    let expression
    if (params) {
      expression = `${caller}.${functionName}('${customizeKey(key)})', ${getObjectExpression(
        params
      )})`
    } else {
      expression = `${caller}.${functionName}('${customizeKey(key)}')`
    }
    return template.expression(expression)()
  }

  function getTraverseOptions() {
    return {
      enter(path: NodePath) {
        const leadingComments = path.node.leadingComments
        if (leadingComments) {
          // 是否跳过翻译
          let isSkipTransform = false
          leadingComments.every((comment: Comment) => {
            if (comment.value.includes('i18n-ignore')) {
              isSkipTransform = true
              return false
            }
            return true
          })
          if (isSkipTransform) {
            path.skip()
          }
        }
      },

      StringLiteral(path: NodePath<StringLiteral>) {
        if (includeChinese(path.node.value)) {
          path.replaceWith(getReplaceValue(path.node.value))
        }
        path.skip()
      },

      TemplateLiteral(path: NodePath<TemplateLiteral>) {
        const { node } = path
        const templateMembers = [...node.quasis, ...node.expressions]
        templateMembers.sort((a, b) => (a.start as number) - (b.start as number))

        const shouldReplace = node.quasis.some((node) => includeChinese(node.value.raw))

        if (shouldReplace) {
          let value = ''
          let slotIndex = 1
          const params: TemplateParams = {}
          templateMembers.forEach(function (node) {
            if (node.type === 'Identifier') {
              value += `{${node.name}}`
              params[node.name] = node.name
            } else if (node.type === 'TemplateElement') {
              value += node.value.raw // 用raw防止字符串中出现 /n
            } else {
              // 处理${}内容为表达式的情况。例如`测试${a + b}`，把 a+b 这个语法树作为params的值, 并自定义params的键为slot加数字的形式
              const key = `slot${slotIndex++}`
              value += `{${key}}`
              params[key] = { isAstNode: true, value: node as TemplateLiteralNode }
            }
          })
          path.replaceWith(getReplaceValue(value, params))
        }
        path.skip()
      },

      JSXText(path: NodePath<JSXText>) {
        if (includeChinese(path.node.value)) {
          path.replaceWith(t.JSXExpressionContainer(getReplaceValue(path.node.value)))
        }
        path.skip()
      },

      JSXAttribute(path: NodePath<JSXAttribute>) {
        const node = path.node as NodePath<JSXAttribute>['node']
        const valueType = node.value?.type
        if (valueType === 'StringLiteral' && node.value && includeChinese(node.value.value)) {
          const jsxIdentifier = t.jsxIdentifier(node.name.name)
          const jsxContainer = t.jSXExpressionContainer(getReplaceValue(node.value.value))
          path.replaceWith(t.jsxAttribute(jsxIdentifier, jsxContainer))
          path.skip()
        }
      },

      ImportDeclaration(path: NodePath<ImportDeclaration>) {
        const { importDeclaration } = rule
        const res = importDeclaration.match(/from ["'](.*)["']/)
        const packageName = res ? res[1] : ''

        if (path.node.source.value === packageName) {
          hasImportI18n = true
        }

        if (!hasImportI18n) {
          const importAst = template.statement(importDeclaration)()
          const program = path.parent as Program
          program.body.unshift(importAst)
          hasImportI18n = true
        }
      },
    }
  }

  const ast = options.parse(code)
  traverse(ast, getTraverseOptions())

  const result = babelGenerator(ast)
  // 文件里没有出现任何导入语句的情况
  if (!hasImportI18n) {
    const { importDeclaration } = rule
    result.code = `${importDeclaration}\n${result.code}`
  }
  return result
}

export default transformJs
