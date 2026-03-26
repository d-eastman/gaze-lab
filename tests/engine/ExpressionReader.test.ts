import { describe, it, expect } from 'vitest'
import { ExpressionReader } from '@/engine/ExpressionReader'

describe('ExpressionReader', () => {
  const reader = new ExpressionReader()

  it('returns neutral when no expression exceeds threshold', () => {
    const result = reader.read({
      neutral: 0.8, happy: 0.1, surprised: 0.05,
      angry: 0.02, sad: 0.01, fearful: 0.01, disgusted: 0.01,
    })
    expect(result.dominant).toBe('neutral')
    expect(result.confidence).toBe(0.8)
  })

  it('detects happy expression above threshold', () => {
    const result = reader.read({
      neutral: 0.1, happy: 0.85, surprised: 0.02,
      angry: 0.01, sad: 0.01, fearful: 0.01, disgusted: 0.0,
    })
    expect(result.dominant).toBe('happy')
    expect(result.confidence).toBe(0.85)
  })

  it('detects surprised expression', () => {
    const result = reader.read({
      neutral: 0.1, happy: 0.1, surprised: 0.75,
      angry: 0.02, sad: 0.01, fearful: 0.01, disgusted: 0.01,
    })
    expect(result.dominant).toBe('surprised')
  })

  it('picks highest confidence when multiple exceed threshold', () => {
    const result = reader.read({
      neutral: 0.05, happy: 0.75, surprised: 0.65,
      angry: 0.0, sad: 0.0, fearful: 0.0, disgusted: 0.0,
    })
    expect(result.dominant).toBe('happy')
    expect(result.confidence).toBe(0.75)
  })

  it('preserves all expression values', () => {
    const input = {
      neutral: 0.5, happy: 0.3, surprised: 0.1,
      angry: 0.05, sad: 0.03, fearful: 0.01, disgusted: 0.01,
    }
    const result = reader.read(input)
    expect(result.all).toEqual(input)
  })

  it('does not mutate the input object', () => {
    const input = { neutral: 0.8, happy: 0.1 }
    const result = reader.read(input)
    result.all.happy = 999
    expect(input.happy).toBe(0.1)
  })
})
