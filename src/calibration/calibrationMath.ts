import type { CalibrationTransform } from '@/engine/GazeEstimator'

interface CalibrationPoint {
  predicted: { x: number; y: number }
  actual: { x: number; y: number }
}

/**
 * Compute an affine transform (offset + scale) from calibration data.
 * Uses least-squares fit: actual = predicted * scale + offset
 */
export function computeCalibration(points: CalibrationPoint[]): CalibrationTransform {
  if (points.length === 0) {
    return { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 }
  }

  const n = points.length

  // Compute means
  let sumPx = 0, sumPy = 0, sumAx = 0, sumAy = 0
  for (const p of points) {
    sumPx += p.predicted.x
    sumPy += p.predicted.y
    sumAx += p.actual.x
    sumAy += p.actual.y
  }
  const meanPx = sumPx / n
  const meanPy = sumPy / n
  const meanAx = sumAx / n
  const meanAy = sumAy / n

  // Compute scale via least-squares (independently for X and Y)
  let numX = 0, denX = 0, numY = 0, denY = 0
  for (const p of points) {
    const dpx = p.predicted.x - meanPx
    const dpy = p.predicted.y - meanPy
    const dax = p.actual.x - meanAx
    const day = p.actual.y - meanAy
    numX += dpx * dax
    denX += dpx * dpx
    numY += dpy * day
    denY += dpy * dpy
  }

  const scaleX = denX > 0.0001 ? numX / denX : 1
  const scaleY = denY > 0.0001 ? numY / denY : 1

  const offsetX = meanAx - scaleX * meanPx
  const offsetY = meanAy - scaleY * meanPy

  return { offsetX, offsetY, scaleX, scaleY }
}

/** Generate the 9 calibration target positions (normalized 0-1). */
export function getCalibrationTargets(): { x: number; y: number }[] {
  const positions = [0.15, 0.5, 0.85]
  const targets: { x: number; y: number }[] = []
  for (const y of positions) {
    for (const x of positions) {
      targets.push({ x, y })
    }
  }
  return targets
}
