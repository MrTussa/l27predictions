'use client'

import { useEffect } from 'react'

export function TimezoneDetector() {
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
    const current = document.cookie
      .split('; ')
      .find((row) => row.startsWith('timezone='))
      ?.split('=')[1]

    if (current !== detected) {
      document.cookie = `timezone=${detected}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    }
  }, [])

  return null
}
