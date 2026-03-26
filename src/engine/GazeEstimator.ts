import type { Point } from '@/utils/geometry'
import { EMASmoother } from '@/utils/smoothing'
import { THRESHOLDS } from '@/utils/constants'

const NOSE_TIP = 30
const FACE_LEFT = 0
const FACE_RIGHT = 16
const CHIN = 8
const LEFT_BROW_OUTER = 17
const RIGHT_BROW_OUTER = 26

const SENSITIVITY_X = 1.8
const SENSITIVITY_Y = 12.0

export interface GazeEstimate {
  x: number
  y: number
  rawX: number
  rawY: number
}

export interface CalibrationTransform {
  offsetX: number
  offsetY: number
  scaleX: number
  scaleY: number
}

interface Baseline {
  noseX: number
  noseY: number
  aspectRatio: number
  faceWidth: number
}

export class GazeEstimator {
  private xSmoother = new EMASmoother(THRESHOLDS.GAZE_SMOOTH_ALPHA)
  // Heavier smoothing on Y to filter the noisy aspect-ratio signal
  private ySmoother = new EMASmoother(0.15)
  private aspectSmoother = new EMASmoother(0.2)
  private calibration: CalibrationTransform | null = null
  private baseline: Baseline | null = null
  private frameCount = 0

  setCalibration(transform: CalibrationTransform): void {
    this.calibration = transform
  }

  estimate(landmarks: Point[], _videoWidth: number, _videoHeight: number): GazeEstimate {
    const nose = landmarks[NOSE_TIP]!
    const faceLeft = landmarks[FACE_LEFT]!
    const faceRight = landmarks[FACE_RIGHT]!
    const chin = landmarks[CHIN]!
    const leftBrow = landmarks[LEFT_BROW_OUTER]!
    const rightBrow = landmarks[RIGHT_BROW_OUTER]!

    const faceWidth = faceRight.x - faceLeft.x
    const browY = (leftBrow.y + rightBrow.y) / 2
    const faceHeight = chin.y - browY
    const aspectRatio = faceWidth > 0 ? faceHeight / faceWidth : 1
    const smoothedAspect = this.aspectSmoother.update(aspectRatio)

    this.frameCount++
    if (this.frameCount <= 30) {
      if (this.baseline === null) {
        this.baseline = { noseX: nose.x, noseY: nose.y, aspectRatio: smoothedAspect, faceWidth }
      } else {
        const a = 1 / this.frameCount
        this.baseline.noseX += (nose.x - this.baseline.noseX) * a
        this.baseline.noseY += (nose.y - this.baseline.noseY) * a
        this.baseline.aspectRatio += (smoothedAspect - this.baseline.aspectRatio) * a
        this.baseline.faceWidth += (faceWidth - this.baseline.faceWidth) * a
      }
    }

    const base = this.baseline ?? { noseX: nose.x, noseY: nose.y, aspectRatio: smoothedAspect, faceWidth }
    const scale = faceWidth > 0 ? faceWidth : 1

    // Horizontal: nose X position in frame (strong yaw signal)
    const dx = (nose.x - base.noseX) / scale

    // Vertical: blend aspect ratio change (geometric pitch signal)
    // with nose Y movement in frame (weak but additive)
    const aspectDelta = smoothedAspect - base.aspectRatio
    const noseYDelta = (nose.y - base.noseY) / scale
    // Aspect ratio is the primary signal; nose Y adds whatever small translation exists
    const dy = aspectDelta * 0.7 + noseYDelta * 0.3

    let rawX = 0.5 - dx * SENSITIVITY_X
    let rawY = 0.5 + dy * SENSITIVITY_Y

    if (this.calibration) {
      rawX = rawX * this.calibration.scaleX + this.calibration.offsetX
      rawY = rawY * this.calibration.scaleY + this.calibration.offsetY
    }

    return {
      x: this.xSmoother.update(rawX),
      y: this.ySmoother.update(rawY),
      rawX,
      rawY,
    }
  }

  reset(): void {
    this.xSmoother.reset()
    this.ySmoother.reset()
    this.aspectSmoother.reset()
    this.calibration = null
    this.baseline = null
    this.frameCount = 0
  }
}
