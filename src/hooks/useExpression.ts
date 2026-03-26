import { useSignal } from './useSignal'
import type { ExpressionSignal } from '@/engine/SignalBus'

const INITIAL: ExpressionSignal = { dominant: 'neutral', confidence: 0, all: {}, timestamp: 0 }

export function useExpression() {
  return useSignal('expression', INITIAL)
}
