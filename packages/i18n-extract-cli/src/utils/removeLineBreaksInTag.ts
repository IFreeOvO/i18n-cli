export function removeLineBreaksInTag(str: string): string {
  return str.replace(/([\r\n]+\s*)+/g, '')
}
