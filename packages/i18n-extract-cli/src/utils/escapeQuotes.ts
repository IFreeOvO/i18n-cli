export function escapeQuotes(value: string): string {
  return value.replace(/'/g, '_#_').replace(/"/, '_##_')
}
