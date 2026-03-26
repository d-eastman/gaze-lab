import { useEffect, useState, useRef, type RefObject } from 'react'
import { useElementGaze } from '@/hooks/useElementGaze'
import { signalBus } from '@/engine/SignalBus'

interface MultiModalState {
  isLooking: boolean
  isSelected: boolean
  hueShift: number
  lightness: number
}

export function useMultiModal(
  ref: RefObject<HTMLElement | null>,
  onToggleSelect: () => void,
) {
  const isLooking = useElementGaze(ref)
  const [isSelected, setIsSelected] = useState(false)
  const [hueShift, setHueShift] = useState(0)
  const [lightness, setLightness] = useState(50)
  const isLookingRef = useRef(isLooking)
  isLookingRef.current = isLooking

  // Double-blink toggles selection
  useEffect(() => {
    return signalBus.on('blink', (signal) => {
      if (signal.type === 'doubleBlink' && isLookingRef.current) {
        setIsSelected((prev) => !prev)
        onToggleSelect()
      }
    })
  }, [onToggleSelect])

  // Expression-based lightness + head pose hue shift while looking
  useEffect(() => {
    return signalBus.on('expression', (signal) => {
      if (!isLookingRef.current) return
      if (signal.dominant === 'happy') {
        setLightness((l) => Math.min(90, l + 0.5))
      } else if (signal.dominant === 'surprised') {
        setLightness((l) => Math.max(10, l - 0.5))
      }
    })
  }, [])

  useEffect(() => {
    return signalBus.on('headPose', (signal) => {
      if (!isLookingRef.current) return
      if (signal.roll < -12) setHueShift((h) => h - 1)
      else if (signal.roll > 12) setHueShift((h) => h + 1)
    })
  }, [])

  const state: MultiModalState = { isLooking, isSelected, hueShift, lightness }
  return state
}
