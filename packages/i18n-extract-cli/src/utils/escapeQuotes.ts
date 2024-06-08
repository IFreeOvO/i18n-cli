export function escapeQuotes(value: string): string {
  return value.replace(/'/g, '_#_').replace(/"/g, '_##_')
}
