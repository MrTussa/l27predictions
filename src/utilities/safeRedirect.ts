// Разрешаем только относительные пути внутри сайта: "//evil.com" и "/\evil.com" браузер считает внешними
export function safeRedirect(path: string | null | undefined, fallback: string): string {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) {
    return fallback
  }
  return path
}
