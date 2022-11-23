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
  CallExpression,
} from '@babel/types'
import type { GeneratorResult } from '@babel/generator'
import type { FileExtension, transformOptions } from '../types'
import traverse from '@babel/traverse'
import babelGenerator from '@babel/generator'
import template from '@babel/template'
import generate from '@babel/generator'
import { includeChinese } from './utils/includeChinese'
import { isObject } from './utils/assertType'
import Collector from './collector'
import { IGNORE_REMARK } from './utils/constants'

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

function getObjectExpression(obj: TemplateParams): string {
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

function transformJs(code: string, ext: FileExtension, options: transformOptions): GeneratorResult {
  const rule = options.rule
  let hasImportI18n = false

  function getReplaceValue(key: string, params?: TemplateParams) {
    const { caller, functionName, customizeKey } = rule
    // 表达式结构 obj.fn('xx',{xx:xx})
    let expression
    if (params) {
      expression = `${caller ? caller + '.' : ''}${functionName}('${customizeKey(
        key
      )})', ${getObjectExpression(params)})`
    } else {
      expression = `${caller ? caller + '.' : ''}${functionName}('${customizeKey(key)}')`
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
            if (comment.value.includes(IGNORE_REMARK)) {
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
          Collector.add(path.node.value)
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
          Collector.add(value)
          path.replaceWith(getReplaceValue(value, params))
        }
        path.skip()
      },

      JSXText(path: NodePath<JSXText>) {
        if (includeChinese(path.node.value)) {
          Collector.add(path.node.value)
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
          Collector.add(node.value.value)
          path.replaceWith(t.jsxAttribute(jsxIdentifier, jsxContainer))
          path.skip()
        }
      },

      CallExpression(path: NodePath<CallExpression>) {
        const { node } = path
        const { caller, functionName } = rule
        const callee = node.callee

        // 无调用对象的情况，例如$t('xx')
        if (callee.type === 'Identifier' && callee.name === functionName) {
          path.skip()
          return
        }

        // 有调用对象的情况，例如this.$t('xx')、i18n.$t('xx)
        if (callee.type === 'MemberExpression') {
          if (callee.property && callee.property.type === 'Identifier') {
            if (callee.property.name === functionName) {
              // 处理形如i18n.$t('xx)的情况
              if (callee.object.type === 'Identifier' && callee.object.name === caller) {
                path.skip()
                return
              }
              // 处理形如this.$t('xx')的情况
              if (callee.object.type === 'ThisExpression' && caller === 'this') {
                path.skip()
                return
              }
            }
          }
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
          const importAst = template.statements(importDeclaration)()
          const program = path.parent as Program
          importAst.forEach((statement) => {
            program.body.unshift(statement)
          })
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
