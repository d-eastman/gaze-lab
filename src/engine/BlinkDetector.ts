import type { Point } from '@/utils/geometry'
import { eyeAspectRatio } from '@/utils/geometry'
import { THRESHOLDS } from '@/utils/constants'

// 68-landmark model eye indices
const LEFT_EYE_INDICES = [36, 37, 38, 39, 40, 41]
const RIGHT_EYE_INDICES = [42, 43, 44, 45, 46, 47]

export interface BlinkState {
  leftEAR: number
  rightEAR: number
  isBlinking: boolean
  blinkCount: number
  doubleBlink: boolean
  leftWink: boolean
  rightWink: boolean
}

export class BlinkDetector {
  private blinkCount = 0
  private wasBlinking = false
  private blinkStartTime = 0
  private lastBlinkTime = 0
  private pendingDoubleBlink = false

  detect(landmarks: Point[]): BlinkState {
    const leftEye = LEFT_EYE_INDICES.map((i) => landmarks[i]!)
    const rightEye = RIGHT_EYE_INDICES.map((i) => landmarks[i]!)

    const leftEAR = eyeAspectRatio(leftEye)
    const rightEAR = eyeAspectRatio(rightEye)
    const avgEAR = (leftEAR + rightEAR) / 2

    const isBlinking = avgEAR < THRESHOLDS.EAR_BLINK
    const now = Date.now()

    let doubleBlink = false

    if (isBlinking && !this.wasBlinking) {
      this.blinkStartTime = now
    }

    if (!isBlinking && this.wasBlinking) {
      const blinkDuration = now - this.blinkStartTime
      if (blinkDuration >= THRESHOLDS.BLINK_MIN_DURATION_MS) {
        this.blinkCount++
        if (this.pendingDoubleBlink && now - this.lastBlinkTime < THRESHOLDS.DOUBLE_BLINK_WINDOW_MS) {
          doubleBlink = true
          this.pendingDoubleBlink = false
        } else {
          this.pendingDoubleBlink = true
        }
        this.lastBlinkTime = now
      }
    }

    if (this.pendingDoubleBlink && now - this.lastBlinkTime >= THRESHOLDS.DOUBLE_BLINK_WINDOW_MS) {
      this.pendingDoubleBlink = false
    }

    const leftWink = leftEAR < THRESHOLDS.EAR_WINK_CLOSED && rightEAR > THRESHOLDS.EAR_WINK_OPEN
    const rightWink = rightEAR < THRESHOLDS.EAR_WINK_CLOSED && leftEAR > THRESHOLDS.EAR_WINK_OPEN

    this.wasBlinking = isBlinking

    return { leftEAR, rightEAR, isBlinking, blinkCount: this.blinkCount, doubleBlink, leftWink, rightWink }
  }

  reset(): void {
    this.blinkCount = 0
    this.wasBlinking = false
    this.blinkStartTime = 0
    this.lastBlinkTime = 0
    this.pendingDoubleBlink = false
  }
}
