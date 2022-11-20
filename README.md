# 介绍

该项目是一个自动把中文转成 i18n 函数的前端脚手架工具

## 为什么有这个项目

作者在工作中遇到过对 vue 老项目进行国际化的需求，在这个过程中感觉手动把项目里所有中文替换成 this.$t('xx',xx)非常麻烦，就有了后期想做个自动化提取翻译的想法

## 功能

- [x] 支持.mjs.cjs.js.ts.jsx.tsx.vue 后缀文件提取中文
- [x] 支持 vue2.0，vue3.0，react 提取中文
- [x] 支持通过/\*i18n-ignore\*/注释，忽略中文提取
- [x] 支持将提取的中文以 key-value 形式存入.json 翻译字典里
- [x] 支持 prettier 格式化代码
- [x] 自定义翻译字典的 key
- [x] 自定义 i18n 工具的调用对象
- [x] 自定义 i18n 工具的方法名
- [x] 自定义 i18n 第三方包的导入
- [ ] 支持根据翻译字典(.json 文件)，自动翻译成各国语言(**后期加入**)

## 安装

```
npm i @ifreeovo/i18n-extract-cli -g
```

## 使用

在项目根目录执行下面命令

```
it
```

## 脚手架参数

| 参数              | 类型    | 描述                                                                                       |
| ----------------- | ------- | ------------------------------------------------------------------------------------------ |
| -i, --input       | String  | 可选。指定待提取的文件目录。默认 src                                                       |
| -o, --output      | String  | 可选。输出转换后文件路径。默认''，即完成提取后自动覆盖原始文件。当有值时，会输出到指定目录 |
| -c, --config-file | String  | 可选。指定脚手架配置文件的所在路径（可以自定义更多功能）                                   |
| --localePath      | String  | 可选。指定提取的中文字典所存放的路径。默认存放在'./locales/zh-CN.json'路径                 |
| -v,--verbose      | Boolean | 可选。控制台打印更多调试信息                                                               |
| -h,--help         | Boolean | 可选。查看指令用法                                                                         |

## 脚手架配置

如果有更多的定制需求，可以在项目根目录创建`i18n.config.js`文件，然后执行`it -c i18n.config.js`。（注意：配置文件里参数的优先级比指令参数高）

```js
// 以下为i18n.config.js默认的完整配置，所有属性均为可选，可以根据自身需要修改
module.exports = {
  input: 'src',
  output: '',
  exclude: ['**/node_modules/**/*'], // 排除不需要提取的文件
  localePath: './locales/zh-CN.json', // 中文字典的存放位置
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
}
```

## 开源许可证

[MIT](./LICENSE)
