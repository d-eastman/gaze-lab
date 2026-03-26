import { useState, useRef, useCallback, useEffect } from 'react'
import { ExperimentShell } from '@/components/ExperimentShell'
import { useGazePosition } from '@/hooks/useGazePosition'
import { useBlinkConfirm } from './useBlinkConfirm'
import { theme } from '@/styles/theme'

const NUMBERS = Array.from({ length: 10 }, (_, i) => i + 1)
// Padding around each cell that counts as "still looking at it" (hysteresis)
const HIT_PADDING = 40
// How long gaze must be on a new cell before it switches (ms)
const SWITCH_DELAY_MS = 150

export function NumberPick() {
  const gaze = useGazePosition()
  const [selected, setSelected] = useState<number | null>(null)
  const [justSelected, setJustSelected] = useState<number | null>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const cellRefs = useRef<(HTMLDivElement | null)[]>([])
  const pendingSwitch = useRef<{ idx: number; since: number } | null>(null)

  const gazeScreenX = gaze.x * window.innerWidth
  const gazeScreenY = gaze.y * window.innerHeight

  // Find which cell the gaze falls in (with generous padding)
  const findGazedCell = useCallback(() => {
    for (let i = 0; i < cellRefs.current.length; i++) {
      const el = cellRefs.current[i]
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (
        gazeScreenX >= rect.left - HIT_PADDING && gazeScreenX <= rect.right + HIT_PADDING &&
        gazeScreenY >= rect.top - HIT_PADDING && gazeScreenY <= rect.bottom + HIT_PADDING
      ) {
        return i
      }
    }
    return null
  }, [gazeScreenX, gazeScreenY])

  // Stabilized hover: require gaze to stay on a new cell for SWITCH_DELAY_MS before switching
  useEffect(() => {
    const rawIdx = findGazedCell()

    if (rawIdx === hoveredIdx) {
      // Still on same cell, clear any pending switch
      pendingSwitch.current = null
      return
    }

    if (rawIdx === null) {
      // Gaze left all cells — clear after a short grace period
      const timer = setTimeout(() => setHoveredIdx(null), SWITCH_DELAY_MS * 2)
      return () => clearTimeout(timer)
    }

    // Gaze is on a different cell — start a pending switch
    if (pendingSwitch.current?.idx !== rawIdx) {
      pendingSwitch.current = { idx: rawIdx, since: Date.now() }
    }

    const elapsed = Date.now() - pendingSwitch.current!.since
    if (elapsed >= SWITCH_DELAY_MS) {
      setHoveredIdx(rawIdx)
      pendingSwitch.current = null
    } else {
      const timer = setTimeout(() => {
        if (pendingSwitch.current?.idx === rawIdx) {
          setHoveredIdx(rawIdx)
          pendingSwitch.current = null
        }
      }, SWITCH_DELAY_MS - elapsed)
      return () => clearTimeout(timer)
    }
  }, [findGazedCell, hoveredIdx])

  useBlinkConfirm({
    onConfirm: () => {
      if (hoveredIdx !== null) {
        const num = NUMBERS[hoveredIdx]!
        setSelected(num)
        setJustSelected(num)
        setTimeout(() => setJustSelected(null), 600)
      }
    },
  })

  return (
    <ExperimentShell
      title="02 — Number Pick"
      description="Look at a number, then double-blink to select it."
    >
      <div style={{
        display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center',
        flexWrap: 'wrap', marginTop: 40,
      }}>
        {NUMBERS.map((num, i) => {
          const isHovered = hoveredIdx === i
          const isSelected = selected === num
          const isFlashing = justSelected === num
          return (
            <div
              key={num}
              ref={(el) => { cellRefs.current[i] = el }}
              style={{
                width: 72, height: 72,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: theme.radii.md,
                border: `3px solid ${isFlashing ? theme.colors.accentWarm : isSelected ? theme.colors.accentWarm : isHovered ? theme.colors.accent : theme.colors.border}`,
                background: isFlashing ? `${theme.colors.accentWarm}66` : isSelected ? `${theme.colors.accentWarm}33` : isHovered ? `${theme.colors.accent}11` : theme.colors.surface,
                boxShadow: isFlashing ? `0 0 20px ${theme.colors.accentWarm}aa` : 'none',
                fontFamily: theme.fonts.display, fontSize: 28, fontWeight: 700,
                color: isFlashing ? theme.colors.accentWarm : isSelected ? theme.colors.accentWarm : isHovered ? theme.colors.accent : theme.colors.textDim,
                transform: isFlashing ? 'scale(1.2)' : isHovered ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 200ms',
              }}
            >
              {num}
            </div>
          )
        })}
      </div>

      {selected !== null && (
        <div style={{
          marginTop: 32, textAlign: 'center',
          fontFamily: theme.fonts.display, fontSize: 20, color: theme.colors.accentWarm,
        }}>
          Selected: {selected}
        </div>
      )}

      <div style={{
        marginTop: 16, textAlign: 'center',
        fontSize: 12, color: theme.colors.textDim, fontFamily: theme.fonts.mono,
      }}>
        Double-blink to confirm. Click to reset.
        <button
          onClick={() => setSelected(null)}
          style={{
            marginLeft: 12, padding: '4px 12px',
            background: theme.colors.surface2, color: theme.colors.textDim,
            border: `1px solid ${theme.colors.border}`, borderRadius: 6,
            cursor: 'pointer', fontFamily: theme.fonts.mono, fontSize: 11,
          }}
        >
          Reset
        </button>
      </div>
    </ExperimentShell>
  )
}
