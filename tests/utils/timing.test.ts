import { describe, it, expect } from 'vitest'
import { DwellTimer } from '@/utils/timing'

describe('DwellTimer', () => {
  it('starts at 0 progress', () => {
    const timer = new DwellTimer(1000)
    expect(timer.currentProgress).toBe(0)
    expect(timer.activated).toBe(false)
  })

  it('builds progress when active', () => {
    const timer = new DwellTimer(1000)
    timer.tick(true, 0)
    timer.tick(true, 500)
    expect(timer.currentProgress).toBe(0.5)
    expect(timer.activated).toBe(false)
  })

  it('activates when progress reaches 1', () => {
    const timer = new DwellTimer(1000)
    timer.tick(true, 0)
    timer.tick(true, 1000)
    expect(timer.activated).toBe(true)
  })

  it('decays when inactive', () => {
    const timer = new DwellTimer(1000, 2)
    timer.tick(true, 0)
    timer.tick(true, 500)
    expect(timer.currentProgress).toBe(0.5)
    // Decay at 2x rate
    timer.tick(false, 750)
    // 0.5 - (250 * 2 / 1000) = 0.5 - 0.5 = 0
    expect(timer.currentProgress).toBe(0)
  })

  it('does not go below 0', () => {
    const timer = new DwellTimer(1000, 2)
    timer.tick(true, 0)
    timer.tick(false, 5000)
    expect(timer.currentProgress).toBe(0)
  })

  it('reset clears all state', () => {
    const timer = new DwellTimer(1000)
    timer.tick(true, 0)
    timer.tick(true, 1000)
    expect(timer.activated).toBe(true)
    timer.reset()
    expect(timer.activated).toBe(false)
    expect(timer.currentProgress).toBe(0)
  })
})
