import { useEffect, useState } from 'react'
import { signalBus, type SignalMap } from '@/engine/SignalBus'

export function useSignal<K extends keyof SignalMap>(event: K, initial: SignalMap[K]): SignalMap[K] {
  const [value, setValue] = useState(initial)
  useEffect(() => signalBus.on(event, setValue), [event])
  return value
}
