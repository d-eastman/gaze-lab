import { describe, it, expect, beforeEach } from 'vitest'
import { GestureClassifier } from '@/engine/GestureClassifier'

describe('GestureClassifier', () => {
  let classifier: GestureClassifier

  beforeEach(() => {
    classifier = new GestureClassifier()
  })

  it('returns none for neutral pose', () => {
    expect(classifier.classify({ yaw: 0, pitch: 0, roll: 0 })).toBe('none')
  })

  it('detects tiltLeft when roll is negative', () => {
    expect(classifier.classify({ yaw: 0, pitch: 0, roll: -15 })).toBe('tiltLeft')
  })

  it('detects tiltRight when roll is positive', () => {
    expect(classifier.classify({ yaw: 0, pitch: 0, roll: 15 })).toBe('tiltRight')
  })

  it('does not detect tilt below threshold', () => {
    expect(classifier.classify({ yaw: 0, pitch: 0, roll: 10 })).toBe('none')
    expect(classifier.classify({ yaw: 0, pitch: 0, roll: -10 })).toBe('none')
  })

  it('detects nod from fast pitch change', () => {
    const now = 1000
    classifier.classify({ yaw: 0, pitch: 0, roll: 0 }, now)
    // 20° change in 100ms = 200°/s, well above threshold of 15°/s
    const result = classifier.classify({ yaw: 0, pitch: 20, roll: 0 }, now + 100)
    expect(result).toBe('nod')
  })

  it('detects shake from fast yaw change', () => {
    const now = 1000
    classifier.classify({ yaw: 0, pitch: 0, roll: 0 }, now)
    const result = classifier.classify({ yaw: 25, pitch: 0, roll: 0 }, now + 100)
    expect(result).toBe('shake')
  })

  it('reset clears previous pose', () => {
    classifier.classify({ yaw: 0, pitch: 0, roll: 0 }, 1000)
    classifier.reset()
    // After reset, no velocity reference — should return none (or tilt if applicable)
    const result = classifier.classify({ yaw: 25, pitch: 0, roll: 0 }, 1100)
    expect(result).toBe('none')
  })
})
