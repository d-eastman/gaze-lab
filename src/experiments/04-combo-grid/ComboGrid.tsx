import { useRef, useCallback } from 'react'
import { ExperimentShell } from '@/components/ExperimentShell'
import { useMultiModal } from './useMultiModal'
import { theme } from '@/styles/theme'

const BASE_HUES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

function GridCell({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const noop = useCallback(() => {}, [])
  const { isLooking, isSelected, hueShift, lightness } = useMultiModal(ref, noop)

  const hue = (BASE_HUES[index]! + hueShift) % 360

  return (
    <div
      ref={ref}
      style={{
        borderRadius: theme.radii.md,
        border: `2px solid ${isLooking ? theme.colors.accent : isSelected ? theme.colors.accentWarm : theme.colors.border}`,
        background: `hsl(${hue}, 60%, ${lightness}%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 150ms',
        position: 'relative',
        minHeight: 80,
      }}
    >
      {isSelected && (
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: theme.colors.accentWarm,
          position: 'absolute', top: 8, right: 8,
        }} />
      )}
      <span style={{
        fontFamily: theme.fonts.mono, fontSize: 11,
        color: lightness > 60 ? '#000' : '#fff',
        opacity: 0.6,
      }}>
        {index + 1}
      </span>
    </div>
  )
}

export function ComboGrid() {
  return (
    <ExperimentShell
      title="04 — Combo Grid"
      description="Multi-modal input: Gaze to target, double-blink to select, smile to lighten, surprise to darken, head-tilt to shift hue."
    >
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(3, 1fr)',
        gap: 12, height: 'calc(100% - 60px)',
      }}>
        {BASE_HUES.map((_, i) => (
          <GridCell key={i} index={i} />
        ))}
      </div>
      <div style={{
        marginTop: 12, fontSize: 11, fontFamily: theme.fonts.mono, color: theme.colors.textDim,
        display: 'flex', gap: 16, flexWrap: 'wrap',
      }}>
        <span>Gaze = target</span>
        <span>Double-blink = select</span>
        <span>Smile = lighten</span>
        <span>Surprise = darken</span>
        <span>Tilt = shift hue</span>
      </div>
    </ExperimentShell>
  )
}
