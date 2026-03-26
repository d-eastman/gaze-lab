import { describe, it, expect, beforeEach } from 'vitest'
import { HeadPoseEstimator } from '@/engine/HeadPoseEstimator'
import type { Point } from '@/utils/geometry'

function makeLandmarks(opts: {
  noseX?: number; noseY?: number
  leftEyeX?: number; leftEyeY?: number
  rightEyeX?: number; rightEyeY?: number
} = {}): Point[] {
  const {
    noseX = 200, noseY = 200,
    leftEyeX = 150, leftEyeY = 170,
    rightEyeX = 250, rightEyeY = 170,
  } = opts

  const landmarks: Point[] = Array.from({ length: 68 }, () => ({ x: 200, y: 200 }))
  landmarks[0] = { x: 100, y: 200 }   // FACE_LEFT
  landmarks[16] = { x: 300, y: 200 }  // FACE_RIGHT
  landmarks[17] = { x: 120, y: 100 }  // LEFT_BROW_OUTER
  landmarks[26] = { x: 280, y: 100 }  // RIGHT_BROW_OUTER
  landmarks[8] = { x: 200, y: 300 }   // CHIN
  landmarks[30] = { x: noseX, y: noseY } // NOSE_TIP
  landmarks[36] = { x: leftEyeX, y: leftEyeY }   // LEFT_EYE_OUTER
  landmarks[45] = { x: rightEyeX, y: rightEyeY }  // RIGHT_EYE_OUTER
  return landmarks
}

describe('HeadPoseEstimator', () => {
  let estimator: HeadPoseEstimator

  beforeEach(() => {
    estimator = new HeadPoseEstimator()
  })

  it('returns near-zero pose for centered face', () => {
    const result = estimator.estimate(makeLandmarks())
    expect(Math.abs(result.yaw)).toBeLessThan(5)
    expect(Math.abs(result.pitch)).toBeLessThan(5)
    expect(Math.abs(result.roll)).toBeLessThan(5)
  })

  it('detects positive yaw when nose is right of center', () => {
    const result = estimator.estimate(makeLandmarks({ noseX: 240 }))
    expect(result.yaw).toBeGreaterThan(0)
  })

  it('detects positive roll when right eye is lower (head tilted right)', () => {
    const result = estimator.estimate(makeLandmarks({ rightEyeY: 190 }))
    expect(result.roll).toBeGreaterThan(0)
  })

  it('detects positive pitch when nose is below center', () => {
    const result = estimator.estimate(makeLandmarks({ noseY: 230 }))
    expect(result.pitch).toBeGreaterThan(0)
  })

  it('reset clears smoothing state', () => {
    estimator.estimate(makeLandmarks({ noseX: 250 }))
    estimator.reset()
    const result = estimator.estimate(makeLandmarks())
    expect(Math.abs(result.yaw)).toBeLessThan(5)
  })
})
