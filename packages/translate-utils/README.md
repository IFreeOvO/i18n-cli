# @ifreeovo/translate-utils

一个翻译工具函数库。支持有道，谷歌。

## install

```
npm i @ifreeovo/translate-utils
```

## api

### googleTranslate

```ts
declare function googleTranslate(
  word: string, // 待翻译文本
  originLang: string, // 源语言
  targetLang: string, // 目标语言
  proxy: string | undefined // 代理地址
): Promise<string>
```

例子

```js
const res = await googleTranslate('翻译内容', 'zh-CN', 'en-US', 'socks://127.0.0.1:1080')
```

### youdaoTranslate

```ts
interface YoudaoConfig {
  key?: string // 有道词典appKey
  secret?: string // 有道词典appSecret
}

declare function youdaoTranslate(
  word: string, // 待翻译文本
  originLang: string, // 源语言
  targetLang: string, // 目标语言
  option: YoudaoConfig // 有道词典配置
): Promise<string>
```

例子

```js
const res = await googleTranslate('翻译内容', 'zh-CN', 'en-US', {
  key: '2d8e89a6fd072117',
  secret: 'HiX7rGmYRad3ISMLYexRLfpkJi2taMPh',
})
```
