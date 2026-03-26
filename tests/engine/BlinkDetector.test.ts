import { describe, it, expect, beforeEach } from 'vitest'
import { BlinkDetector } from '@/engine/BlinkDetector'
import type { Point } from '@/utils/geometry'

// Create 68 landmarks with configurable eye state
function makeLandmarks(leftEAR: number, rightEAR: number): Point[] {
  const landmarks: Point[] = Array.from({ length: 68 }, () => ({ x: 0, y: 0 }))

  // Left eye (indices 36-41): set points to produce desired EAR
  // EAR = (|p1-p5| + |p2-p4|) / (2 * |p0-p3|)
  // Set horizontal = 10, vertical based on desired EAR
  const vertL = leftEAR * 10 // since denominator is 2*10=20, each vertical = EAR*10
  landmarks[36] = { x: 0, y: 5 }   // outer corner
  landmarks[37] = { x: 3, y: 5 - vertL }  // upper outer
  landmarks[38] = { x: 7, y: 5 - vertL }  // upper inner
  landmarks[39] = { x: 10, y: 5 }  // inner corner
  landmarks[40] = { x: 7, y: 5 + vertL }  // lower inner
  landmarks[41] = { x: 3, y: 5 + vertL }  // lower outer

  // Right eye (indices 42-47)
  const vertR = rightEAR * 10
  landmarks[42] = { x: 20, y: 5 }
  landmarks[43] = { x: 23, y: 5 - vertR }
  landmarks[44] = { x: 27, y: 5 - vertR }
  landmarks[45] = { x: 30, y: 5 }
  landmarks[46] = { x: 27, y: 5 + vertR }
  landmarks[47] = { x: 23, y: 5 + vertR }

  return landmarks
}

describe('BlinkDetector', () => {
  let detector: BlinkDetector

  beforeEach(() => {
    detector = new BlinkDetector()
  })

  it('reports open eyes when EAR is high', () => {
    const landmarks = makeLandmarks(0.35, 0.35)
    const state = detector.detect(landmarks)
    expect(state.isBlinking).toBe(false)
    expect(state.leftEAR).toBeGreaterThan(0.20)
    expect(state.rightEAR).toBeGreaterThan(0.20)
  })

  it('detects blink when both EARs are low', () => {
    const landmarks = makeLandmarks(0.05, 0.05)
    const state = detector.detect(landmarks)
    expect(state.isBlinking).toBe(true)
  })

  it('detects left wink', () => {
    const landmarks = makeLandmarks(0.05, 0.35)
    const state = detector.detect(landmarks)
    expect(state.leftWink).toBe(true)
    expect(state.rightWink).toBe(false)
  })

  it('detects right wink', () => {
    const landmarks = makeLandmarks(0.35, 0.05)
    const state = detector.detect(landmarks)
    expect(state.rightWink).toBe(true)
    expect(state.leftWink).toBe(false)
  })

  it('increments blink count on blink-release transition', async () => {
    const open = makeLandmarks(0.35, 0.35)
    const closed = makeLandmarks(0.05, 0.05)

    // Establish open baseline for the EMA smoother
    for (let i = 0; i < 5; i++) detector.detect(open)
    // Sustain closed for several frames so EMA drops below threshold
    for (let i = 0; i < 5; i++) detector.detect(closed)

    // Wait for minimum blink duration
    await new Promise((r) => setTimeout(r, 100))

    // Release — several open frames to bring EMA back up
    for (let i = 0; i < 5; i++) detector.detect(open)
    const state = detector.detect(open)
    expect(state.blinkCount).toBe(1)
  })

  it('reset clears state', () => {
    const closed = makeLandmarks(0.05, 0.05)
    const open = makeLandmarks(0.35, 0.35)
    detector.detect(open)
    detector.detect(closed)
    detector.detect(open) // blink
    detector.reset()
    const state = detector.detect(open)
    expect(state.blinkCount).toBe(0)
  })
})
