module.exports = {
  skipTranslate: false,
  translator: 'youdao',
  localePath: './src/locales/zh-CN.json',
  // google: {
  //   proxy: 'socks://127.0.0.1:1080',
  // },
  rules: {
    tsx: {
      importDeclaration: 'import { t } from "@/utils/i18n"',
    },
  },
  youdao: {
    key: '2d8e89a6fd072117',
    secret: 'HiX7rGmYRad3ISMLYexRLfpkJi2taMPh',
  },
};
