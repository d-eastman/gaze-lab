import type { CalibrationTransform } from '@/engine/GazeEstimator'

const STORAGE_KEY = 'gaze-lab-calibration'
const WINDOW_SIZE_KEY = 'gaze-lab-calibration-window'
import { THRESHOLDS } from '@/utils/constants'

export function saveCalibration(transform: CalibrationTransform): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transform))
  localStorage.setItem(WINDOW_SIZE_KEY, JSON.stringify({ w: window.innerWidth, h: window.innerHeight }))
}

export function loadCalibration(): CalibrationTransform | null {
  const data = localStorage.getItem(STORAGE_KEY)
  const sizeData = localStorage.getItem(WINDOW_SIZE_KEY)
  if (!data) return null

  // Check if window has resized significantly since calibration
  if (sizeData) {
    const { w, h } = JSON.parse(sizeData) as { w: number; h: number }
    if (
      Math.abs(w - window.innerWidth) > THRESHOLDS.RECALIB_RESIZE_THRESHOLD ||
      Math.abs(h - window.innerHeight) > THRESHOLDS.RECALIB_RESIZE_THRESHOLD
    ) {
      return null
    }
  }

  return JSON.parse(data) as CalibrationTransform
}

export function clearCalibration(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(WINDOW_SIZE_KEY)
}
