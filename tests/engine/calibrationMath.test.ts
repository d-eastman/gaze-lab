import { describe, it, expect } from 'vitest'
import { computeCalibration, getCalibrationTargets } from '@/calibration/calibrationMath'

describe('computeCalibration', () => {
  it('returns identity transform for empty input', () => {
    const result = computeCalibration([])
    expect(result).toEqual({ offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 })
  })

  it('returns identity-like transform when predicted equals actual', () => {
    const points = [
      { predicted: { x: 0.15, y: 0.15 }, actual: { x: 0.15, y: 0.15 } },
      { predicted: { x: 0.85, y: 0.15 }, actual: { x: 0.85, y: 0.15 } },
      { predicted: { x: 0.5, y: 0.5 }, actual: { x: 0.5, y: 0.5 } },
    ]
    const result = computeCalibration(points)
    // scaleX and scaleY should be ~1, offsets ~0
    expect(result.scaleX).toBeCloseTo(1, 2)
    expect(result.scaleY).toBeCloseTo(1, 2)
    expect(result.offsetX).toBeCloseTo(0, 2)
    expect(result.offsetY).toBeCloseTo(0, 2)
  })

  it('computes a scaling transform', () => {
    // Predicted always 0.5x of actual
    const points = [
      { predicted: { x: 0.1, y: 0.1 }, actual: { x: 0.2, y: 0.2 } },
      { predicted: { x: 0.5, y: 0.5 }, actual: { x: 1.0, y: 1.0 } },
    ]
    const result = computeCalibration(points)
    expect(result.scaleX).toBeCloseTo(2, 1)
    expect(result.scaleY).toBeCloseTo(2, 1)
  })

  it('computes an offset transform', () => {
    const points = [
      { predicted: { x: 0.3, y: 0.3 }, actual: { x: 0.4, y: 0.5 } },
      { predicted: { x: 0.7, y: 0.7 }, actual: { x: 0.8, y: 0.9 } },
    ]
    const result = computeCalibration(points)
    // Scale should be ~1 (same spread), offset ~0.1 on X, ~0.2 on Y
    expect(result.scaleX).toBeCloseTo(1, 1)
    expect(result.offsetX).toBeCloseTo(0.1, 1)
    expect(result.offsetY).toBeCloseTo(0.2, 1)
  })
})

describe('getCalibrationTargets', () => {
  it('returns 9 calibration targets', () => {
    const targets = getCalibrationTargets()
    expect(targets).toHaveLength(9)
  })

  it('includes corners and center', () => {
    const targets = getCalibrationTargets()
    // Check center exists
    expect(targets).toContainEqual({ x: 0.5, y: 0.5 })
    // Check top-left corner area
    expect(targets).toContainEqual({ x: 0.15, y: 0.15 })
    // Check bottom-right corner area
    expect(targets).toContainEqual({ x: 0.85, y: 0.85 })
  })

  it('all values are between 0 and 1', () => {
    for (const t of getCalibrationTargets()) {
      expect(t.x).toBeGreaterThanOrEqual(0)
      expect(t.x).toBeLessThanOrEqual(1)
      expect(t.y).toBeGreaterThanOrEqual(0)
      expect(t.y).toBeLessThanOrEqual(1)
    }
  })
})
