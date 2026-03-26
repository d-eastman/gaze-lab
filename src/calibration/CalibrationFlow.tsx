import { useState, useEffect, useRef } from 'react'
import { getCalibrationTargets, computeCalibration } from './calibrationMath'
import { saveCalibration } from './CalibrationStorage'
import type { CalibrationTransform } from '@/engine/GazeEstimator'
import { THRESHOLDS } from '@/utils/constants'
import { theme } from '@/styles/theme'

interface CalibrationFlowProps {
  gazeX: number
  gazeY: number
  onComplete: (transform: CalibrationTransform) => void
  onCancel: () => void
}

export function CalibrationFlow({ gazeX, gazeY, onComplete, onCancel }: CalibrationFlowProps) {
  const targets = useRef(getCalibrationTargets()).current
  const [currentIdx, setCurrentIdx] = useState(0)
  const [holdProgress, setHoldProgress] = useState(0)
  const collectedPoints = useRef<{ predicted: { x: number; y: number }; actual: { x: number; y: number } }[]>([])
  const gazeRef = useRef({ x: gazeX, y: gazeY })
  const onCompleteRef = useRef(onComplete)

  // Keep refs in sync without triggering effect re-runs
  gazeRef.current = { x: gazeX, y: gazeY }
  onCompleteRef.current = onComplete

  const target = targets[currentIdx]

  // Timer effect: depends ONLY on currentIdx — gaze changes don't reset it
  useEffect(() => {
    const startTime = Date.now()
    let done = false

    const interval = setInterval(() => {
      if (done) return
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / THRESHOLDS.CALIB_HOLD_TIME_MS)
      setHoldProgress(progress)

      if (progress >= 1) {
        done = true
        clearInterval(interval)

        const gaze = gazeRef.current
        collectedPoints.current.push({
          predicted: { x: gaze.x, y: gaze.y },
          actual: targets[currentIdx]!,
        })

        if (currentIdx + 1 >= targets.length) {
          const transform = computeCalibration(collectedPoints.current)
          saveCalibration(transform)
          onCompleteRef.current(transform)
        } else {
          setCurrentIdx((i) => i + 1)
          setHoldProgress(0)
        }
      }
    }, 50)

    return () => clearInterval(interval)
  }, [currentIdx, targets])

  if (!target) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(10, 11, 15, 0.95)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', top: 24,
        color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 18,
      }}>
        Look at the glowing dot — Point {currentIdx + 1} of {targets.length}
      </div>

      <div style={{
        position: 'absolute',
        left: `${target.x * 100}%`,
        top: `${target.y * 100}%`,
        transform: 'translate(-50%, -50%)',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: `3px solid ${theme.colors.accent}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: `${holdProgress * 100}%`, height: `${holdProgress * 100}%`,
            borderRadius: '50%', background: theme.colors.accent,
            transition: 'width 50ms, height 50ms',
            minWidth: 4, minHeight: 4,
          }} />
        </div>
      </div>

      <button
        onClick={onCancel}
        style={{
          position: 'absolute', bottom: 24,
          padding: '8px 24px', background: 'transparent',
          border: `1px solid ${theme.colors.border}`, color: theme.colors.textDim,
          borderRadius: 8, cursor: 'pointer', fontFamily: theme.fonts.body,
        }}
      >
        Cancel
      </button>
    </div>
  )
}
