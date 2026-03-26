import { describe, it, expect, vi } from 'vitest'
import { SignalBus } from '@/engine/SignalBus'

describe('SignalBus', () => {
  it('emits events to listeners', () => {
    const bus = new SignalBus()
    const listener = vi.fn()
    bus.on('gaze', listener)

    const data = { x: 0.5, y: 0.5, rawX: 0.5, rawY: 0.5, timestamp: 1000 }
    bus.emit('gaze', data)

    expect(listener).toHaveBeenCalledWith(data)
  })

  it('supports multiple listeners', () => {
    const bus = new SignalBus()
    const l1 = vi.fn()
    const l2 = vi.fn()
    bus.on('blink', l1)
    bus.on('blink', l2)

    const data = { type: 'blink' as const, timestamp: 1000 }
    bus.emit('blink', data)

    expect(l1).toHaveBeenCalledOnce()
    expect(l2).toHaveBeenCalledOnce()
  })

  it('unsubscribes via returned function', () => {
    const bus = new SignalBus()
    const listener = vi.fn()
    const unsubscribe = bus.on('expression', listener)

    unsubscribe()

    bus.emit('expression', {
      dominant: 'neutral', confidence: 0, all: {}, timestamp: 1000,
    })

    expect(listener).not.toHaveBeenCalled()
  })

  it('clear removes all listeners', () => {
    const bus = new SignalBus()
    const l1 = vi.fn()
    const l2 = vi.fn()
    bus.on('gaze', l1)
    bus.on('blink', l2)

    bus.clear()

    bus.emit('gaze', { x: 0, y: 0, rawX: 0, rawY: 0, timestamp: 0 })
    bus.emit('blink', { type: 'blink', timestamp: 0 })

    expect(l1).not.toHaveBeenCalled()
    expect(l2).not.toHaveBeenCalled()
  })

  it('does not throw when emitting with no listeners', () => {
    const bus = new SignalBus()
    expect(() => bus.emit('gaze', { x: 0, y: 0, rawX: 0, rawY: 0, timestamp: 0 })).not.toThrow()
  })
})
