# Gaze Lab — Implementation Summary

## What Was Built

Phase 1 of the Gaze Lab platform: a browser-based experimental UI research tool that uses a webcam to extract face-based input channels (gaze, blinks, expressions, head pose) and feeds them into five interactive experiments.

## Architecture

### Core Engine (`src/engine/`)

- **FaceEngine.ts** — Manages the webcam feed, loads face-api.js models (TinyFaceDetector, 68-point landmarks, expressions), and runs the detection loop via `requestAnimationFrame`. Processes each frame through the signal pipeline and emits results via the SignalBus.
- **BlinkDetector.ts** — Computes Eye Aspect Ratio (EAR) from eye landmarks. Detects blinks (EAR < 0.22), double-blinks (two blinks within 600ms), and left/right winks (asymmetric EAR).
- **ExpressionReader.ts** — Threshold-based classification of face-api.js expression output. Identifies dominant expression (happy, surprised, angry, sad, fearful, disgusted) when confidence exceeds per-expression thresholds.
- **GazeEstimator.ts** — Estimates screen gaze position from nose-tip offset relative to face center. Applies EMA smoothing (alpha=0.3) and optional affine calibration transform.
- **HeadPoseEstimator.ts** — Derives yaw, pitch, and roll from landmark geometry (nose offset, eye-line angle). Smoothed via EMA (alpha=0.2).
- **GestureClassifier.ts** — Classifies head gestures: static tilt detection (roll > 12 degrees) and velocity-based nod/shake detection.
- **SignalBus.ts** — Typed event emitter that broadcasts gaze, blink, expression, and head pose signals to all subscribers.

### Calibration System (`src/calibration/`)

- **CalibrationFlow.tsx** — Full-screen 9-point calibration overlay. User looks at each point for 2 seconds; gaze samples are collected.
- **calibrationMath.ts** — Computes least-squares affine transform (offset + scale, independently per axis) from calibration point pairs.
- **CalibrationStorage.ts** — Persists calibration to localStorage. Invalidates if window resizes by more than 100px.

### React Hooks (`src/hooks/`)

- **useFaceEngine** — Initializes and manages the FaceEngine lifecycle.
- **useSignal** — Generic hook for subscribing to SignalBus events. Eliminates boilerplate.
- **useGazePosition / useExpression** — Thin wrappers over `useSignal`.
- **useElementGaze** — Checks if estimated gaze falls within an element's bounding box.
- **useBlinkEvents** — Dispatches blink/double-blink/wink callbacks.

### Experiments (`src/experiments/`)

| # | Name | Input Channels | Key Hook |
|---|------|---------------|----------|
| 01 | Gaze Buttons | Gaze + dwell | `useDwellActivation` |
| 02 | Number Pick | Gaze + double-blink | `useBlinkConfirm` |
| 03 | Expression Bandwidth | Expressions | `useExpressionLog` |
| 04 | Combo Grid | Gaze + blink + expression + head pose | `useMultiModal` |
| 05 | Gaze Draw | Gaze + blink + expression + head pose | `useGazeCanvas` |

### Shared UI (`src/components/`)

- **CameraFeed** — Mirrored video with landmark overlay canvas.
- **TelemetrySidebar** — Live signal readouts (gaze, EAR, expressions, head pose, FPS).
- **GazeCursor** — Fixed-position gaze indicator overlay.
- **ExperimentShell** — Title + description wrapper for experiments.
- **SignalIndicator** — Reusable signal strength bar.

### Utilities (`src/utils/`)

- **geometry.ts** — Point distance, midpoint, EAR calculation, angle, clamp, normalize.
- **smoothing.ts** — EMA smoother (1D and 2D).
- **timing.ts** — DwellTimer with progress build/decay and activation cooldown.
- **constants.ts** — All thresholds and configuration values.

## Design System

Dark "Lab Console" theme with monospace telemetry aesthetic. Green-on-black accent (`#00ffc8`). Three font families: Syne (display), DM Sans (body), JetBrains Mono (mono).

## Testing

**80 tests across 13 test files**, all passing:

- `tests/utils/` — geometry (19 tests), smoothing (7), timing (6)
- `tests/engine/` — BlinkDetector (6), ExpressionReader (6), GazeEstimator (4), HeadPoseEstimator (5), GestureClassifier (7), SignalBus (5), calibrationMath (7)
- `tests/experiments/` — ExperimentShell (1), SignalIndicator (2)
- `tests/integration/` — signal-pipeline (5)

## Code Review Fixes Applied

- Fixed critical CalibrationFlow bug where gaze drift reset the hold timer (decoupled timer from gaze state)
- Extracted `useSignal` generic hook to eliminate SignalBus subscription boilerplate
- Replaced dual RAF+setInterval in CalibrationFlow with single interval
- Fixed DwellTimer sentinel value bug (used `null` instead of `0` for uninitialized timestamp)

## Not Implemented (Future Phases)

- MediaPipe Face Mesh integration (Phase 2)
- Tongue/eyebrow/cheek detection (Phase 2)
- Eye typing, gesture sequences, face piano (Phase 3)
- Metrics dashboard, accessibility simulation (Phase 4)
- Session recording and CSV/JSON export
