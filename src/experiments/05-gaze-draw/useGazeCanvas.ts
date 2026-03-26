import { useEffect, useRef, useState, useCallback } from 'react'
import { signalBus } from '@/engine/SignalBus'

const PEN_COLORS = ['#00ffc8', '#7b61ff', '#ff3d71', '#ffc107', '#ffffff']

export interface CanvasState {
  penDown: boolean
  colorIndex: number
  penWidth: number
  opacity: number
}

export function useGazeCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [penDown, setPenDown] = useState(false)
  const [colorIndex, setColorIndex] = useState(0)
  const [penWidth, setPenWidth] = useState(3)
  const [opacity, setOpacity] = useState(1)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const stateRef = useRef({ penDown, colorIndex, penWidth, opacity })
  stateRef.current = { penDown, colorIndex, penWidth, opacity }

  // Double-blink toggles pen
  useEffect(() => {
    return signalBus.on('blink', (signal) => {
      if (signal.type === 'doubleBlink') {
        setPenDown((prev) => !prev)
      }
    })
  }, [])

  // Expression controls
  useEffect(() => {
    return signalBus.on('expression', (signal) => {
      if (signal.dominant === 'happy') {
        setColorIndex((i) => (i + 1) % PEN_COLORS.length)
      } else if (signal.dominant === 'surprised') {
        setPenWidth((w) => Math.min(20, w + 1))
      } else if (signal.dominant === 'angry') {
        setPenWidth((w) => Math.max(1, w - 1))
      }
    })
  }, [])

  // Head tilt controls opacity
  useEffect(() => {
    return signalBus.on('headPose', (signal) => {
      const normalized = Math.max(0.1, Math.min(1, 1 - Math.abs(signal.roll) / 30))
      setOpacity(normalized)
    })
  }, [])

  // Draw with gaze
  useEffect(() => {
    return signalBus.on('gaze', (signal) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const x = signal.x * canvas.width
      const y = signal.y * canvas.height
      const s = stateRef.current

      if (s.penDown && lastPos.current) {
        ctx.beginPath()
        ctx.strokeStyle = PEN_COLORS[s.colorIndex]!
        ctx.lineWidth = s.penWidth
        ctx.globalAlpha = s.opacity
        ctx.lineCap = 'round'
        ctx.moveTo(lastPos.current.x, lastPos.current.y)
        ctx.lineTo(x, y)
        ctx.stroke()
      }

      lastPos.current = { x, y }
    })
  }, [canvasRef])

  const clear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    lastPos.current = null
  }, [canvasRef])

  return {
    state: { penDown, colorIndex, penWidth, opacity } as CanvasState,
    penColor: PEN_COLORS[colorIndex]!,
    clear,
  }
}
