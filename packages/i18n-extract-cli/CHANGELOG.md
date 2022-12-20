# @ifreeovo/i18n-extract-cli

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
