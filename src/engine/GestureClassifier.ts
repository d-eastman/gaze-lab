import type { HeadPose } from './HeadPoseEstimator'
import { THRESHOLDS } from '@/utils/constants'

export type GestureType = 'tiltLeft' | 'tiltRight' | 'nod' | 'shake' | 'none'

export class GestureClassifier {
  private lastPose: HeadPose | null = null
  private lastTime = 0

  classify(pose: HeadPose, now: number = Date.now()): GestureType {
    // Tilt detection (static threshold)
    if (pose.roll < -THRESHOLDS.HEAD_TILT_THRESHOLD) return 'tiltLeft'
    if (pose.roll > THRESHOLDS.HEAD_TILT_THRESHOLD) return 'tiltRight'

    // Velocity-based nod/shake detection
    if (this.lastPose && this.lastTime > 0) {
      const dt = (now - this.lastTime) / 1000
      if (dt > 0 && dt < 0.5) {
        const pitchVelocity = Math.abs(pose.pitch - this.lastPose.pitch) / dt
        const yawVelocity = Math.abs(pose.yaw - this.lastPose.yaw) / dt

        if (pitchVelocity > THRESHOLDS.HEAD_NOD_VELOCITY) {
          this.lastPose = pose
          this.lastTime = now
          return 'nod'
        }
        if (yawVelocity > THRESHOLDS.HEAD_SHAKE_VELOCITY) {
          this.lastPose = pose
          this.lastTime = now
          return 'shake'
        }
      }
    }

    this.lastPose = pose
    this.lastTime = now
    return 'none'
  }

  reset(): void {
    this.lastPose = null
    this.lastTime = 0
  }
}
