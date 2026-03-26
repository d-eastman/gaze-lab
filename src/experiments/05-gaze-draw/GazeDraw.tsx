import { useRef, useEffect } from 'react'
import { ExperimentShell } from '@/components/ExperimentShell'
import { useGazeCanvas } from './useGazeCanvas'
import { theme } from '@/styles/theme'

export function GazeDraw() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { state, penColor, clear } = useGazeCanvas(canvasRef)

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  return (
    <ExperimentShell
      title="05 — Gaze Draw"
      description="Draw with your eyes. Double-blink toggles pen. Smile cycles color. Surprise increases width."
    >
      <div ref={containerRef} style={{
        flex: 1, position: 'relative',
        background: theme.colors.surface,
        borderRadius: theme.radii.md,
        border: `1px solid ${theme.colors.border}`,
        overflow: 'hidden',
        minHeight: 300,
      }}>
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
      </div>

      <div style={{
        display: 'flex', gap: 16, alignItems: 'center', marginTop: 12,
        fontFamily: theme.fonts.mono, fontSize: 11, color: theme.colors.textDim,
      }}>
        <span>
          Pen: <span style={{ color: state.penDown ? theme.colors.accent : theme.colors.accentDanger }}>
            {state.penDown ? 'DOWN' : 'UP'}
          </span>
        </span>
        <span>
          Color: <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: penColor, verticalAlign: 'middle' }} />
        </span>
        <span>Width: {state.penWidth}px</span>
        <span>Opacity: {(state.opacity * 100).toFixed(0)}%</span>
        <button
          onClick={clear}
          style={{
            marginLeft: 'auto', padding: '4px 12px',
            background: theme.colors.surface2, color: theme.colors.textDim,
            border: `1px solid ${theme.colors.border}`, borderRadius: 6,
            cursor: 'pointer', fontFamily: theme.fonts.mono, fontSize: 11,
          }}
        >
          Clear
        </button>
      </div>
    </ExperimentShell>
  )
}
