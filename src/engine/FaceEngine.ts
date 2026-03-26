import * as faceapi from '@vladmandic/face-api'
import type { Point } from '@/utils/geometry'
import { MODEL_PATH } from '@/utils/constants'
import { BlinkDetector, type BlinkState } from './BlinkDetector'
import { ExpressionReader, type ExpressionState } from './ExpressionReader'
import { HeadPoseEstimator, type HeadPose } from './HeadPoseEstimator'
import { GazeEstimator, type GazeEstimate, type CalibrationTransform } from './GazeEstimator'
import { GestureClassifier, type GestureType } from './GestureClassifier'
import { signalBus } from './SignalBus'

export interface FaceEngineState {
  isReady: boolean
  isDetecting: boolean
  faceDetected: boolean
  landmarks: Point[]
  expressions: Record<string, number>
  fps: number
  gaze: GazeEstimate
  blink: BlinkState
  expression: ExpressionState
  headPose: HeadPose
  gesture: GestureType
}

const DEFAULT_BLINK: BlinkState = {
  leftEAR: 1, rightEAR: 1, isBlinking: false,
  blinkCount: 0, doubleBlink: false, leftWink: false, rightWink: false,
}
const DEFAULT_EXPRESSION: ExpressionState = { dominant: 'neutral', confidence: 0, all: {} }
const DEFAULT_HEAD_POSE: HeadPose = { yaw: 0, pitch: 0, roll: 0 }
const DEFAULT_GAZE: GazeEstimate = { x: 0.5, y: 0.5, rawX: 0.5, rawY: 0.5 }

export class FaceEngine {
  private video: HTMLVideoElement | null = null
  private animFrameId = 0
  private frameCount = 0
  private lastFpsTime = 0
  private running = false

  private blinkDetector = new BlinkDetector()
  private expressionReader = new ExpressionReader()
  private headPoseEstimator = new HeadPoseEstimator()
  private gazeEstimator = new GazeEstimator()
  private gestureClassifier = new GestureClassifier()

  private _state: FaceEngineState = {
    isReady: false, isDetecting: false, faceDetected: false,
    landmarks: [], expressions: {}, fps: 0,
    gaze: DEFAULT_GAZE, blink: DEFAULT_BLINK,
    expression: DEFAULT_EXPRESSION, headPose: DEFAULT_HEAD_POSE,
    gesture: 'none',
  }

  private onStateChange: ((state: FaceEngineState) => void) | null = null

  get state(): FaceEngineState {
    return this._state
  }

  setOnStateChange(cb: (state: FaceEngineState) => void): void {
    this.onStateChange = cb
  }

  setCalibration(transform: CalibrationTransform): void {
    this.gazeEstimator.setCalibration(transform)
  }

  async init(videoEl: HTMLVideoElement): Promise<void> {
    this.video = videoEl

    // Load SSD MobilenetV1 (robust, handles glasses/lighting) + full landmarks
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_PATH),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_PATH),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_PATH),
    ])

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
    })
    videoEl.srcObject = stream
    await videoEl.play()

    if (videoEl.videoWidth === 0) {
      await new Promise<void>((resolve) => {
        videoEl.addEventListener('loadeddata', () => resolve(), { once: true })
      })
    }

    this.update({ isReady: true })
  }

  start(): void {
    if (this.running || !this.video) return
    this.running = true
    this.lastFpsTime = performance.now()
    this.frameCount = 0
    this.update({ isDetecting: true })
    this.loop()
  }

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.animFrameId)
    this.update({ isDetecting: false })
  }

  destroy(): void {
    this.stop()
    if (this.video?.srcObject) {
      const tracks = (this.video.srcObject as MediaStream).getTracks()
      tracks.forEach((t) => t.stop())
      this.video.srcObject = null
    }
  }

  private async loop(): Promise<void> {
    if (!this.running || !this.video) return

    let detection
    try {
      detection = await faceapi
        .detectSingleFace(this.video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 }))
        .withFaceLandmarks()
        .withFaceExpressions()
    } catch {
      this.animFrameId = requestAnimationFrame(() => this.loop())
      return
    }

    this.frameCount++
    const now = performance.now()
    const elapsed = now - this.lastFpsTime
    let fps = this._state.fps
    if (elapsed >= 1000) {
      fps = Math.round((this.frameCount / elapsed) * 1000)
      this.frameCount = 0
      this.lastFpsTime = now
    }

    if (detection) {
      const positions = detection.landmarks.positions
      const landmarks: Point[] = positions.map((p) => ({ x: p.x, y: p.y }))

      const rawExpressions: Record<string, number> = {}
      for (const [key, value] of Object.entries(detection.expressions)) {
        rawExpressions[key] = value as number
      }

      const blink = this.blinkDetector.detect(landmarks)
      const expression = this.expressionReader.read(rawExpressions)
      const headPose = this.headPoseEstimator.estimate(landmarks)
      const gaze = this.gazeEstimator.estimate(landmarks, this.video.videoWidth, this.video.videoHeight)
      const gesture = this.gestureClassifier.classify(headPose)

      const timestamp = Date.now()
      signalBus.emit('gaze', { ...gaze, timestamp })
      signalBus.emit('expression', { ...expression, timestamp })
      signalBus.emit('headPose', { ...headPose, timestamp })

      if (blink.doubleBlink) {
        signalBus.emit('blink', { type: 'doubleBlink', timestamp })
      } else if (blink.leftWink) {
        signalBus.emit('blink', { type: 'winkLeft', timestamp })
      } else if (blink.rightWink) {
        signalBus.emit('blink', { type: 'winkRight', timestamp })
      } else if (!blink.isBlinking && this._state.blink.isBlinking) {
        signalBus.emit('blink', { type: 'blink', timestamp })
      }

      this.update({
        faceDetected: true, landmarks, expressions: rawExpressions,
        fps, gaze, blink, expression, headPose, gesture,
      })
    } else {
      this.update({ faceDetected: false, fps })
    }

    this.animFrameId = requestAnimationFrame(() => this.loop())
  }

  private update(partial: Partial<FaceEngineState>): void {
    this._state = { ...this._state, ...partial }
    this.onStateChange?.(this._state)
  }
}
