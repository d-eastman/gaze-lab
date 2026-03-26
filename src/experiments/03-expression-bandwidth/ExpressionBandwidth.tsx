import { ExperimentShell } from '@/components/ExperimentShell'
import { useExpression } from '@/hooks/useExpression'
import { useExpressionLog } from './useExpressionLog'
import { theme } from '@/styles/theme'
import { THRESHOLDS } from '@/utils/constants'

const EXPRESSIONS: { name: string; threshold: number; emoji: string }[] = [
  { name: 'happy', threshold: THRESHOLDS.EXPR_HAPPY, emoji: '😊' },
  { name: 'surprised', threshold: THRESHOLDS.EXPR_SURPRISED, emoji: '😲' },
  { name: 'angry', threshold: THRESHOLDS.EXPR_ANGRY, emoji: '😠' },
  { name: 'sad', threshold: THRESHOLDS.EXPR_SAD, emoji: '😢' },
  { name: 'fearful', threshold: THRESHOLDS.EXPR_FEARFUL, emoji: '😨' },
  { name: 'disgusted', threshold: THRESHOLDS.EXPR_DISGUSTED, emoji: '🤢' },
]

export function ExpressionBandwidth() {
  const expression = useExpression()
  const { log, clear } = useExpressionLog()

  return (
    <ExperimentShell
      title="03 — Expression Bandwidth"
      description="See which facial expressions are detected and their confidence levels."
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {EXPRESSIONS.map(({ name, threshold, emoji }) => {
          const value = expression.all[name] ?? 0
          const active = value >= threshold
          return (
            <div
              key={name}
              style={{
                padding: 16, borderRadius: theme.radii.md,
                border: `2px solid ${active ? theme.colors.accent : theme.colors.border}`,
                background: active ? `${theme.colors.accent}11` : theme.colors.surface,
                textAlign: 'center', transition: 'all 200ms',
              }}
            >
              <div style={{ fontSize: 32 }}>{emoji}</div>
              <div style={{
                fontFamily: theme.fonts.mono, fontSize: 12, marginTop: 8,
                color: active ? theme.colors.accent : theme.colors.textDim,
                textTransform: 'capitalize',
              }}>
                {name}
              </div>
              <div style={{
                fontFamily: theme.fonts.mono, fontSize: 18, fontWeight: 600,
                color: active ? theme.colors.text : theme.colors.textDim,
                marginTop: 4,
              }}>
                {(value * 100).toFixed(0)}%
              </div>
              <div style={{
                height: 3, borderRadius: 2, marginTop: 8,
                background: theme.colors.surface2, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${value * 100}%`,
                  background: active ? theme.colors.accent : theme.colors.textDim,
                  transition: 'width 100ms',
                }} />
              </div>
            </div>
          )
        })}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 8,
      }}>
        <span style={{ fontSize: 12, fontFamily: theme.fonts.mono, color: theme.colors.textDim }}>
          EVENT LOG ({log.length})
        </span>
        <button
          onClick={clear}
          style={{
            padding: '2px 10px', fontSize: 11, fontFamily: theme.fonts.mono,
            background: theme.colors.surface2, color: theme.colors.textDim,
            border: `1px solid ${theme.colors.border}`, borderRadius: 4, cursor: 'pointer',
          }}
        >
          Clear
        </button>
      </div>
      <div style={{
        maxHeight: 160, overflow: 'auto',
        background: theme.colors.surface, borderRadius: theme.radii.sm,
        padding: 8,
      }}>
        {log.length === 0 && (
          <div style={{ color: theme.colors.textDim, fontSize: 12, fontFamily: theme.fonts.mono }}>
            Waiting for expression changes...
          </div>
        )}
        {log.map((entry, i) => (
          <div key={i} style={{
            fontSize: 11, fontFamily: theme.fonts.mono, color: theme.colors.textDim,
            padding: '2px 0', borderBottom: `1px solid ${theme.colors.surface2}`,
          }}>
            <span style={{ color: theme.colors.accent }}>{new Date(entry.timestamp).toLocaleTimeString()}</span>
            {' '}
            <span style={{ color: theme.colors.text, textTransform: 'capitalize' }}>{entry.expression}</span>
            {' '}
            ({(entry.confidence * 100).toFixed(0)}%)
          </div>
        ))}
      </div>
    </ExperimentShell>
  )
}
