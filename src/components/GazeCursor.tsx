import { useGazePosition } from '@/hooks/useGazePosition'
import { theme } from '@/styles/theme'
import { clamp } from '@/utils/geometry'

interface GazeCursorProps {
  visible: boolean
}

export function GazeCursor({ visible }: GazeCursorProps) {
  const gaze = useGazePosition()

  const x = clamp(gaze.x, 0, 1) * 100
  const y = clamp(gaze.y, 0, 1) * 100

  return (
    <div
      style={{
        position: 'fixed',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: `3px solid ${theme.colors.accent}`,
        background: `${theme.colors.accent}55`,
        boxShadow: `0 0 12px ${theme.colors.accent}88`,
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'left 60ms, top 60ms, opacity 300ms',
        opacity: visible ? 1 : 0,
      }}
    />
  )
}
