import { useSignal } from './useSignal'
import type { GazeSignal } from '@/engine/SignalBus'

const INITIAL: GazeSignal = { x: 0.5, y: 0.5, rawX: 0.5, rawY: 0.5, timestamp: 0 }

export function useGazePosition() {
  return useSignal('gaze', INITIAL)
}
