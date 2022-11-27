# 介绍

vue 项目模板，用于测试翻译效果

## 安装

装项目依赖

```
npm i
```

装脚手架

```
npm i -g @ovointl/i18n-extract-cli
```

## 运行项目

在当前目录(vue-demo)下执行

```
npm start
```

## 体验@ifreeovo/i18n-extract-cli 转换效果

在当前目录(vue-demo)下执行(PS:这里用.cjs，是因为这个示例项目的`package.json`声明了`"type": "module"`，此时需要就明确文件模块类型。当然你去掉这个声明后再使用.js 也是可以的)

```
it -c ./i18n.config.cjs
```
