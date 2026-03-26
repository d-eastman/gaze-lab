import { describe, it, expect } from 'vitest'
import { EMASmoother, EMAPoint2D } from '@/utils/smoothing'

describe('EMASmoother', () => {
  it('first value passes through unchanged', () => {
    const s = new EMASmoother(0.3)
    expect(s.update(10)).toBe(10)
  })

  it('smooths subsequent values', () => {
    const s = new EMASmoother(0.5)
    s.update(10)
    const result = s.update(20)
    // 0.5 * 20 + 0.5 * 10 = 15
    expect(result).toBe(15)
  })

  it('converges toward constant input', () => {
    const s = new EMASmoother(0.3)
    s.update(0)
    for (let i = 0; i < 50; i++) s.update(100)
    expect(s.current).toBeCloseTo(100, 0)
  })

  it('higher alpha responds faster', () => {
    const fast = new EMASmoother(0.9)
    const slow = new EMASmoother(0.1)
    fast.update(0); slow.update(0)
    fast.update(100); slow.update(100)
    expect(fast.current).toBeGreaterThan(slow.current)
  })

  it('reset clears state', () => {
    const s = new EMASmoother(0.3)
    s.update(10)
    s.update(20)
    s.reset()
    expect(s.current).toBe(0)
    expect(s.update(5)).toBe(5) // first value again
  })
})

describe('EMAPoint2D', () => {
  it('smooths both axes independently', () => {
    const s = new EMAPoint2D(0.5)
    s.update(10, 20)
    const result = s.update(20, 40)
    expect(result.x).toBe(15)
    expect(result.y).toBe(30)
  })

  it('reset clears both axes', () => {
    const s = new EMAPoint2D(0.3)
    s.update(10, 20)
    s.reset()
    expect(s.current).toEqual({ x: 0, y: 0 })
  })
})
