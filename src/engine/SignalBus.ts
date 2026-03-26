export interface GazeSignal {
  x: number
  y: number
  rawX: number
  rawY: number
  timestamp: number
}

export interface BlinkSignal {
  type: 'blink' | 'doubleBlink' | 'winkLeft' | 'winkRight'
  timestamp: number
}

export interface ExpressionSignal {
  dominant: string
  confidence: number
  all: Record<string, number>
  timestamp: number
}

export interface HeadPoseSignal {
  yaw: number
  pitch: number
  roll: number
  timestamp: number
}

export type SignalMap = {
  gaze: GazeSignal
  blink: BlinkSignal
  expression: ExpressionSignal
  headPose: HeadPoseSignal
}

type Listener<T> = (data: T) => void

export class SignalBus {
  private listeners = new Map<string, Set<Listener<unknown>>>()

  on<K extends keyof SignalMap>(event: K, listener: Listener<SignalMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    const set = this.listeners.get(event)!
    set.add(listener as Listener<unknown>)
    return () => set.delete(listener as Listener<unknown>)
  }

  emit<K extends keyof SignalMap>(event: K, data: SignalMap[K]): void {
    this.listeners.get(event)?.forEach((fn) => fn(data))
  }

  clear(): void {
    this.listeners.clear()
  }
}

export const signalBus = new SignalBus()
