import type { FaceEngineState } from '@/engine/FaceEngine'
import { SignalIndicator } from './SignalIndicator'
import { theme } from '@/styles/theme'

interface TelemetrySidebarProps {
  state: FaceEngineState
}

export function TelemetrySidebar({ state }: TelemetrySidebarProps) {
  const { isReady, isDetecting, faceDetected, fps, gaze, blink, expression, headPose, gesture } = state

  const statusText = !isReady ? 'LOADING MODELS...' :
    !isDetecting ? 'STARTING...' :
    faceDetected ? 'FACE DETECTED' : 'NO FACE'
  const statusColor = !isReady || !isDetecting ? theme.colors.accentWarm :
    faceDetected ? theme.colors.accent : theme.colors.accentDanger

  return (
    <div style={{ padding: 12, fontSize: 12, fontFamily: theme.fonts.mono }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ color: statusColor }}>
          {statusText}
        </span>
        <span style={{ color: theme.colors.textDim }}>{fps} fps</span>
      </div>

      <Section title="Gaze">
        <SignalIndicator label="X" value={gaze.x} />
        <SignalIndicator label="Y" value={gaze.y} />
      </Section>

      <Section title="Eyes">
        <SignalIndicator label="L EAR" value={blink.leftEAR} />
        <SignalIndicator label="R EAR" value={blink.rightEAR} />
        <Row label="Blinks" value={blink.blinkCount} />
        <Row label="Blinking" value={blink.isBlinking ? 'YES' : 'no'} />
      </Section>

      <Section title="Expression">
        <Row label="Dominant" value={expression.dominant} />
        <SignalIndicator label="Confidence" value={expression.confidence} />
      </Section>

      <Section title="Head Pose">
        <SignalIndicator label="Yaw" value={headPose.yaw} max={45} />
        <SignalIndicator label="Pitch" value={headPose.pitch} max={30} />
        <SignalIndicator label="Roll" value={headPose.roll} max={30} />
        <Row label="Gesture" value={gesture} />
      </Section>

    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 10, fontWeight: 600, color: theme.colors.textDim,
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
        borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: 4,
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      fontSize: 11, color: theme.colors.textDim, marginBottom: 4,
    }}>
      <span>{label}</span>
      <span style={{ color: theme.colors.text }}>{value}</span>
    </div>
  )
}
