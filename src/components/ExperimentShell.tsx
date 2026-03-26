import { type ReactNode } from 'react'
import { theme } from '@/styles/theme'

interface ExperimentShellProps {
  title: string
  description: string
  children: ReactNode
}

export function ExperimentShell({ title, description, children }: ExperimentShellProps) {
  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{
          fontFamily: theme.fonts.display, fontSize: 24, fontWeight: 700,
          color: theme.colors.accent, marginBottom: 4,
        }}>
          {title}
        </h2>
        <p style={{ color: theme.colors.textDim, fontSize: 14 }}>{description}</p>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        {children}
      </div>
    </div>
  )
}
