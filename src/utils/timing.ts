export class DwellTimer {
  private progress = 0
  private lastTick: number | null = null
  private _activated = false
  private dwellTimeMs: number
  private decayRate: number
  private cooldownMs: number

  constructor(dwellTimeMs: number, decayRate = 2, cooldownMs = 1000) {
    this.dwellTimeMs = dwellTimeMs
    this.decayRate = decayRate
    this.cooldownMs = cooldownMs
  }

  tick(isActive: boolean, now: number = Date.now()): number {
    if (this.lastTick === null) {
      this.lastTick = now
      return this.progress
    }

    const dt = now - this.lastTick
    this.lastTick = now

    if (this._activated) {
      this.progress = Math.max(0, this.progress - (dt / this.cooldownMs))
      if (this.progress <= 0) {
        this._activated = false
        this.progress = 0
      }
      return this.progress
    }

    if (isActive) {
      this.progress = Math.min(1, this.progress + dt / this.dwellTimeMs)
      if (this.progress >= 1) {
        this._activated = true
      }
    } else {
      this.progress = Math.max(0, this.progress - (dt * this.decayRate) / this.dwellTimeMs)
    }

    return this.progress
  }

  get activated(): boolean {
    return this._activated
  }

  get currentProgress(): number {
    return this.progress
  }

  reset(): void {
    this.progress = 0
    this.lastTick = null
    this._activated = false
  }
}
