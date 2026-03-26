import { useEffect, useRef, useState, useCallback } from 'react'
import { signalBus } from '@/engine/SignalBus'

export interface ExpressionLogEntry {
  expression: string
  confidence: number
  timestamp: number
}

export function useExpressionLog(maxEntries = 50) {
  const [log, setLog] = useState<ExpressionLogEntry[]>([])
  const lastDominantRef = useRef<string>('neutral')

  const clear = useCallback(() => setLog([]), [])

  useEffect(() => {
    return signalBus.on('expression', (signal) => {
      if (signal.dominant !== lastDominantRef.current) {
        lastDominantRef.current = signal.dominant
        setLog((prev) => [
          { expression: signal.dominant, confidence: signal.confidence, timestamp: signal.timestamp },
          ...prev,
        ].slice(0, maxEntries))
      }
    })
  }, [maxEntries])

  return { log, clear }
}
