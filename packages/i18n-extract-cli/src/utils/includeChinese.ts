export function includeChinese(code: string) {
  return new RegExp('[\u{4E00}-\u{9FFF}]', 'g').test(code)
}
