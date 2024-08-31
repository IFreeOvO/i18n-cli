import { NodePath } from '@babel/traverse'
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
  ObjectExpression,
  MemberExpression,
  Expression,
  ArrowFunctionExpression,
  Node,
  ReturnStatement,
  FunctionExpression,
  FunctionDeclaration,
  Statement,
} from '@babel/types'
import type { GeneratorResult } from '@babel/generator'
import type { transformOptions } from '../types'
import { types as t } from '@babel/core'
import traverse from '@babel/traverse'
import babelGenerator from '@babel/generator'
import template from '@babel/template'
import isEmpty from 'lodash/isEmpty'
import Collector from './collector'
import { includeChinese } from './utils/includeChinese'
import { isObject } from './utils/assertType'
import { IGNORE_REMARK } from './utils/constants'
import StateManager from './utils/stateManager'

type TemplateParams = {
  [k: string]:
    | string
    | {
        isAstNode: true
        value: Expression
      }
}

function getObjectExpression(obj: TemplateParams): ObjectExpression {
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
  return ast
}

// 判断节点是否是props属性的默认值
function isPropNode(path: NodePath<StringLiteral>): boolean {
  const objWithProps = path.parentPath?.parentPath?.parentPath?.parentPath?.parent
  const rootNode =
    path.parentPath?.parentPath?.parentPath?.parentPath?.parentPath?.parentPath?.parent
  let isMeetProp = false
  let isMeetKey = false
  let isMeetContainer = false
  // 属性是否包含在props结构里
  if (
    objWithProps &&
    objWithProps.type === 'ObjectProperty' &&
    objWithProps.key.type === 'Identifier' &&
    objWithProps.key.name === 'props'
  ) {
    isMeetProp = true
  }
  // 对应key是否是default
  if (
    path.parent &&
    path.parent.type === 'ObjectProperty' &&
    path.parent.key.type === 'Identifier' &&
    path.parent.key.name === 'default'
  ) {
    isMeetKey = true
  }
  // 遍历到指定层数后是否是导出声明
  if (rootNode && rootNode.type === 'ExportDefaultDeclaration') {
    isMeetContainer = true
  }
  return isMeetProp && isMeetKey && isMeetContainer
}

function getStringLiteral(value: string): StringLiteral {
  return Object.assign(t.stringLiteral(value), {
    extra: {
      raw: `'${value}'`,
      rawValue: value,
    },
  })
}

function nodeToCode(node: Node): string {
  return babelGenerator(node).code
}

// 允许往react函数组件中加入自定义代码
function insertSnippets(node: ArrowFunctionExpression | FunctionExpression, snippets?: string) {
  if (node.body.type === 'BlockStatement' && snippets) {
    const returnStatement = node.body.body.find((node: Node) => node.type === 'ReturnStatement')

    if (returnStatement) {
      // TODO: 这里判断是否包含snippet，不严谨，推荐节点判断
      const arg = (returnStatement as ReturnStatement).argument
      const statements = template.statements(snippets)()
      const source = nodeToCode(node.body).replace(/[\n\s]/g, '')

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]
        const snippet = nodeToCode(statement).replace(/[\n\s]/g, '')

        // 只插入不存在的snippet
        if (!source.includes(snippet)) {
          pushStatement(node, arg, statement)
        }
      }
    }
  }
}

function pushStatement(
  node: ArrowFunctionExpression | FunctionExpression,
  arg: Expression | null | undefined,
  statement: Statement
) {
  // 函数是否是react函数组件
  // 情况1: 返回的三元表达式包含JSXElement
  // 情况2: 直接返回了JSXElement

  const argType = arg?.type
  const code = nodeToCode(node)
  if (
    argType === 'ConditionalExpression' &&
    (arg.consequent.type === 'JSXElement' || arg.alternate.type === 'JSXElement')
  ) {
    if (includeChinese(code) && node.body.type === 'BlockStatement') {
      node.body.body.unshift(statement)
    }
  } else if (argType === 'JSXElement' && node.body.type === 'BlockStatement') {
    node.body.body.unshift(statement)
  }
}

function transformJs(code: string, options: transformOptions): GeneratorResult {
  const { rule } = options
  const {
    caller,
    functionName,
    customizeKey,
    customSlot,
    importDeclaration,
    functionSnippets,
    forceImport,
  } = rule
  let hasImportI18n = false // 文件是否导入过i18n
  let hasTransformed = false // 文件里是否存在中文转换，有的话才有必要导入i18n

  function getCallExpression(identifier: string, quote = "'"): string {
    const callerName = caller ? caller + '.' : ''
    const expression = `${callerName}${functionName}(${quote}${identifier}${quote})`
    return expression
  }

  function getReplaceValue(translationKey: string, params?: TemplateParams) {
    if (!functionName) {
      throw new Error('functionName is required')
    }
    // 表达式结构 obj.fn('xx',{xx:xx})
    let expression
    // i18n标记有参数的情况
    if (params) {
      const keyLiteral = getStringLiteral(translationKey)
      if (caller) {
        return t.callExpression(
          t.memberExpression(t.identifier(caller), t.identifier(functionName)),
          [keyLiteral, getObjectExpression(params)]
        )
      } else {
        return t.callExpression(t.identifier(functionName), [
          keyLiteral,
          getObjectExpression(params),
        ])
      }
    } else {
      // i18n标记没参数的情况
      expression = getCallExpression(translationKey)
      return template.expression(expression)()
    }
  }

  function transformAST(code: string, options: transformOptions) {
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
          // raw可以拿到未转义的原始文本。例如\u4E00，用raw获取时是'\u4E00'。用value获取的是'一'
          const value = path.node.extra
            ? (path.node.extra.raw as string).slice(1, -1)
            : path.node.value
          // 处理vue props里的中文
          if (includeChinese(value) && options.isJsInVue && isPropNode(path)) {
            const translationKey = Collector.add(value, customizeKey)
            const expression = `function() {
              return ${getCallExpression(translationKey)}
            }`

            path.replaceWith(template.expression(expression)())
            path.skip()
            return
          }

          if (includeChinese(value)) {
            hasTransformed = true
            const translationKey = Collector.add(value, customizeKey)
            path.replaceWith(getReplaceValue(translationKey))
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
                value += customSlot(node.name)
                params[node.name] = node.name
              } else if (node.type === 'TemplateElement') {
                value += node.value.raw.replace(/[\r\n]/g, '') // 用raw防止字符串中出现 /n
              } else if (node.type === 'MemberExpression') {
                const key = `slot${slotIndex++}`
                value += customSlot(key)
                params[key] = {
                  isAstNode: true,
                  value: node as MemberExpression,
                }
              } else {
                // 处理${}内容为表达式的情况。例如`测试${a + b}`，把 a+b 这个语法树作为params的值, 并自定义params的键为slot加数字的形式
                const key = `slot${slotIndex++}`
                value += customSlot(key)
                const expression = babelGenerator(node).code
                const tempAst = transformAST(expression, options) as any
                const expressionAst = tempAst.program.body[0].expression
                params[key] = {
                  isAstNode: true,
                  value: expressionAst,
                }
              }
            })
            hasTransformed = true
            const translationKey = Collector.add(value, customizeKey)
            const slotParams = isEmpty(params) ? undefined : params
            path.replaceWith(getReplaceValue(translationKey, slotParams))
          }
        },

        JSXText(path: NodePath<JSXText>) {
          const value = path.node.value
          if (includeChinese(value)) {
            hasTransformed = true
            const translationKey = Collector.add(value.trim(), customizeKey)
            path.replaceWith(t.jSXExpressionContainer(getReplaceValue(translationKey)))
          }
          path.skip()
        },

        JSXAttribute(path: NodePath<JSXAttribute>) {
          const node = path.node as NodePath<JSXAttribute>['node']
          const valueType = node.value?.type
          if (valueType === 'StringLiteral' && node.value && includeChinese(node.value.value)) {
            const value = node.value.value
            const translationKey = Collector.add(value, customizeKey)
            const jsxIdentifier = t.jsxIdentifier(node.name.name as string)
            const jsxContainer = t.jSXExpressionContainer(getReplaceValue(translationKey))
            hasTransformed = true
            path.replaceWith(t.jsxAttribute(jsxIdentifier, jsxContainer))
            path.skip()
          }
        },

        CallExpression(path: NodePath<CallExpression>) {
          const { node } = path
          const callee = node.callee

          // 根据全局配置，跳过不需要提取的函数
          const globalRule = StateManager.getToolConfig().globalRule
          const code = nodeToCode(node)
          globalRule.ignoreMethods.forEach((ignoreRule) => {
            if (code.startsWith(ignoreRule)) {
              path.skip()
              return
            }
          })

          // 跳过console.log的提取
          if (
            callee.type === 'MemberExpression' &&
            callee.object.type === 'Identifier' &&
            callee.object.name === 'console'
          ) {
            path.skip()
            return
          }

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
          const res = importDeclaration.match(/from ["'](.*)["']/)
          const packageName = res ? res[1] : ''

          if (path.node.source.value === packageName) {
            hasImportI18n = true
          }

          if (!hasImportI18n && hasTransformed) {
            const importAst = template.statements(importDeclaration)()
            const program = path.parent as Program
            importAst.forEach((statement) => {
              program.body.unshift(statement)
            })
            hasImportI18n = true
          }
        },

        ArrowFunctionExpression(path: NodePath<ArrowFunctionExpression>) {
          const { node } = path
          // 函数组件必须在代码最外层
          if (path.parentPath.scope.block.type !== 'Program') {
            return
          }
          // 允许往react函数组件中加入自定义代码
          insertSnippets(node, functionSnippets)
        },
        FunctionDeclaration(path: NodePath<FunctionDeclaration>) {
          const { node } = path
          // 函数组件必须在代码最外层
          if (path.parentPath.scope.block.type !== 'Program') {
            return
          }
          // 允许往react函数组件中加入自定义代码
          insertSnippets(node as any, functionSnippets)
        },
        FunctionExpression(path: NodePath<FunctionExpression>) {
          const { node } = path
          // 函数组件必须在代码最外层
          if (path.parentPath.scope.block.type !== 'Program') {
            return
          }
          // 允许往react函数组件中加入自定义代码
          insertSnippets(node, functionSnippets)
        },

        ObjectProperty(path: NodePath<ObjectProperty>) {
          if (t.isStringLiteral(path.node.key)) {
            if (includeChinese(path.node.key.value)) {
              hasTransformed = true
              const translationKey = Collector.add(path.node.key.value, customizeKey)
              path.replaceWith(
                t.objectProperty(
                  getReplaceValue(translationKey),
                  path.node.value,
                  true,
                  path.node.shorthand,
                  path.node.decorators
                )
              )
            }
          }
        },

        ObjectMethod(path: NodePath<ObjectMethod>) {
          if (t.isStringLiteral(path.node.key)) {
            if (includeChinese(path.node.key.value)) {
              hasTransformed = true
              const translationKey = Collector.add(path.node.key.value, customizeKey)
              path.replaceWith(
                t.objectMethod(
                  path.node.kind,
                  getReplaceValue(translationKey),
                  path.node.params,
                  path.node.body,
                  true,
                  path.node.generator,
                  path.node.async
                )
              )
            }
          }
        },
      }
    }

    const ast = options.parse(code)
    traverse(ast, getTraverseOptions())
    return ast
  }

  const ast = transformAST(code, options)
  const result = babelGenerator(ast, {
    compact: false,
    retainLines: true,
  })
  // 文件里没有出现任何导入语句的情况
  if (!hasImportI18n && hasTransformed) {
    result.code = `${importDeclaration}\n${result.code}`
  }
  // 有forceImport时，即使没发生中文提取，也要在文件里加入i18n导入语句
  if (!hasImportI18n && !hasTransformed && forceImport) {
    result.code = `${importDeclaration}\n${result.code}`
  }
  return result
}

export default transformJs
