import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BlinkDetector } from '@/engine/BlinkDetector'
import { ExpressionReader } from '@/engine/ExpressionReader'
import { HeadPoseEstimator } from '@/engine/HeadPoseEstimator'
import { GazeEstimator } from '@/engine/GazeEstimator'
import { GestureClassifier } from '@/engine/GestureClassifier'
import { SignalBus } from '@/engine/SignalBus'
import type { Point } from '@/utils/geometry'

function makeLandmarks(opts: {
  noseX?: number; noseY?: number
  leftEAR?: number; rightEAR?: number
} = {}): Point[] {
  const { noseX = 200, noseY = 200, leftEAR = 0.35, rightEAR = 0.35 } = opts
  const landmarks: Point[] = Array.from({ length: 68 }, () => ({ x: 200, y: 200 }))

  landmarks[0] = { x: 100, y: 200 }
  landmarks[16] = { x: 300, y: 200 }
  landmarks[17] = { x: 120, y: 100 }
  landmarks[21] = { x: 170, y: 105 }
  landmarks[22] = { x: 230, y: 105 }
  landmarks[26] = { x: 280, y: 100 }
  landmarks[27] = { x: 200, y: 140 }
  landmarks[8] = { x: 200, y: 300 }
  landmarks[30] = { x: noseX, y: noseY }
  landmarks[36] = { x: 150, y: 170 }
  landmarks[45] = { x: 250, y: 170 }

  // Eyes
  const vertL = leftEAR * 10
  landmarks[36] = { x: 140, y: 170 }
  landmarks[37] = { x: 143, y: 170 - vertL }
  landmarks[38] = { x: 147, y: 170 - vertL }
  landmarks[39] = { x: 150, y: 170 }
  landmarks[40] = { x: 147, y: 170 + vertL }
  landmarks[41] = { x: 143, y: 170 + vertL }

  const vertR = rightEAR * 10
  landmarks[42] = { x: 250, y: 170 }
  landmarks[43] = { x: 253, y: 170 - vertR }
  landmarks[44] = { x: 257, y: 170 - vertR }
  landmarks[45] = { x: 260, y: 170 }
  landmarks[46] = { x: 257, y: 170 + vertR }
  landmarks[47] = { x: 253, y: 170 + vertR }

  return landmarks
}

describe('Signal Pipeline Integration', () => {
  let bus: SignalBus
  let blinkDetector: BlinkDetector
  let expressionReader: ExpressionReader
  let headPoseEstimator: HeadPoseEstimator
  let gazeEstimator: GazeEstimator
  let gestureClassifier: GestureClassifier

  beforeEach(() => {
    bus = new SignalBus()
    blinkDetector = new BlinkDetector()
    expressionReader = new ExpressionReader()
    headPoseEstimator = new HeadPoseEstimator()
    gazeEstimator = new GazeEstimator()
    gestureClassifier = new GestureClassifier()
  })

  function processFrame(
    landmarks: Point[],
    expressions: Record<string, number>,
    videoWidth = 640,
    videoHeight = 480,
  ) {
    const blink = blinkDetector.detect(landmarks)
    const expression = expressionReader.read(expressions)
    const headPose = headPoseEstimator.estimate(landmarks)
    const gaze = gazeEstimator.estimate(landmarks, videoWidth, videoHeight)
    const gesture = gestureClassifier.classify(headPose)

    const timestamp = Date.now()
    bus.emit('gaze', { ...gaze, timestamp })
    bus.emit('expression', { ...expression, timestamp })
    bus.emit('headPose', { ...headPose, timestamp })

    if (blink.doubleBlink) {
      bus.emit('blink', { type: 'doubleBlink', timestamp })
    }

    return { blink, expression, headPose, gaze, gesture }
  }

  it('processes a full frame and emits all signals', () => {
    const gazeListener = vi.fn()
    const exprListener = vi.fn()
    const poseListener = vi.fn()

    bus.on('gaze', gazeListener)
    bus.on('expression', exprListener)
    bus.on('headPose', poseListener)

    const landmarks = makeLandmarks()
    const expressions = { neutral: 0.8, happy: 0.1 }
    processFrame(landmarks, expressions)

    expect(gazeListener).toHaveBeenCalledOnce()
    expect(exprListener).toHaveBeenCalledOnce()
    expect(poseListener).toHaveBeenCalledOnce()
  })

  it('detects expression change across frames', () => {
    const exprListener = vi.fn()
    bus.on('expression', exprListener)

    // Frame 1: neutral
    processFrame(makeLandmarks(), { neutral: 0.9, happy: 0.05 })
    expect(exprListener).toHaveBeenCalledWith(
      expect.objectContaining({ dominant: 'neutral' })
    )

    // Frame 2: happy
    processFrame(makeLandmarks(), { neutral: 0.1, happy: 0.85 })
    expect(exprListener).toHaveBeenLastCalledWith(
      expect.objectContaining({ dominant: 'happy' })
    )
  })

  it('detects blink when EAR drops', () => {
    const landmarks = makeLandmarks({ leftEAR: 0.05, rightEAR: 0.05 })
    const result = processFrame(landmarks, { neutral: 0.8 })
    expect(result.blink.isBlinking).toBe(true)
  })

  it('gaze tracks nose movement', () => {
    const centered = processFrame(makeLandmarks({ noseX: 200 }), { neutral: 0.8 })
    const rightward = processFrame(makeLandmarks({ noseX: 220 }), { neutral: 0.8 })
    // Mirrored: nose right in camera = screen left
    expect(rightward.gaze.x).toBeLessThan(centered.gaze.x)
  })

  it('calibration improves gaze mapping', () => {
    // Without calibration
    const uncalibrated = gazeEstimator.estimate(makeLandmarks(), 640, 480)

    // Apply calibration that shifts everything
    gazeEstimator.setCalibration({ offsetX: 0.1, offsetY: 0.05, scaleX: 1, scaleY: 1 })
    // Reset smoother to avoid EMA influence
    gazeEstimator.reset()
    gazeEstimator.setCalibration({ offsetX: 0.1, offsetY: 0.05, scaleX: 1, scaleY: 1 })
    const calibrated = gazeEstimator.estimate(makeLandmarks(), 640, 480)

    expect(calibrated.rawX).not.toBeCloseTo(uncalibrated.rawX, 2)
  })
})
