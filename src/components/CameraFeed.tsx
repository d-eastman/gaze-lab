import { useEffect, useRef } from 'react'
import type { Point } from '@/utils/geometry'
import { theme } from '@/styles/theme'

interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  landmarks: Point[]
}

export function CameraFeed({ videoRef, landmarks }: CameraFeedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = video.videoWidth || 320
    canvas.height = video.videoHeight || 240

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = theme.colors.accent

    for (const pt of landmarks) {
      ctx.beginPath()
      ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [landmarks, videoRef])

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden', borderRadius: 8 }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '100%', display: 'block', transform: 'scaleX(-1)' }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          transform: 'scaleX(-1)', pointerEvents: 'none',
        }}
      />
    </div>
  )
}
