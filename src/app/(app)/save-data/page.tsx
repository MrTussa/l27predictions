'use client'

import { useEffect, useRef, useState } from 'react'

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.play().catch(() => setBlocked(true))
  }, [])

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center gap-4">
      <video ref={videoRef} loop playsInline>
        <source src="save.webm" type="video/webm" />
      </video>
      {blocked && (
        <button
          onClick={() => {
            videoRef.current?.play()
            setBlocked(false)
          }}
          className="px-6 py-3 bg-red-500 text-white rounded-xl text-lg"
        >
          ▶ Нажми чтобы посмотреть
        </button>
      )}
    </div>
  )
}
