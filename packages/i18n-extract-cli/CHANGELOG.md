# @ifreeovo/i18n-extract-cli

## 3.0.4

### Patch Changes

- 4da8b80: 修复 vue 模版转换后中文缺失

## 3.0.3

### Patch Changes

- 21ee5a0: vue 模版里有忽略提取的注释标记时,被忽略的部分转换后会多出重复属性

## 3.0.2

### Patch Changes

- 39eee88: vue 模版里字符转义问题
- 2368c98: 修复字符串中回车替换问题

## 3.0.1

### Patch Changes

- 0d6f9cc: 去掉语言包 key 里面的回车
- 819444e: 批量翻译后,会缺失一些译文

## 3.0.0

### Major Changes

- b3fba08: 修改 vue 规则配置
- 4516e6d: 修改 js 类型语言包中的导出语句
- 20be77e: 翻译支持批量翻译 5000 个字符

## 2.7.1

### Patch Changes

- 2795c88: vue 模版注释节点后面,转换后会多一行
- 4032d0a: 转换后 vue 模版文本节点里的空格会丢失

## 2.7.0

### Minor Changes

- 39f8e47: 支持强制插入 importDeclaration 配置的内容

## 2.6.1

### Patch Changes

- a3dba41: 翻译文本中包含'|'符号时,页面展示会丢失'|'后面的内容

## 2.6.0

### Minor Changes

- 72c9dad: 支持关闭 prettier

### Patch Changes

- fe49810: 修复空行丢失问题

## 2.5.1

### Patch Changes

- aaa5cc3: 没有支持多层级语言包的翻译
- aaa5cc3: 没有支持多层级语言包的导入导出
- 384c3fd: vue 模版中{{!xxx}}语法转换后会丢失

## 2.5.0

### Minor Changes

- 864c72f: 提取失败的文件可以打印在日志中
- 1d67e33: 支持自定义提取结果的层级

## 2.4.4

### Patch Changes

- 1ff520b: 解析 vue 模版时，无法区分空字符串属性和布尔属性的问题

## 2.4.3

### Patch Changes

- 5b695c5: vue 模版标签属性为空字符串时，会生成错误的属性
- 9233c13: 文本节点里包含某些三元表达式会解析报错

## 2.4.2

### Patch Changes

- 14928bb: 解析@Component({})时报错

## 2.4.1

### Patch Changes

- 8cbef02: 中文提取后，表达式前面会多出一个分号
- e1ecfe7: vue 模版属性里有双引号时解析报错
- 57dfd05: 中文出现\n 时，执行命令会报错

## 2.4.0

### Minor Changes

- 11fd67f: 支持加载 excel
- 2bb91c6: 支持设置语言包文件类型

## 2.3.1

### Patch Changes

- d8deab0: 没有发生提取替换的文件不需要进行修改
- d8deab0: vue 文件中的非 export default 部分应该按 js 规则解析

## 2.3.0

### Minor Changes

- 970d49c: 支持自定义忽略的方法

## 2.2.1

### Patch Changes

- 9932fd9: 应该跳过 console.log 的转换

## 2.2.0

### Minor Changes

- 134ddbf: react 函数组件支持插入代码

## 2.1.3

### Patch Changes

- 752e918: 多语言文件的自定义 key 未生效

## 2.1.2

### Patch Changes

- a5e13da: 中文语言包存在的情况下进行翻译，其他语言包不会新增 key-value

## 2.1.1

### Patch Changes

- 94f6327: vue 模版属性值如果已经被转换过，不应该再进行二次转换
- 5232efb: 修复 replaceAll 方法报错

## 2.1.0

### Minor Changes

- 76f8bd2: 支持增量提取中文到中文语言包

## 2.0.0

### Major Changes

- 847d9b1: 修改命令行交互

## 1.3.13

### Patch Changes

- 5e11170: 修复字符串中的引号未转义

## 1.3.12

### Patch Changes

- 948b08e: 修复模板字符串里表达式存在大写单词会报错的问题

## 1.3.11

### Patch Changes

- d64b33f: 修复 vue 动态类名转换报错

## 1.3.10

### Patch Changes

- 429cb25: vue2 中@Component 的处理逻辑问题

## 1.3.9

### Patch Changes

- 62ecdc2: 进度条插件的安装报错

## 1.3.8

### Patch Changes

- 2df0472: 修复进度条插件的安装报错

## 1.3.7

### Patch Changes

- 0850fd2: 修复 vue 使用 ts 组件声明的转换问题
- 6906921: 修复转换会丢失文件注释
- 2fa4d9b: 修复 html 属性没有属性值的时不应该赋空字符串

## 1.3.6

### Patch Changes

- eae9fd0: 修复 vue 模板属性值为对象时的转换报错
- d3c6f65: 修复模板里{{!xxx}}这种情况会被忽略渲染
- 664b562: vue 模板里的 v-else 转换错误

## 1.3.5

### Patch Changes

- 7944fcc: 降低包的使用门槛.支持到 node12.x 以上

## 1.3.4

### Patch Changes

- be38073: 修复模板字符串含回车时报错
- f814072: 修复表达式语句中的中文正则匹配错误
- adb3f1e: 修复模板字符串缺了 MemberExpression 的场景

## 1.3.3

### Patch Changes

- 465da20: 修复 vue 的 props 属性,转换效果不符合预期
- 71adfc5: 修复 vue 模板里 html 属性值如果已经翻译了,不应该再翻译
- 54ea76f: 修复模版字符串的提取转换不全

## 1.3.2

### Patch Changes

- 697f3d1: 修复对象里有大写字母属性时,无法正确解析

## 1.3.1

### Patch Changes

- 8d1768d: 替换指令参数 translations 为 locales

## 1.3.0

### Minor Changes

- 3384b5d: 支持初始化配置

## 1.2.9

### Patch Changes

- a5c7d6e: 依赖问题

## 1.2.8

### Patch Changes

- 4e410a8: 依赖问题

## 1.2.7

### Patch Changes

- b43fc17: 打包依赖问题

## 1.2.6

### Patch Changes

- 74c8a4c: 修复依赖问题

## 1.2.5

### Patch Changes

- 73a2b9c: 不应该用语言包的 Key 作为翻译文本
- Updated dependencies [73a2b9c]
  - @ifreeovo/translate-utils@1.0.0

## 1.2.4

### Patch Changes

- d277c3c: 修复已翻译的语言包没有被正确更新

## 1.2.3

### Patch Changes

- b8a3122: 修复翻译报错
