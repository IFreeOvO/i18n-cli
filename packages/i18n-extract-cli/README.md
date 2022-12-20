# 介绍

这是一个支持自动将中文替换成 i18n 国际化标记的命令行工具

## 流程设计

见[掘金文章](https://juejin.cn/post/7174082242426175525)

## 功能

- 支持.mjs.cjs.js.ts.jsx.tsx.vue 后缀文件提取中文
- 支持 vue2.0，vue3.0，react 提取中文
- 支持通过/\*i18n-ignore\*/注释，忽略中文提取
- 支持将提取的中文以 key-value 形式存入\*.json 语言包里
- 支持 prettier 格式化代码
- 支持将中文语言包自动翻译成其他语言
- 自定义语言包的 key
- 自定义 i18n 工具的调用对象
- 自定义 i18n 工具的方法名
- 自定义 i18n 第三方包的导入

## 安装

```
npm i @ifreeovo/i18n-extract-cli -g
```

## 使用

在项目根目录执行下面命令

```
it
```

## 指令参数

| 参数              | 类型    | 描述                                                                                       |
| ----------------- | ------- | ------------------------------------------------------------------------------------------ |
| -i, --input       | String  | 可选。指定待提取的文件目录。默认 src                                                       |
| -o, --output      | String  | 可选。输出转换后文件路径。默认''，即完成提取后自动覆盖原始文件。当有值时，会输出到指定目录 |
| -c, --config-file | String  | 可选。指定命令行配置文件的所在路径（可以自定义更多功能）                                   |
| --localePath      | String  | 可选。指定提取的中文语言包所存放的路径。默认存放在'./locales/zh-CN.json'路径               |
| -v,--verbose      | Boolean | 可选。控制台打印更多调试信息                                                               |
| -h,--help         | Boolean | 可选。查看指令用法                                                                         |
| --skip-extract    | Boolean | 可选。跳过中文提取阶段                                                                     |
| --skip-translate  | Boolean | 可选。跳过中文翻译阶段                                                                     |
| --locales         | Array   | 可选。根据中文语言包自动翻译成其他语言。用法例子 --locales en zh-CHT                       |

## 子命令

| 子命令 | 描述                         |
| ------ | ---------------------------- |
| init   | 在项目里初始化一个命令行配置 |

## 命令行配置

如果有更多的定制需求，可以在项目根目录执行`it init`，创建`i18n.config.js`文件，按自身需求修改完配置后，再执行`it -c i18n.config.js`。（注意：配置文件里参数的优先级比指令参数高）

```js
// 以下为i18n.config.js默认的完整配置，所有属性均为可选，可以根据自身需要修改
module.exports = {
  input: 'src',
  output: '',
  exclude: ['**/node_modules/**/*'], // 排除不需要提取的文件
  localePath: './locales/zh-CN.json', // 中文语言包的存放位置
  // rules每个属性对应的是不同后缀文件的处理方式
  rules: {
    js: {
      caller: '', // 自定义this.$t('xxx')中的this。不填则默认没有调用对象
      functionName: 't', // 自定义this.$t('xxx')中的$t
      customizeKey: function (key) {
        return key
      }, // 自定义this.$t('xxx')中的'xxx'部分的生成规则
      importDeclaration: 'import { t } from "i18n"', // 默认在文件里导入i18n包。不填则默认不导入i18n的包。由于i18n的npm包有很多，用户可根据项目自行修改导入语法
    },
    // ts,cjs,mjs,jsx,tsx配置方式同上
    ts: {
      caller: '',
      functionName: 't',
      customizeKey: function (key) {
        return key
      },
      importDeclaration: 'import { t } from "i18n"',
    },
    cjs: {
      caller: '',
      functionName: 't',
      customizeKey: function (key) {
        return key
      },
      importDeclaration: 'import { t } from "i18n"',
    },
    mjs: {
      caller: '',
      functionName: 't',
      customizeKey: function (key) {
        return key
      },
      importDeclaration: 'import { t } from "i18n"',
    },
    jsx: {
      caller: '',
      functionName: 't',
      customizeKey: function (key) {
        return key
      },
      importDeclaration: 'import { t } from "i18n"',
    },
    tsx: {
      caller: '',
      functionName: 't',
      customizeKey: function (key) {
        return key
      },
      importDeclaration: 'import { t } from "i18n"',
    },
    vue: {
      caller: 'this',
      functionName: '$t',
      customizeKey: getCustomizeKey,
      importDeclaration: '',
    },
  },
  // prettier配置，参考https://prettier.io/docs/en/options.html
  prettier: {
    semi: false,
    singleQuote: true,
  },
  skipExtract: false, // 跳过提取中文阶段
  // 以下是和翻译相关的配置，注意搭配使用
  skipTranslate: true, // 跳过翻译语言包阶段。默认不翻译
  locales: [], // 需要翻译的语言包。例如['en', 'zh-CHT']，会自动翻译英文和繁体
  translator: '', // 支持有道和谷歌翻译，填'youdao'或'google'。
  google: {
    // translator值为'google'时，则必填以下属性
    proxy: '', // vpn代理地址
  },
  youdao: {
    // translator值为'youdao'时，则必填以下属性
    key: '', // 有道的appId
    secret: '', // 有道的appSecret
  },
}
```

具体用法可以点击下方链接参考

- [react 项目实战例子](https://github.com/IFreeOvO/i18n-cli/tree/master/examples/react-demo)

- [vue 项目实战例子](https://github.com/IFreeOvO/i18n-cli/tree/master/examples/vue-demo)

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

## 注意事项

使用 ts 的 vue 项目请将下面形式语法

```ts
@Component
export default class Home extends Vue {}
```

手动改写成

```ts
@Component
class Home extends Vue {}
export default Home
```

避免解析时报错

## 开源许可证

[MIT](./LICENSE)
