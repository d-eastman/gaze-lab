export class EMASmoother {
  private value: number | null = null
  private alpha: number

  constructor(alpha: number) {
    this.alpha = alpha
  }

  update(raw: number): number {
    if (this.value === null) {
      this.value = raw
    } else {
      this.value = this.alpha * raw + (1 - this.alpha) * this.value
    }
    return this.value
  }

  get current(): number {
    return this.value ?? 0
  }

  reset(): void {
    this.value = null
  }
}

export class EMAPoint2D {
  private xSmoother: EMASmoother
  private ySmoother: EMASmoother

  constructor(alpha: number) {
    this.xSmoother = new EMASmoother(alpha)
    this.ySmoother = new EMASmoother(alpha)
  }

  update(x: number, y: number): { x: number; y: number } {
    return {
      x: this.xSmoother.update(x),
      y: this.ySmoother.update(y),
    }
  }

  get current(): { x: number; y: number } {
    return { x: this.xSmoother.current, y: this.ySmoother.current }
  }

  reset(): void {
    this.xSmoother.reset()
    this.ySmoother.reset()
  }
}
