import { useRef, useEffect, useState, useCallback, type RefObject } from 'react'
import { useElementGaze } from '@/hooks/useElementGaze'
import { DwellTimer } from '@/utils/timing'
import { THRESHOLDS } from '@/utils/constants'

interface DwellOptions {
  dwellTime?: number
  onActivate: () => void
}

export function useDwellActivation(ref: RefObject<HTMLElement | null>, options: DwellOptions) {
  const { dwellTime = THRESHOLDS.DWELL_TIME_MS, onActivate } = options
  const isLooking = useElementGaze(ref)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef(new DwellTimer(dwellTime, THRESHOLDS.DWELL_DECAY_RATE))
  const onActivateRef = useRef(onActivate)
  onActivateRef.current = onActivate
  const activatedRef = useRef(false)

  const reset = useCallback(() => {
    timerRef.current.reset()
    setProgress(0)
    activatedRef.current = false
  }, [])

  useEffect(() => {
    let frameId: number

    function tick() {
      const p = timerRef.current.tick(isLooking)
      setProgress(p)

      if (timerRef.current.activated && !activatedRef.current) {
        activatedRef.current = true
        onActivateRef.current()
        // Reset after cooldown
        setTimeout(reset, 1200)
      }

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [isLooking, reset])

  return { isLooking, progress }
}
