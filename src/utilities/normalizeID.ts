/**
 * Безопасно извлекает ID из relationship поля
 * Работает как с depth: 0 (строка), так и с depth > 0 (объект)
 *
 * @param value - Значение relationship поля (строка или объект с id)
 * @returns ID как строка
 */
export function normalizeID(value: string | { id: string } | null | undefined): string {
  if (!value) return ''
  return typeof value === 'object' && 'id' in value ? value.id : (value as string)
}

/**
 * Нормализует массив IDs из relationship полей
 *
 * @param values - Массив значений relationship полей
 * @returns Массив ID как строки
 */
export function normalizeIDs(
  values: (string | { id: string } | null | undefined)[],
): string[] {
  return values.map(normalizeID).filter((id) => id !== '')
}
