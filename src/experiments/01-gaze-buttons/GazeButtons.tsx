import { useState, useRef } from 'react'
import { ExperimentShell } from '@/components/ExperimentShell'
import { useDwellActivation } from './useDwellActivation'
import { theme } from '@/styles/theme'

const BUTTON_COLORS = [theme.colors.accent, theme.colors.accentPurple, theme.colors.accentWarm, theme.colors.accentDanger]
const BUTTON_LABELS = ['Flash', 'Count', 'Color', 'Sound']

function GazeButton({ index, onActivate }: { index: number; onActivate: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const { isLooking, progress } = useDwellActivation(ref, { onActivate })
  const color = BUTTON_COLORS[index]!

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: theme.radii.lg, overflow: 'hidden',
        border: `2px solid ${isLooking ? color : theme.colors.border}`,
        background: theme.colors.surface,
        transition: 'border-color 150ms, transform 150ms',
        transform: progress >= 1 ? 'scale(1.05)' : 'scale(1)',
        cursor: 'default',
      }}
    >
      {/* Progress fill */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: `${progress * 100}%`,
        background: `${color}22`,
        transition: 'height 50ms',
      }} />
      <span style={{
        fontFamily: theme.fonts.display, fontSize: 22, fontWeight: 700,
        color: isLooking ? color : theme.colors.textDim,
        zIndex: 1,
      }}>
        {BUTTON_LABELS[index]}
      </span>
    </div>
  )
}

export function GazeButtons() {
  const [log, setLog] = useState<string[]>([])

  const handleActivate = (index: number) => {
    const label = BUTTON_LABELS[index]!
    setLog((prev) => [`${label} activated`, ...prev].slice(0, 10))
  }

  return (
    <ExperimentShell
      title="01 — Gaze Buttons"
      description="Look at a button for 1.5s to activate it. Tests dwell-based gaze activation."
    >
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 16, height: 'calc(100% - 80px)', minHeight: 300,
      }}>
        {BUTTON_LABELS.map((_, i) => (
          <GazeButton key={i} index={i} onActivate={() => handleActivate(i)} />
        ))}
      </div>
      {log.length > 0 && (
        <div style={{
          marginTop: 12, fontSize: 12, fontFamily: theme.fonts.mono,
          color: theme.colors.textDim, maxHeight: 80, overflow: 'auto',
        }}>
          {log.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      )}
    </ExperimentShell>
  )
}
