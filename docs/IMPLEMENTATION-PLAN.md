# Gaze Lab — Implementation Plan

## Scope

Implement **Phase 1** of the Gaze Lab platform: Core Engine + First 5 Experiments. This covers the full detection pipeline, calibration system, and five foundational experiments that demonstrate webcam-based face input channels.

---

## Step 1: Project Bootstrap

- Initialize Vite + React + TypeScript project
- Install dependencies: `@vladmandic/face-api`, Tailwind CSS v4, vitest, @testing-library/react
- Configure Vite with path aliases (`@/engine`, `@/experiments`, etc.)
- Add script to download face-api.js model weights to `public/models/`
- Scaffold the full folder structure from CLAUDE.md

**Validation:** `npm run dev` serves blank app with no errors.

---

## Step 2: Design System + Shared UI Shell

- Implement `src/styles/theme.ts` with "Lab Console" dark theme tokens
- Implement `src/styles/globals.css` base styles
- Build `src/App.tsx` layout shell with sidebar + tab-based experiment routing
- Build `src/components/ExperimentShell.tsx` wrapper
- Build `src/components/SignalIndicator.tsx` reusable meter

**Validation:** App renders dark-themed shell with tab navigation.

---

## Step 3: FaceEngine + Camera Feed (Phase 1.1)

- `src/engine/FaceEngine.ts`: Camera init, model loading, detection loop via `requestAnimationFrame`
- `src/hooks/useFaceEngine.ts`: React hook exposing `{ isReady, isDetecting, faceDetected, landmarks, expressions, fps }`
- `src/components/CameraFeed.tsx`: Mirrored video + landmark overlay canvas

**Validation:** Webcam feed displays with landmarks drawn on detected face.

---

## Step 4: Signal Processing Layer (Phase 1.2)

- `src/engine/GazeEstimator.ts`: Nose-tip offset gaze estimation + EMA smoothing
- `src/engine/BlinkDetector.ts`: EAR calculation, blink/double-blink/wink detection
- `src/engine/ExpressionReader.ts`: Threshold-based expression classification
- `src/engine/HeadPoseEstimator.ts`: Yaw, pitch, roll from landmarks
- `src/engine/SignalBus.ts`: Typed event emitter for all signals
- `src/utils/geometry.ts`, `smoothing.ts`, `timing.ts`, `constants.ts`
- React hooks: `useGazePosition`, `useElementGaze`, `useBlinkEvents`, `useExpression`
- `src/components/TelemetrySidebar.tsx`: Live signal readouts
- `src/components/GazeCursor.tsx`: Floating gaze indicator

**Validation:** TelemetrySidebar shows live values for all signals.

---

## Step 5: Calibration System (Phase 1.3)

- `src/calibration/CalibrationFlow.tsx`: 9-point full-screen overlay
- `src/calibration/calibrationMath.ts`: Affine transform computation
- `src/calibration/CalibrationStorage.ts`: localStorage persistence
- `src/components/CalibrationOverlay.tsx`: Wraps CalibrationFlow

**Validation:** Calibration flow runs, stores transform, improves gaze accuracy.

---

## Step 6: Experiment 01 — Gaze Buttons (Phase 1.4)

- `src/experiments/01-gaze-buttons/GazeButtons.tsx`: 2x2 grid of large buttons
- `src/experiments/01-gaze-buttons/useDwellActivation.ts`: Dwell timer with decay + progress

**Validation:** Can activate buttons by sustained gaze.

---

## Step 7: Experiment 02 — Number Pick (Phase 1.5)

- `src/experiments/02-number-pick/NumberPick.tsx`: Row of 10 number cells
- `src/experiments/02-number-pick/useBlinkConfirm.ts`: Double-blink selection

**Validation:** Can select numbers via gaze + double-blink.

---

## Step 8: Experiment 03 — Expression Bandwidth (Phase 1.6)

- `src/experiments/03-expression-bandwidth/ExpressionBandwidth.tsx`: 6 expression cards + event log
- `src/experiments/03-expression-bandwidth/useExpressionLog.ts`: Expression transition tracker

**Validation:** Expression cards light up reliably; transitions logged.

---

## Step 9: Experiment 04 — Combo Grid (Phase 1.7)

- `src/experiments/04-combo-grid/ComboGrid.tsx`: 4x3 colored grid
- `src/experiments/04-combo-grid/useMultiModal.ts`: Composes gaze + blink + expression + head pose

**Validation:** Can select, lighten, and darken boxes using only face input.

---

## Step 10: Experiment 05 — Gaze Draw (Phase 1.8)

- `src/experiments/05-gaze-draw/GazeDraw.tsx`: Canvas with gaze cursor
- `src/experiments/05-gaze-draw/useGazeCanvas.ts`: Drawing state machine

**Validation:** Can draw simple shapes using gaze + expressions.

---

## Step 11: Testing

- Unit tests for all utility functions (geometry, smoothing, timing)
- Unit tests for signal detectors (BlinkDetector, GazeEstimator, ExpressionReader, HeadPoseEstimator)
- Component tests for experiment UIs and calibration flow
- Integration tests for detection-to-signal pipeline

---

## Step 12: Code Review + Polish

- Review for DRY violations, idiomatic React/TypeScript patterns
- Simplify over-engineered abstractions
- Ensure consistent error handling and loading states

---

## Step 13: Documentation

- Write `docs/IMPLEMENTATION-EXEC.md` summarizing what was built
- Write `README.md` with setup instructions and usage examples
- Add `.gitignore`
