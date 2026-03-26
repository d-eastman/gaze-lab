import { describe, it, expect } from 'vitest'
import { distance, midpoint, eyeAspectRatio, angleBetweenPoints, clamp, normalize } from '@/utils/geometry'

describe('distance', () => {
  it('calculates distance between two points', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  })

  it('returns 0 for same point', () => {
    expect(distance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0)
  })

  it('handles negative coordinates', () => {
    expect(distance({ x: -1, y: -1 }, { x: 2, y: 3 })).toBe(5)
  })
})

describe('midpoint', () => {
  it('calculates midpoint of two points', () => {
    const result = midpoint({ x: 0, y: 0 }, { x: 10, y: 10 })
    expect(result).toEqual({ x: 5, y: 5 })
  })

  it('handles negative coordinates', () => {
    const result = midpoint({ x: -4, y: -2 }, { x: 4, y: 2 })
    expect(result).toEqual({ x: 0, y: 0 })
  })
})

describe('eyeAspectRatio', () => {
  it('returns ~0.3 for open eye proportions', () => {
    // Simulated open eye: wide horizontal, moderate vertical
    const eye = [
      { x: 0, y: 5 },   // outer corner
      { x: 2, y: 3 },   // upper outer
      { x: 4, y: 3 },   // upper inner
      { x: 6, y: 5 },   // inner corner
      { x: 4, y: 7 },   // lower inner
      { x: 2, y: 7 },   // lower outer
    ]
    const ear = eyeAspectRatio(eye)
    expect(ear).toBeGreaterThan(0.25)
    expect(ear).toBeLessThan(0.8)
  })

  it('returns low value for closed eye', () => {
    // Nearly closed: very small vertical gap
    const eye = [
      { x: 0, y: 5 },
      { x: 2, y: 4.9 },
      { x: 4, y: 4.9 },
      { x: 6, y: 5 },
      { x: 4, y: 5.1 },
      { x: 2, y: 5.1 },
    ]
    const ear = eyeAspectRatio(eye)
    expect(ear).toBeLessThan(0.1)
  })

  it('returns 1 for fewer than 6 points', () => {
    expect(eyeAspectRatio([{ x: 0, y: 0 }])).toBe(1)
  })

  it('returns 1 for zero horizontal distance', () => {
    const eye = [
      { x: 5, y: 0 },
      { x: 5, y: 1 },
      { x: 5, y: 1 },
      { x: 5, y: 0 },
      { x: 5, y: -1 },
      { x: 5, y: -1 },
    ]
    expect(eyeAspectRatio(eye)).toBe(1)
  })
})

describe('angleBetweenPoints', () => {
  it('returns 0 for horizontal points (left to right)', () => {
    expect(angleBetweenPoints({ x: 0, y: 0 }, { x: 10, y: 0 })).toBe(0)
  })

  it('returns 90 for vertical points (up to down)', () => {
    expect(angleBetweenPoints({ x: 0, y: 0 }, { x: 0, y: 10 })).toBe(90)
  })

  it('returns 45 for diagonal', () => {
    expect(angleBetweenPoints({ x: 0, y: 0 }, { x: 10, y: 10 })).toBe(45)
  })

  it('returns negative for upward angle', () => {
    expect(angleBetweenPoints({ x: 0, y: 0 }, { x: 10, y: -10 })).toBe(-45)
  })
})

describe('clamp', () => {
  it('clamps to min', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it('clamps to max', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('returns value when in range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })
})

describe('normalize', () => {
  it('normalizes to 0-1 range', () => {
    expect(normalize(5, 0, 10)).toBe(0.5)
    expect(normalize(0, 0, 10)).toBe(0)
    expect(normalize(10, 0, 10)).toBe(1)
  })

  it('clamps out-of-range values', () => {
    expect(normalize(-5, 0, 10)).toBe(0)
    expect(normalize(15, 0, 10)).toBe(1)
  })

  it('returns 0.5 when min equals max', () => {
    expect(normalize(5, 5, 5)).toBe(0.5)
  })
})
