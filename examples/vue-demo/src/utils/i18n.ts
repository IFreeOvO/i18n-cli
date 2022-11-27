import { createI18n } from 'vue-i18n'
import zh from '../../locales/zh-CN.json'
import en from '../../locales/en-US.json'
const i18n: any = createI18n({
  locale: localStorage.getItem('locale') || 'zh-CN',
  // 默认语言
  messages: {
    'zh-CN': zh,
    // 中文
    'en-US': en, // 英文
  },
})

export default i18n
