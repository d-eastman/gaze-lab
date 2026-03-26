export interface Point {
  x: number
  y: number
}

export function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/**
 * Eye Aspect Ratio from 6 landmark points around one eye.
 * EAR = (|p1-p5| + |p2-p4|) / (2 * |p0-p3|)
 * Points: p0=outer corner, p1=upper-outer, p2=upper-inner,
 *         p3=inner corner, p4=lower-inner, p5=lower-outer
 */
export function eyeAspectRatio(eye: Point[]): number {
  if (eye.length < 6) return 1
  const vertical1 = distance(eye[1], eye[5])
  const vertical2 = distance(eye[2], eye[4])
  const horizontal = distance(eye[0], eye[3])
  if (horizontal === 0) return 1
  return (vertical1 + vertical2) / (2 * horizontal)
}

export function angleBetweenPoints(a: Point, b: Point): number {
  return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5
  return clamp((value - min) / (max - min), 0, 1)
}
