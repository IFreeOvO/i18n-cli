export function escapeQuotes(value: string): string {
  return value.replace(/'/g, "\\'").replace(/"/, '\\"')
}
