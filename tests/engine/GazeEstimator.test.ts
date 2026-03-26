import { describe, it, expect, beforeEach } from 'vitest'
import { GazeEstimator } from '@/engine/GazeEstimator'
import type { Point } from '@/utils/geometry'

// faceWidth = 200 (100 to 300), browY = 100, chin = 300, faceHeight = 200
// Default aspect ratio = 200/200 = 1.0
function makeLandmarks(opts: { noseX?: number; browY?: number; chinY?: number } = {}): Point[] {
  const { noseX = 200, browY = 100, chinY = 300 } = opts
  const landmarks: Point[] = Array.from({ length: 68 }, () => ({ x: 200, y: 200 }))
  landmarks[0] = { x: 100, y: 200 }   // FACE_LEFT
  landmarks[16] = { x: 300, y: 200 }  // FACE_RIGHT
  landmarks[17] = { x: 120, y: browY } // LEFT_BROW_OUTER
  landmarks[26] = { x: 280, y: browY } // RIGHT_BROW_OUTER
  landmarks[8] = { x: 200, y: chinY }  // CHIN
  landmarks[30] = { x: noseX, y: 200 } // NOSE_TIP
  return landmarks
}

function runBaseline(estimator: GazeEstimator, opts?: Parameters<typeof makeLandmarks>[0]) {
  for (let i = 0; i < 30; i++) {
    estimator.estimate(makeLandmarks(opts), 640, 480)
  }
}

describe('GazeEstimator', () => {
  let estimator: GazeEstimator

  beforeEach(() => {
    estimator = new GazeEstimator()
  })

  it('returns center gaze on first frame', () => {
    const result = estimator.estimate(makeLandmarks(), 640, 480)
    expect(result.x).toBeCloseTo(0.5, 1)
    expect(result.y).toBeCloseTo(0.5, 1)
  })

  it('shifts gaze left when nose moves right in camera (mirrored)', () => {
    runBaseline(estimator)
    const result = estimator.estimate(makeLandmarks({ noseX: 240 }), 640, 480)
    expect(result.x).toBeLessThan(0.45)
  })

  it('shifts gaze down when face aspect ratio decreases (looking down)', () => {
    runBaseline(estimator)
    // Sustain signal through heavy Y smoothing
    let result
    for (let i = 0; i < 20; i++) {
      result = estimator.estimate(makeLandmarks({ chinY: 270 }), 640, 480)
    }
    expect(result!.y).toBeLessThan(0.45)
  })

  it('shifts gaze up when face aspect ratio increases (looking up)', () => {
    runBaseline(estimator)
    let result
    for (let i = 0; i < 20; i++) {
      result = estimator.estimate(makeLandmarks({ chinY: 330 }), 640, 480)
    }
    expect(result!.y).toBeGreaterThan(0.55)
  })

  it('applies calibration transform', () => {
    estimator.setCalibration({ offsetX: 0.1, offsetY: -0.1, scaleX: 1.2, scaleY: 0.8 })
    const result = estimator.estimate(makeLandmarks(), 640, 480)
    expect(result.rawX).toBeCloseTo(0.5 * 1.2 + 0.1, 1)
    expect(result.rawY).toBeCloseTo(0.5 * 0.8 + (-0.1), 1)
  })

  it('reset clears baseline and calibration', () => {
    estimator.setCalibration({ offsetX: 0.5, offsetY: 0.5, scaleX: 2, scaleY: 2 })
    runBaseline(estimator)
    estimator.reset()
    const result = estimator.estimate(makeLandmarks(), 640, 480)
    expect(result.x).toBeCloseTo(0.5, 1)
    expect(result.y).toBeCloseTo(0.5, 1)
  })
})
