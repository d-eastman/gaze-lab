import { THRESHOLDS } from '@/utils/constants'

export interface ExpressionState {
  dominant: string
  confidence: number
  all: Record<string, number>
}

const EXPRESSION_THRESHOLDS: Record<string, number> = {
  happy: THRESHOLDS.EXPR_HAPPY,
  surprised: THRESHOLDS.EXPR_SURPRISED,
  angry: THRESHOLDS.EXPR_ANGRY,
  sad: THRESHOLDS.EXPR_SAD,
  fearful: THRESHOLDS.EXPR_FEARFUL,
  disgusted: THRESHOLDS.EXPR_DISGUSTED,
}

export class ExpressionReader {
  read(expressions: Record<string, number>): ExpressionState {
    let dominant = 'neutral'
    let confidence = 0

    for (const [expr, value] of Object.entries(expressions)) {
      if (expr === 'neutral') continue
      const threshold = EXPRESSION_THRESHOLDS[expr]
      if (threshold !== undefined && value >= threshold && value > confidence) {
        dominant = expr
        confidence = value
      }
    }

    if (dominant === 'neutral') {
      confidence = expressions['neutral'] ?? 0
    }

    return { dominant, confidence, all: { ...expressions } }
  }
}
