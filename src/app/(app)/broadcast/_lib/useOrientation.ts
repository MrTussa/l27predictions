import { useEffect, useState } from 'react'

const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const handleOrientationChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setOrientation('landscape')
      } else {
        setOrientation('portrait')
      }
    }

    const landscapeMediaQuery = window.matchMedia('(orientation: landscape)')
    if (landscapeMediaQuery.matches) {
      setOrientation('landscape')
    } else {
      setOrientation('portrait')
    }

    landscapeMediaQuery.addEventListener('change', handleOrientationChange)

    return () => {
      landscapeMediaQuery.removeEventListener('change', handleOrientationChange)
    }
  }, [])

  return orientation
}

export default useOrientation
