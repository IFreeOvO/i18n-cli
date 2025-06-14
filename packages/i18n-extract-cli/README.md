# 介绍

这是一款能够自动将代码里的中文转成 i18n 国际化标记的命令行工具。当然，你也可以用它实现将中文语言包自动翻译成其他语言。适用于 vue2、vue3 和 react

## 流程设计

见[掘金文章](https://juejin.cn/post/7174082242426175525)

## 功能 🎉

- 支持.mjs.cjs.js.ts.jsx.tsx.vue 后缀文件提取中文
- 支持 vue2.0，vue3.0，react 提取中文
- 支持通过/\*i18n-ignore\*/注释，忽略中文提取
- 支持将提取的中文以 key-value 形式存入\*.json 语言包里
- 支持 prettier 格式化代码
- 支持将中文语言包自动翻译成其他语言
- 支持将翻译结果导出成 excel
- 支持读取 excel 文件并转换成语言包
- 自定义语言包 key 的层级嵌套
- 自定义语言包的 key
- 自定义 i18n 工具的调用对象
- 自定义 i18n 工具的方法名
- 自定义 i18n 第三方包的导入
- 自定义忽略提取的方法

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

| 参数              | 类型    | 默认值                 | 描述                                                                                   |
| ----------------- | ------- | ---------------------- | -------------------------------------------------------------------------------------- |
| -i, --input       | String  | 'src'                  | 指定待提取的文件目录。                                                                 |
| -o, --output      | String  | ''                     | 输出转换后文件路径。没有值时表示完成提取后自动覆盖原始文件。当有值时，会输出到指定目录 |
| -c, --config-file | String  | ''                     | 指定命令行配置文件的所在路径（可以自定义更多功能）                                     |
| --localePath      | String  | './locales/zh-CN.json' | 指定提取的中文语言包所存放的路径。                                                     |
| -v,--verbose      | Boolean | false                  | 控制台打印更多调试信息                                                                 |
| -h,--help         | Boolean | false                  | 查看指令用法                                                                           |
| --skip-extract    | Boolean | false                  | 跳过 i18n 转换阶段。                                                                   |
| --skip-translate  | Boolean | false                  | 跳过中文翻译阶段。                                                                     |
| --locales         | Array   | ['en-US']              | 根据中文语言包自动翻译成其他语言。用法例子 --locales en zh-CHT                         |
| --exportExcel     | Boolean | false                  | 开启后。导出所有翻译内容到 excel。 默认导出到当前目录下的 locales.xlsx                 |
| --excelPath       | String  | './locales.xlsx'       | 指定导出的 excel 路径。                                                                |

## 子命令

| 子命令    | 描述                                      |
| --------- | ----------------------------------------- |
| init      | 在项目里初始化一个命令行配置              |
| loadExcel | 根据导入翻译文件的 excel 内容，生成语言包 |

## 命令行配置

如果有更多的定制需求，可以在项目根目录执行`it init`，创建`i18n.config.js`文件，按自身需求修改完配置后，再执行`it -c i18n.config.js`。（注意：配置文件里参数的优先级比指令参数高）

```js
// 以下为i18n.config.js默认的完整配置，所有属性均为可选，可以根据自身需要修改
module.exports = {
  input: 'src', // 需要转换的文件目录或文件。形式可以是数组，例如['./a.js', 'src']，也可以是字符串，例如'a.js'
  output: '', // 没有值时表示完成提取后自动覆盖原始文件
  exclude: ['**/node_modules/**/*'], // 排除不需要提取的文件
  localePath: './locales/zh-CN.json', // 中文语言包的存放位置
  localeFileType: 'json', // 设置语言包的文件类型，支持js、json。默认为json
  // rules每个属性对应的是不同后缀文件的处理方式
  rules: {
    js: {
      caller: '', // 自定义this.$t('xxx')中的this。不填则默认没有调用对象
      functionName: 't', // 自定义this.$t('xxx')中的$t
      customizeKey: function (key, currentFilePath) {
        return key
      }, // 自定义this.$t('xxx')中的'xxx'部分的生成规则
      customSlot: function (slotValue) {
        return slotValue
      }, // 自定义模版字段串里插槽部分，例如原文为`你好 ${name}`，转换后是t('你好 {name}')，其中转换后的{name}部分，可以通过这个函数定制
      importDeclaration: 'import { t } from "i18n"', // 默认在文件里导入i18n包。不填则默认不导入i18n的包。由于i18n的npm包有很多，用户可根据项目自行修改导入语法
      forceImport: false, // 即使文件没出现中文，也强行插入importDeclaration定义的语句
    },
    // ts,cjs,mjs,jsx,tsx配置方式同上
    ts: {
      caller: '',
      functionName: 't',
      customizeKey: function (key, currentFilePath) {
        return key
      },
      customSlot: function (slotValue) {
        return slotValue
      },
      forceImport: false,
    },
    cjs: {
      caller: '',
      functionName: 't',
      customizeKey: function (key, currentFilePath) {
        return key
      },
      customSlot: function (slotValue) {
        return slotValue
      },
      importDeclaration: 'import { t } from "i18n"',
      forceImport: false,
    },
    mjs: {
      caller: '',
      functionName: 't',
      customizeKey: function (key, currentFilePath) {
        return key
      },
      customSlot: function (slotValue) {
        return slotValue
      },
      importDeclaration: 'import { t } from "i18n"',
      forceImport: false,
    },
    jsx: {
      caller: '',
      functionName: 't',
      customizeKey: function (key, currentFilePath) {
        return key
      },
      customSlot: function (slotValue) {
        return slotValue
      },
      importDeclaration: 'import { t } from "i18n"',
      functionSnippets: '', // react函数组件里，全局加代码片段
      forceImport: false,
    },
    tsx: {
      caller: '',
      functionName: 't',
      customizeKey: function (key, currentFilePath) {
        return key
      },
      customSlot: function (slotValue) {
        return slotValue
      },
      importDeclaration: 'import { t } from "i18n"',
      functionSnippets: '',
      forceImport: false,
    },
    vue: {
      caller: 'this',
      functionNameInTemplate: '$t', // vue这里的配置，仅针对vue的template标签里面的内容生效
      functionNameInScript: '$t', // vue这里的配置，仅针对vue的script部分export default里面的内容生效
      customizeKey: function (key, currentFilePath) {
        return key
      },
      customSlot: function (slotValue) {
        return slotValue
      },
      importDeclaration: '',
      forceImport: false,
      tagOrder: ['template', 'script', 'style'], // 支持自定义vue文件的标签顺序
    },
  },
  globalRule: {
    ignoreMethods: [], // 忽略指定函数调用的中文提取。例如想忽略sensor.track('中文')的提取。这里就写['sensor.track']
  },
  // prettier配置，参考https://prettier.io/docs/en/options.html
  prettier: {
    semi: false,
    singleQuote: true,
  },
  incremental: true, // 开启后。支持将文件中新提取到中文键值对，追加到原有的中文语言包
  skipExtract: false, // 跳过提取中文阶段
  // 以下是和翻译相关的配置，注意搭配使用
  skipTranslate: true, // 跳过翻译语言包阶段。默认不翻译
  translationTextMaxLength: 5000, // 每次请求翻译接口，接口携带参数里翻译原文的最大长度
  locales: [], // 需要翻译的语言包。例如['en', 'zh-CHT']，会自动翻译英文和繁体
  excelPath: './locales.xlsx', // excel存放路径
  exportExcel: false, // 是否导出excel
  // 参数：
  // allKeyValue：已遍历的所有文件的key-value
  // currentFileKeyMap: 当前文件提取到的key-value
  // currentFilePath: 当前遍历的文件路径
  adjustKeyMap(allKeyValue, currentFileKeyMap, currentFilePath) {
    return allKeyValue
  }, // 对提取结构进行二次处理
}
```

具体用法可以点击下方链接参考

- [react 项目实战例子](https://github.com/IFreeOvO/i18n-cli/tree/master/examples/react-demo)

- [vue 项目实战例子](https://github.com/IFreeOvO/i18n-cli/tree/master/examples/vue-demo)

## 举几个栗子 🌰

1. 跳过转换阶段，仅将中文语言包翻译成其他语言(例如英语、中文繁体等)

```bash
it --skip-extract --locales en zh-CHT
```

2. 跳过自动翻译阶段，仅进行 i18n 转换，并将提取到的 key-value 提取到中文语言包

```bash
it --skip-translate
```

3. 使用自定义配置进行 i18n 转换

```bash
it -c ./i18n.config.js
```

4. 指定需要自动翻译的语言(例如日语)，并指定项目里中文语言包的位置(相对于命令的执行位置)。命令执行时会自动根据中文语言包，将日语翻译出来并存入到`ja.json`文件中

```bash
it --localePath ./locales/zh-CN.json  --locales ja
```

5. 导入翻译的 excel 表格，并自动生成对应语言包的 json 文件

excel 的表头格式举例`['字典key', 'zh-CN', 'en-US']`

```bash
# 方式1，根据指令参数导入
it loadExcel --excelPath ./demo.xlsx --localePath ./locales/zh-CN.json
# 方式2，根据本地自定义配置导入
it loadExcel -c ./i18n.config.js
```

6. 将翻译结果导出到 excel 表格

```bash
# 方式1，根据指令参数
it --skip-extract --skip-translate --exportExcel --excelPath ./demo.xlsx
# 方式2，根据本地配置
it --skip-extract --skip-translate  -c ./i18n.config.js
```

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

- 自定义配置里的 js 规则，除了用于处理 js 文件，也会应用到 vue 的模版和 vue`script`标签的非`export default`部分。例如

```js
<script>import a from 'a.js' function b() {a('哈哈哈')}</script>
```

- 自定义配置里的 vue 的`functionNameInScript`规则，仅针对`script`标签的`export default`部分生效。例如

```vue
<script>
export default {
  data: {
    return {
      a: '测试'
    }
  }
}
</script>
```

- 代码转换后，新插入的导入语句中`import { t } from "i18n"`的`i18n`是通过打包工具(如`webpack`)的别名`alias`功能实现的。开发者可以结合自身需求自己定义，通过别名把`i18n`文件指向一个绝对路径

- 导入语句中`import { t } from "i18n"`，其中的`i18n`文件内容要自己去封装实现

- 翻译后，命令行工具自动去掉提取汉字里的回车，这是因为回车会影响翻译准确度。所有原文里如果有回车，请自行校对，在语言包里手动补上回车

- 如果使用的 ts 枚举类型包含中文键，这种情况不支持自动转换，例如

```ts
enum typeEnum {
  '测试',
}
```

需要手动加注释跳过转换

```ts
/* i18n-ignore */
enum typeEnum {
  '测试',
}
```

- type 类型定义里的中文，也不支持自动转换。请用`/*i18n-ignore*/`忽略

```ts
/* i18n-ignore */
type TitleType = '测试'
```

## 开源许可证

[MIT](./LICENSE)
