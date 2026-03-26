import type { Point } from '@/utils/geometry'
import { angleBetweenPoints } from '@/utils/geometry'
import { EMASmoother } from '@/utils/smoothing'
import { THRESHOLDS } from '@/utils/constants'

export interface HeadPose {
  yaw: number
  pitch: number
  roll: number
}

// 68-landmark model key indices
const NOSE_TIP = 30
const LEFT_EYE_OUTER = 36
const RIGHT_EYE_OUTER = 45
const FACE_LEFT = 0
const FACE_RIGHT = 16
const LEFT_BROW_OUTER = 17
const RIGHT_BROW_OUTER = 26
const CHIN = 8

export class HeadPoseEstimator {
  private yawSmoother = new EMASmoother(THRESHOLDS.HEAD_SMOOTH_ALPHA)
  private pitchSmoother = new EMASmoother(THRESHOLDS.HEAD_SMOOTH_ALPHA)
  private rollSmoother = new EMASmoother(THRESHOLDS.HEAD_SMOOTH_ALPHA)

  estimate(landmarks: Point[]): HeadPose {
    const nose = landmarks[NOSE_TIP]!
    const faceLeft = landmarks[FACE_LEFT]!
    const faceRight = landmarks[FACE_RIGHT]!
    const chin = landmarks[CHIN]!
    const leftBrow = landmarks[LEFT_BROW_OUTER]!
    const rightBrow = landmarks[RIGHT_BROW_OUTER]!

    const faceTopY = (leftBrow.y + rightBrow.y) / 2
    const faceCenterX = (faceLeft.x + faceRight.x) / 2
    const faceCenterY = (faceTopY + chin.y) / 2
    const faceWidth = faceRight.x - faceLeft.x
    const faceHeight = chin.y - faceTopY

    // Yaw: nose X offset from face center, normalized to degrees
    const rawYaw = faceWidth > 0 ? ((nose.x - faceCenterX) / faceWidth) * 45 : 0

    // Pitch: nose Y offset from face center, normalized to degrees
    const rawPitch = faceHeight > 0 ? ((nose.y - faceCenterY) / faceHeight) * 30 : 0

    // Roll: angle of the line between eye corners
    const leftEye = landmarks[LEFT_EYE_OUTER]!
    const rightEye = landmarks[RIGHT_EYE_OUTER]!
    const rawRoll = angleBetweenPoints(leftEye, rightEye)

    return {
      yaw: this.yawSmoother.update(rawYaw),
      pitch: this.pitchSmoother.update(rawPitch),
      roll: this.rollSmoother.update(rawRoll),
    }
  }

  reset(): void {
    this.yawSmoother.reset()
    this.pitchSmoother.reset()
    this.rollSmoother.reset()
  }
}
