import { useEffect, useRef, useCallback } from 'react'
import { signalBus, type BlinkSignal } from '@/engine/SignalBus'

interface BlinkEventHandlers {
  onBlink?: () => void
  onDoubleBlink?: () => void
  onWinkLeft?: () => void
  onWinkRight?: () => void
}

export function useBlinkEvents(handlers: BlinkEventHandlers): void {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const listener = useCallback((signal: BlinkSignal) => {
    const h = handlersRef.current
    switch (signal.type) {
      case 'blink': h.onBlink?.(); break
      case 'doubleBlink': h.onDoubleBlink?.(); break
      case 'winkLeft': h.onWinkLeft?.(); break
      case 'winkRight': h.onWinkRight?.(); break
    }
  }, [])

  useEffect(() => {
    return signalBus.on('blink', listener)
  }, [listener])
}
