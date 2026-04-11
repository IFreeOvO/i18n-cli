import { describe, it, expect, beforeEach } from 'vitest'
import transformJs from '../transformJs'
import { initParse } from '../parse'
import Collector from '../collector'
import StateManager from '../utils/stateManager'
import type { transformOptions } from '../../types'

function getDefaultOptions(): transformOptions {
  StateManager.setCurrentSourcePath('test.ts')
  return {
    rule: {
      caller: '',
      functionName: 't',
      customizeKey: (key: string) => key,
      customSlot: (slotValue: string) => `{${slotValue}}`,
      importDeclaration: 'import { t } from "i18n"',
    },
    parse: initParse(),
  }
}

function resetCollector() {
  Collector.setKeyMap({})
  Collector.resetCountOfAdditions()
  Collector.resetCurrentFileKeyMap()
  Collector.setCurrentCollectorPath('')
}

describe('transformJs - TemplateLiteral', () => {
  beforeEach(() => {
    resetCollector()
  })

  it('应该正常提取普通模板字符串中的中文', () => {
    const code = 'const msg = `你好${name}`'
    const result = transformJs(code, getDefaultOptions())
    expect(result.code).toContain("t('你好{name}'")
    const keyMap = Collector.getKeyMap()
    expect(keyMap).toHaveProperty('你好{name}')
  })

  it('应该跳过包含 HTML 标签的模板字符串 (issue #180)', () => {
    const code = `
export const getAirspacePopup = (data) => {
  const { areaType, lowerHeight, upperHeight, startTime, endTime } = data
  const typeLabel = 'test'

  return \`<div style="max-width: 320px;">
    <div>类型：\${typeLabel}</div>
    <div>高度：\${lowerHeight}-\${upperHeight}m</div>
    <div>时间：\${startTime}-\${endTime}</div>
  </div>\`
}
`
    transformJs(code, getDefaultOptions())
    const keyMap = Collector.getKeyMap()

    const keys = Object.keys(keyMap)
    for (const key of keys) {
      expect(key).not.toMatch(/<div/)
      expect(key).not.toMatch(/<\/div>/)
    }
  })

  it('应该跳过简单的 HTML 模板字符串', () => {
    const code = 'const html = `<p>测试文本</p>`'
    transformJs(code, getDefaultOptions())
    const keyMap = Collector.getKeyMap()

    const keys = Object.keys(keyMap)
    for (const key of keys) {
      expect(key).not.toMatch(/<p>/)
      expect(key).not.toMatch(/<\/p>/)
    }
  })

  it('不应该跳过不包含 HTML 标签的模板字符串', () => {
    const code = 'const msg = `测试${value}内容`'
    const result = transformJs(code, getDefaultOptions())
    expect(result.code).toContain("t('测试{value}内容'")
  })

  it('不应该跳过仅包含尖括号但非 HTML 标签的模板字符串', () => {
    const code = 'const msg = `数量 > ${count} 且 < ${max}`'
    transformJs(code, getDefaultOptions())
    const keyMap = Collector.getKeyMap()
    expect(Object.keys(keyMap).length).toBeGreaterThan(0)
  })

  it('应该跳过自闭合 HTML 标签的模板字符串', () => {
    const code = 'const html = `<img src="test.png" alt="图片" />`'
    transformJs(code, getDefaultOptions())
    const keyMap = Collector.getKeyMap()
    const keys = Object.keys(keyMap)
    for (const key of keys) {
      expect(key).not.toMatch(/<img/)
    }
  })

  it('应该跳过带 MemberExpression 插值的 HTML 模板字符串', () => {
    const code = `const html = \`<span>名称：\${obj.name}</span>\``
    transformJs(code, getDefaultOptions())
    const keyMap = Collector.getKeyMap()
    expect(Object.keys(keyMap).length).toBe(0)
  })

  it('应该跳过带复杂表达式插值的 HTML 模板字符串', () => {
    const code = `const html = \`<div>结果：\${a + b}</div>\``
    transformJs(code, getDefaultOptions())
    const keyMap = Collector.getKeyMap()
    expect(Object.keys(keyMap).length).toBe(0)
  })

  it('应该正常提取含中文但无 HTML 的多插值模板字符串', () => {
    const code = 'const msg = `共${total}条，当前第${page}页`'
    const result = transformJs(code, getDefaultOptions())
    expect(result.code).toContain('t(')
    const keyMap = Collector.getKeyMap()
    expect(Object.keys(keyMap).length).toBe(1)
    const key = Object.keys(keyMap)[0]
    expect(key).toContain('共')
    expect(key).toContain('页')
    expect(key).not.toMatch(/</)
  })

  it('应该正常处理纯中文无插值的模板字符串', () => {
    const code = 'const msg = `你好世界`'
    const result = transformJs(code, getDefaultOptions())
    expect(result.code).toContain("t('你好世界')")
  })
})

describe('transformJs - StringLiteral', () => {
  beforeEach(() => {
    resetCollector()
  })

  it('应该正常提取普通字符串中的中文', () => {
    const code = "const msg = '你好世界'"
    const result = transformJs(code, getDefaultOptions())
    expect(result.code).toContain("t('你好世界')")
  })

  it('不应该提取不包含中文的字符串', () => {
    const code = "const msg = 'hello world'"
    const result = transformJs(code, getDefaultOptions())
    expect(result.code).not.toContain('t(')
    const keyMap = Collector.getKeyMap()
    expect(Object.keys(keyMap).length).toBe(0)
  })
})
