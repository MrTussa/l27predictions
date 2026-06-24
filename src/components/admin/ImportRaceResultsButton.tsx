'use client'

import { Button, toast, useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

export function ImportRaceResultsButton() {
  const { id } = useDocumentInfo()
  const [loading, setLoading] = useState(false)

  if (!id) {
    return (
      <p style={{ opacity: 0.6 }}>Сохраните гонку, чтобы импортировать результаты из OpenF1.</p>
    )
  }

  const handleImport = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/import-race-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raceId: id }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Ошибка импорта')
        return
      }

      const warnings: string[] = data.warnings || []
      if (warnings.length > 0) {
        toast.warning(`Импортировано с замечаниями: ${warnings.join('; ')}`)
      } else {
        toast.success('Результаты импортированы. Обновите страницу.')
      }
    } catch {
      toast.error('Сетевая ошибка при импорте')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button buttonStyle="secondary" onClick={handleImport} disabled={loading}>
      {loading ? 'Импорт…' : 'Импорт из OpenF1'}
    </Button>
  )
}
