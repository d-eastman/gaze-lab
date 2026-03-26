import { useEffect, useRef, useState } from 'react'
import { FaceEngine, type FaceEngineState } from '@/engine/FaceEngine'
import { loadCalibration } from '@/calibration/CalibrationStorage'
import type { CalibrationTransform } from '@/engine/GazeEstimator'

const DEFAULT_STATE: FaceEngineState = {
  isReady: false, isDetecting: false, faceDetected: false,
  landmarks: [], expressions: {}, fps: 0,
  gaze: { x: 0.5, y: 0.5, rawX: 0.5, rawY: 0.5 },
  blink: { leftEAR: 1, rightEAR: 1, isBlinking: false, blinkCount: 0, doubleBlink: false, leftWink: false, rightWink: false },
  expression: { dominant: 'neutral', confidence: 0, all: {} },
  headPose: { yaw: 0, pitch: 0, roll: 0 },
  gesture: 'none',
}

export function useFaceEngine() {
  const engineRef = useRef<FaceEngine | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [state, setState] = useState<FaceEngineState>(DEFAULT_STATE)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const engine = new FaceEngine()
    engineRef.current = engine
    engine.setOnStateChange(setState)

    let cancelled = false

    async function start() {
      try {
        await engine.init(video!)
        if (cancelled) {
          engine.destroy()
          return
        }
        const saved = loadCalibration()
        if (saved) engine.setCalibration(saved)
        engine.start()
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to initialize face engine')
        }
      }
    }

    start()

    return () => {
      cancelled = true
      engine.destroy()
      engineRef.current = null
    }
  }, [])

  const setCalibration = (transform: CalibrationTransform) => {
    engineRef.current?.setCalibration(transform)
  }

  return { state, error, videoRef, setCalibration }
}
