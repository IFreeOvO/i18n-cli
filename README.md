![下载](https://img.shields.io/npm/dw/@ifreeovo/i18n-extract-cli)

# 介绍

该项目是一个支持将中文替换成 i18n 国际化标记，并支持自动翻译的命令行工具

## 流程设计

见[掘金文章](https://juejin.cn/post/7174082242426175525)

## 功能

- [x] 支持.mjs.cjs.js.ts.jsx.tsx.vue 后缀文件提取中文
- [x] 支持 vue2.0，vue3.0，react 提取中文
- [x] 支持通过/\*i18n-ignore\*/注释，忽略中文提取
- [x] 支持将提取的中文以 key-value 形式存入\*.json 语言包里
- [x] 支持 prettier 格式化代码
- [x] 支持将中文语言包自动翻译成其他语言
- [x] 支持将翻译结果导出成 excel
- [x] 支持读取 excel 文件并转换成语言包
- [x] 自定义语言包 key 的层级嵌套
- [x] 自定义语言包的 key
- [x] 自定义 i18n 工具的调用对象
- [x] 自定义 i18n 工具的方法名
- [x] 自定义 i18n 第三方包的导入
- [x] 自定义忽略提取的方法

## 安装

```
npm i @ifreeovo/i18n-extract-cli -g
```

## 使用文档

[点击这里](https://github.com/IFreeOvO/i18n-cli/tree/master/packages/i18n-extract-cli)

## 转换效果示例

#### react 转换示例

转换前

```jsx
import { useState } from 'react'

/*i18n-ignore*/
const b = '被忽略提取的文案'

function Example() {
  const [msg, setMsg] = useState('你好')

  return (
    <div>
      <p title="标题">{msg + '呵呵'}</p>
      <button onClick={() => setMsg(msg + '啊')}>点击</button>
    </div>
  )
}

export default Example
```

转换后

```jsx
import { t } from 'i18n'
import { useState } from 'react'

/*i18n-ignore*/
const b = '被忽略提取的文案'

function Example() {
  const [msg, setMsg] = useState(t('你好'))
  return (
    <div>
      <p title={t('标题')}>{msg + t('呵呵')}</p>
      <button onClick={() => setMsg(msg + t('啊'))}>{t('点击')}</button>
    </div>
  )
}
export default Example
```

#### vue 转换示例

转换前

```vue
<template>
  <div :label="'标签'" :title="1 + '标题'">
    <p title="测试注释">内容</p>
    <button @click="handleClick('信息')">点击</button>
  </div>
</template>

<script>
export default {
  methods: {
    handleClick() {
      console.log('点了')
    },
  },
}
</script>
```

转换后

```vue
<template>
  <div :label="$t('标签')" :title="1 + $t('标题')">
    <p :title="$t('测试注释')">{{ $t('内容') }}</p>
    <button @click="handleClick($t('信息'))">{{ $t('点击') }}</button>
  </div>
</template>
<script>
export default {
  methods: {
    handleClick() {
      console.log(this.$t('点了'))
    },
  },
}
</script>
```

## 开源许可证

[MIT](./LICENSE)
