export function escapeQuotes(value: string): string {
  return value.replaceAll("'", "\\'").replaceAll('"', '\\"')
}
