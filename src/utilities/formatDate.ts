type DateFormat = 'date' | 'dateTime' | 'time' | 'dateYear' | 'short'

const formatOptions: Record<DateFormat, Intl.DateTimeFormatOptions> = {
  date: { day: 'numeric', month: 'long' },
  dateTime: { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' },
  time: { hour: '2-digit', minute: '2-digit' },
  dateYear: { day: 'numeric', month: 'long', year: 'numeric' },
  short: { day: 'numeric', month: 'numeric', year: 'numeric' },
}

export function formatDate(date: string, timeZone: string, format: DateFormat): string {
  return new Intl.DateTimeFormat('ru-RU', {
    ...formatOptions[format],
    timeZone,
  }).format(new Date(date))
}
