import { useState, useCallback } from 'react'
import { useFaceEngine } from '@/hooks/useFaceEngine'
import { CameraFeed } from '@/components/CameraFeed'
import { TelemetrySidebar } from '@/components/TelemetrySidebar'
import { GazeCursor } from '@/components/GazeCursor'
import { CalibrationFlow } from '@/calibration/CalibrationFlow'
import { GazeButtons } from '@/experiments/01-gaze-buttons/GazeButtons'
import { NumberPick } from '@/experiments/02-number-pick/NumberPick'
import { ExpressionBandwidth } from '@/experiments/03-expression-bandwidth/ExpressionBandwidth'
import { ComboGrid } from '@/experiments/04-combo-grid/ComboGrid'
import { GazeDraw } from '@/experiments/05-gaze-draw/GazeDraw'
import type { CalibrationTransform } from '@/engine/GazeEstimator'
import { theme } from '@/styles/theme'

const TABS = [
  { id: 'gaze-buttons', label: '01 Gaze Buttons', component: GazeButtons },
  { id: 'number-pick', label: '02 Number Pick', component: NumberPick },
  { id: 'expression', label: '03 Expression', component: ExpressionBandwidth },
  { id: 'combo-grid', label: '04 Combo Grid', component: ComboGrid },
  { id: 'gaze-draw', label: '05 Gaze Draw', component: GazeDraw },
] as const

export function App() {
  const { state, error, videoRef, setCalibration } = useFaceEngine()
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id)
  const [calibrating, setCalibrating] = useState(false)

  const handleCalibrationComplete = useCallback((transform: CalibrationTransform) => {
    setCalibration(transform)
    setCalibrating(false)
  }, [setCalibration])

  const ActiveExperiment = TABS.find((t) => t.id === activeTab)!.component

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{
        width: 280, flexShrink: 0,
        background: theme.colors.surface, borderRight: `1px solid ${theme.colors.border}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 12px 8px',
          fontFamily: theme.fonts.display, fontSize: 18, fontWeight: 700,
          color: theme.colors.accent, borderBottom: `1px solid ${theme.colors.border}`,
        }}>
          GAZE LAB
        </div>

        <CameraFeed videoRef={videoRef} landmarks={state.landmarks} />

        {error && (
          <div style={{
            padding: 12, fontSize: 12, color: theme.colors.accentDanger,
            fontFamily: theme.fonts.mono,
          }}>
            {error}
          </div>
        )}

        <button
          onClick={() => setCalibrating(true)}
          style={{
            margin: '8px 12px', padding: '6px 12px',
            background: theme.colors.surface2, color: theme.colors.textDim,
            border: `1px solid ${theme.colors.border}`, borderRadius: 6,
            cursor: 'pointer', fontFamily: theme.fonts.mono, fontSize: 11,
          }}
        >
          Calibrate
        </button>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <TelemetrySidebar state={state} />
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          display: 'flex', borderBottom: `1px solid ${theme.colors.border}`,
          background: theme.colors.surface, overflowX: 'auto',
        }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 16px', fontSize: 12, fontFamily: theme.fonts.mono,
                background: activeTab === tab.id ? theme.colors.bg : 'transparent',
                color: activeTab === tab.id ? theme.colors.accent : theme.colors.textDim,
                border: 'none', borderBottom: activeTab === tab.id ? `2px solid ${theme.colors.accent}` : '2px solid transparent',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          <ActiveExperiment />
        </div>
      </div>

      <GazeCursor visible={state.faceDetected} />

      {calibrating && (
        <CalibrationFlow
          gazeX={state.gaze.x}
          gazeY={state.gaze.y}
          onComplete={handleCalibrationComplete}
          onCancel={() => setCalibrating(false)}
        />
      )}
    </div>
  )
}
