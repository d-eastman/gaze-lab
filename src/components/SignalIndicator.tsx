import { theme } from '@/styles/theme'

interface SignalIndicatorProps {
  label: string
  value: number
  max?: number
  color?: string
}

export function SignalIndicator({ label, value, max = 1, color = theme.colors.accent }: SignalIndicatorProps) {
  const pct = Math.min(100, (value / max) * 100)

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 11, fontFamily: theme.fonts.mono, color: theme.colors.textDim, marginBottom: 2,
      }}>
        <span>{label}</span>
        <span>{value.toFixed(2)}</span>
      </div>
      <div style={{
        height: 4, background: theme.colors.surface2, borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: 2, transition: 'width 100ms',
        }} />
      </div>
    </div>
  )
}
