import { useEffect, useState, type RefObject } from 'react'
import { signalBus } from '@/engine/SignalBus'

export function useElementGaze(ref: RefObject<HTMLElement | null>): boolean {
  const [isLooking, setIsLooking] = useState(false)

  useEffect(() => {
    return signalBus.on('gaze', (gaze) => {
      if (!ref.current) {
        setIsLooking(false)
        return
      }
      const rect = ref.current.getBoundingClientRect()
      const screenX = gaze.x * window.innerWidth
      const screenY = gaze.y * window.innerHeight

      setIsLooking(
        screenX >= rect.left && screenX <= rect.right &&
        screenY >= rect.top && screenY <= rect.bottom
      )
    })
  }, [ref])

  return isLooking
}
