# CLAUDE.md — GAZE LAB: Eye & Expression Input Experiment Platform

## Project Identity

**Name:** Gaze Lab
**Tagline:** "How many input channels does a human face have?"
**Type:** Experimental UI research platform — browser-based, webcam-powered
**Stack:** TypeScript + React (Vite) + face-api.js / MediaPipe Face Mesh
**License:** Personal experimental / open-source

---

## Mission

Explore the boundaries of non-touch, non-voice human-computer interaction using only a webcam. The core research question: **How many simultaneous, reliable input channels can we extract from a human face?**

Channels under investigation:

| Channel | Signal | Reliability Target | Notes |
|---------|--------|-------------------|-------|
| **Gaze direction** | Head pose + eye landmark offset | Medium | Proxy via nose-tip + pupil position; no IR tracking |
| **Dwell activation** | Sustained gaze on target | High | 1–2s dwell = "click"; most accessible pattern |
| **Blink** | Eye aspect ratio (EAR) drop | High | Single blink vs double blink as distinct signals |
| **Smile** | `happy` expression confidence | High | face-api.js expression model; >0.7 threshold |
| **Surprise** | `surprised` expression + mouth open | Medium | Mouth aspect ratio as secondary signal |
| **Frown/Anger** | `angry` expression confidence | Low | Harder to isolate from neutral |
| **Eyebrow raise** | Landmark displacement (brow vs eye) | Low–Medium | Custom calculation from landmarks 17–26 |
| **Tongue out** | Not natively supported | Experimental | Requires MediaPipe Face Mesh 478-point model |
| **Head tilt** | Roll angle from landmark geometry | Medium | Left/right tilt as binary signal |
| **Head nod/shake** | Pitch/yaw velocity | Medium | Derivative of head pose over time |
| **Wink (L/R)** | Asymmetric EAR | Low–Medium | Distinguishing intentional wink from natural blink |
| **Puff cheeks** | Cheek landmark displacement | Experimental | MediaPipe only; face-api.js lacks resolution |

---

## Architecture

### High-Level

```
┌─────────────────────────────────────────────────┐
│                   Browser App                    │
│                                                  │
│  ┌──────────┐  ┌────────────┐  ┌──────────────┐ │
│  │  Camera   │→│  Detection  │→│  Signal       │ │
│  │  Feed     │  │  Engine     │  │  Processor   │ │
│  └──────────┘  └────────────┘  └──────┬───────┘ │
│                                       │         │
│                    ┌──────────────────┘         │
│                    ▼                             │
│  ┌─────────────────────────────────────────────┐ │
│  │           Experiment Router                  │ │
│  │                                              │ │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │ │
│  │  │Exp 1│ │Exp 2│ │Exp 3│ │Exp 4│ │Exp 5│  │ │
│  │  │Gaze │ │Num  │ │Expr │ │Combo│ │Draw │  │ │
│  │  │Btns │ │Pick │ │Band │ │Grid │ │Canvas│  │ │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘  │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌──────────────┐  ┌──────────────────────────┐ │
│  │  Telemetry    │  │  Session Recorder        │ │
│  │  Sidebar      │  │  (metrics + replay)      │ │
│  └──────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Module Breakdown

```
gaze-lab/
├── CLAUDE.md                          # This file
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── public/
│   └── models/                        # face-api.js model weights (downloaded at build)
├── src/
│   ├── main.tsx                       # App entry
│   ├── App.tsx                        # Layout shell + tab routing
│   ├── engine/                        # Detection + signal processing
│   │   ├── FaceEngine.ts              # Camera init, face-api detection loop
│   │   ├── GazeEstimator.ts           # Head-pose + pupil → screen coords
│   │   ├── BlinkDetector.ts           # EAR calculation, single/double blink
│   │   ├── ExpressionReader.ts        # Threshold-based expression classification
│   │   ├── HeadPoseEstimator.ts       # Yaw, pitch, roll from landmarks
│   │   ├── GestureClassifier.ts       # Composite gesture detection (wink, nod, shake)
│   │   ├── CalibrationManager.ts      # Multi-point calibration flow
│   │   └── SignalBus.ts               # Event emitter for all detected signals
│   ├── experiments/                   # Each experiment is a self-contained module
│   │   ├── types.ts                   # Shared experiment interface
│   │   ├── 01-gaze-buttons/
│   │   │   ├── GazeButtons.tsx
│   │   │   └── useDwellActivation.ts
│   │   ├── 02-number-pick/
│   │   │   ├── NumberPick.tsx
│   │   │   └── useBlinkConfirm.ts
│   │   ├── 03-expression-bandwidth/
│   │   │   ├── ExpressionBandwidth.tsx
│   │   │   └── useExpressionLog.ts
│   │   ├── 04-combo-grid/
│   │   │   ├── ComboGrid.tsx
│   │   │   └── useMultiModal.ts
│   │   ├── 05-gaze-draw/
│   │   │   ├── GazeDraw.tsx
│   │   │   └── useGazeCanvas.ts
│   │   ├── 06-tongue-commands/        # Phase 2
│   │   │   ├── TongueCommands.tsx
│   │   │   └── useTongueDetection.ts
│   │   ├── 07-eye-typing/             # Phase 3
│   │   │   ├── EyeTyper.tsx
│   │   │   └── useDwellKeyboard.ts
│   │   ├── 08-gesture-combos/         # Phase 3
│   │   │   ├── GestureCombos.tsx
│   │   │   └── useGestureSequence.ts
│   │   ├── 09-face-piano/             # Phase 3
│   │   │   ├── FacePiano.tsx
│   │   │   └── useFaceInstrument.ts
│   │   └── 10-accessibility-sim/      # Phase 4
│   │       ├── AccessibilitySim.tsx
│   │       └── useAccessibilityMode.ts
│   ├── components/                    # Shared UI
│   │   ├── CameraFeed.tsx             # Video + overlay canvas
│   │   ├── TelemetrySidebar.tsx       # Real-time signal readouts
│   │   ├── GazeCursor.tsx             # Floating gaze indicator
│   │   ├── CalibrationOverlay.tsx     # Full-screen calibration flow
│   │   ├── ExperimentShell.tsx        # Title + desc + content wrapper
│   │   └── SignalIndicator.tsx        # Reusable signal strength meter
│   ├── hooks/
│   │   ├── useFaceEngine.ts           # React wrapper for FaceEngine
│   │   ├── useGazePosition.ts         # Smoothed screen coordinates
│   │   ├── useElementGaze.ts          # "Is the user looking at this element?"
│   │   ├── useBlinkEvents.ts          # Blink/double-blink event stream
│   │   ├── useExpression.ts           # Current dominant expression
│   │   └── useSessionRecorder.ts      # Metrics capture for analysis
│   ├── calibration/
│   │   ├── CalibrationFlow.tsx        # 9-point calibration UI
│   │   ├── calibrationMath.ts         # Affine transform from calibration data
│   │   └── CalibrationStorage.ts      # Persist calibration to localStorage
│   ├── metrics/
│   │   ├── SessionRecorder.ts         # Captures timestamped signal data
│   │   ├── AccuracyCalculator.ts      # Gaze accuracy metrics (degrees of error)
│   │   ├── ChannelReliability.ts      # Per-channel signal/noise analysis
│   │   └── MetricsDashboard.tsx       # Post-session analysis view
│   ├── utils/
│   │   ├── geometry.ts                # Vector math, EAR, distances
│   │   ├── smoothing.ts              # Exponential smoothing, Kalman filter
│   │   ├── timing.ts                  # Dwell timers, debounce, velocity
│   │   └── constants.ts               # Thresholds, timing values, model paths
│   └── styles/
│       ├── theme.ts                   # Design tokens
│       └── globals.css                # Base styles
└── tests/
    ├── engine/
    │   ├── BlinkDetector.test.ts
    │   ├── GazeEstimator.test.ts
    │   └── GestureClassifier.test.ts
    ├── experiments/
    │   ├── GazeButtons.test.tsx
    │   ├── NumberPick.test.tsx
    │   └── ComboGrid.test.tsx
    └── utils/
        ├── geometry.test.ts
        └── smoothing.test.ts
```

---

## Phased Delivery Plan

### Phase 1: Core Engine + First 5 Experiments

**Goal:** Working detection loop, calibration, and the five foundational experiments.

#### Phase 1.0 — Project Bootstrap
- [ ] `npm create vite@latest gaze-lab -- --template react-ts`
- [ ] Install deps: `face-api.js`, `@vladmandic/face-api` (better maintained fork), Tailwind CSS
- [ ] Configure Vite with path aliases (`@/engine`, `@/experiments`, etc.)
- [ ] Download face-api.js model weights to `public/models/` (tiny_face_detector, face_landmark_68_tiny, face_expression)
- [ ] Scaffold folder structure per architecture above
- [ ] **Validation gate:** `npm run dev` serves blank app with no errors

#### Phase 1.1 — FaceEngine + Camera
- [ ] `FaceEngine.ts`: Initialize camera stream, load models, run detection loop via `requestAnimationFrame`
- [ ] Target: 15+ fps detection on modern hardware with `TinyFaceDetector` (inputSize: 320)
- [ ] `useFaceEngine` hook: Exposes `{ isReady, isDetecting, faceDetected, landmarks, expressions, fps }`
- [ ] `CameraFeed.tsx`: Mirror video + landmark overlay canvas
- [ ] **Validation gate:** Webcam feed displays with green dots on detected face landmarks

#### Phase 1.2 — Signal Processing Layer
- [ ] `GazeEstimator.ts`:
  - Compute face bounding box center as base position
  - Compute nose-tip offset from face center (proxy for gaze direction)
  - Compute eye center position for refinement
  - Map to normalized screen coordinates [0, 1]
  - Apply exponential moving average (EMA) smoothing (alpha = 0.3)
  - Expose `{ gazeX, gazeY, rawGazeX, rawGazeY }`
- [ ] `BlinkDetector.ts`:
  - Eye Aspect Ratio: `EAR = (|p1-p5| + |p2-p4|) / (2 * |p0-p3|)` per eye
  - Blink threshold: EAR < 0.22
  - Double-blink: Two blinks within 600ms window
  - Wink detection: Left EAR < 0.22 AND Right EAR > 0.28 (or vice versa)
  - Expose `{ isBlinking, blinkCount, doubleBlink, leftWink, rightWink, leftEAR, rightEAR }`
- [ ] `ExpressionReader.ts`:
  - Thresholds: happy > 0.7, surprised > 0.6, angry > 0.5, sad > 0.5, fearful > 0.5, disgusted > 0.5
  - Expose `{ dominant, confidence, all: Record<string, number> }`
- [ ] `HeadPoseEstimator.ts`:
  - Yaw from nose X offset × 45°
  - Pitch from nose Y offset × 30°
  - Roll from eye-line angle
  - Expose `{ yaw, pitch, roll }`
- [ ] `SignalBus.ts`: Typed EventEmitter
  - Events: `gaze`, `blink`, `doubleBlink`, `wink`, `expression`, `headPose`, `gesture`
  - All events carry timestamp for session recording
- [ ] **Validation gate:** `TelemetrySidebar` shows live values for all signals; blink detection accurately fires on real blinks with <5% false positive rate

#### Phase 1.3 — Calibration System
- [ ] `CalibrationFlow.tsx`: Full-screen overlay with 9-point calibration
  - Points: center + 8 positions at 15%/50%/85% grid
  - User looks at each point for 2 seconds
  - Collect average gaze estimate per point
  - Visual: glowing dot + progress indicator per point
- [ ] `calibrationMath.ts`: Compute affine transform (offset + scale) from collected data
  - Least-squares fit from 9 predicted→actual point pairs
  - Apply transform in `GazeEstimator` post-processing
- [ ] `CalibrationStorage.ts`: Persist to localStorage, prompt recalibration if window resizes significantly
- [ ] **Validation gate:** After calibration, gaze cursor tracks to within ~100px of actual gaze target on a 1080p screen for large quadrant-level regions

#### Phase 1.4 — Experiment 01: Gaze Buttons
- [ ] 4 large buttons in 2×2 grid
- [ ] `useDwellActivation(elementRef, { dwellTime: 1500, onActivate, onProgress })`
  - Uses `useElementGaze` to check if gaze is inside element bounds
  - Tracks cumulative dwell time with decay when gaze leaves
  - Progress bar fill animation
  - Fires `onActivate` when dwell threshold reached
  - Cooldown period after activation (1000ms)
- [ ] Visual states: idle → gazing (border glow + fill bar) → activated (pulse + scale)
- [ ] Each button triggers a visible side effect (screen flash, counter increment, color change, sound)
- [ ] **Validation gate:** Can reliably activate each of the 4 buttons by looking at them; <20% accidental activation rate

#### Phase 1.5 — Experiment 02: Number Pick
- [ ] Row of 10 number cells (1–10)
- [ ] Gaze highlights current number (expanded hit area: ±20px vertical)
- [ ] `useBlinkConfirm()`: Double-blink locks in the gazed number
- [ ] Visual: gazed number lifts + glows; locked number pulses gold
- [ ] Result display with confirmation message
- [ ] Reset mechanism (triple blink or button)
- [ ] **Validation gate:** Can select any target number within 3 attempts

#### Phase 1.6 — Experiment 03: Expression Bandwidth
- [ ] 6 expression cards with real-time confidence percentages
- [ ] Detection threshold visualization (cards light up when expression > threshold)
- [ ] Running event log with timestamps
- [ ] Expression transition detection (log when dominant expression changes)
- [ ] Mini-challenge: "Make this face" prompts (show target expression, detect if user matches)
- [ ] **Validation gate:** Happy and surprised reliably detected at >80% accuracy; log correctly captures expression transitions

#### Phase 1.7 — Experiment 04: Combo Grid
- [ ] 4×3 grid of colored boxes
- [ ] Multi-modal input stacking:
  - **Gaze** = target a box (green border highlight)
  - **Double-blink** = select/deselect (gold indicator dot)
  - **Smile** = lighten color (+0.5 lightness per frame while smiling, while gazing at box)
  - **Surprise** = darken color (−0.5 lightness per frame)
  - **Head tilt left** = shift hue −1
  - **Head tilt right** = shift hue +1
- [ ] `useMultiModal()`: Composes `useElementGaze` + `useBlinkEvents` + `useExpression` + head pose
- [ ] Instruction bar showing active gestures
- [ ] **Validation gate:** Can select a box, lighten it noticeably, and darken a different box — all without touching keyboard/mouse

#### Phase 1.8 — Experiment 05: Gaze Draw
- [ ] Canvas element with gaze-controlled cursor position
- [ ] Double-blink toggles pen up/down
- [ ] Smile cycles pen color
- [ ] Surprise increases pen width; frown decreases
- [ ] Head tilt controls pen opacity
- [ ] Clear button (gaze-activated via dwell)
- [ ] **Validation gate:** Can draw a recognizable simple shape (circle, square, smiley face)

---

### Phase 2: Advanced Detection + New Experiments

**Goal:** Upgrade to MediaPipe for 478-point face mesh; add tongue, eyebrow, and cheek detection.

#### Phase 2.0 — MediaPipe Migration
- [ ] Add `@mediapipe/face_mesh` or `@mediapipe/tasks-vision`
- [ ] Create `MediaPipeFaceEngine.ts` as drop-in replacement for face-api.js engine
- [ ] Map 478 landmarks to existing signal processors
- [ ] Key new landmarks:
  - Inner lip points (tongue visibility detection)
  - Cheek points (puff detection)
  - Individual eyebrow points (raise detection per side)
  - Iris landmarks (direct pupil tracking — major gaze accuracy upgrade)
- [ ] Feature flag to toggle between face-api.js and MediaPipe engines
- [ ] **Validation gate:** All Phase 1 experiments still work identically with MediaPipe backend; gaze accuracy improves with iris tracking

#### Phase 2.1 — Iris-Based Gaze Tracking
- [ ] Use MediaPipe iris landmarks (468–477) for direct pupil position
- [ ] Compute iris position relative to eye corner landmarks
- [ ] Map iris offset to gaze angle
- [ ] Expected accuracy improvement: ~50px → ~30px on 1080p
- [ ] Recalibrate with iris data
- [ ] **Validation gate:** Gaze cursor noticeably more precise; can distinguish adjacent number cells (56px wide) at >60% accuracy

#### Phase 2.2 — Experiment 06: Tongue Commands
- [ ] Detect tongue out via lip aperture + lower lip displacement
  - Mouth openness without surprise expression = tongue likely
  - MediaPipe lip landmarks inner vs outer gap analysis
- [ ] Tongue as a binary toggle (out / in)
- [ ] Experiment: 4 screen quadrants, each with a command
  - Look at quadrant (gaze) → tongue out (confirm) → action fires
- [ ] Track tongue detection reliability metrics
- [ ] **Validation gate:** Tongue-out detected at >70% accuracy with <10% false positive during normal talking/expressions

#### Phase 2.3 — Experiment: Eyebrow Semaphore
- [ ] Detect individual eyebrow raise (left, right, both)
- [ ] Use as 3 distinct signals: left raise, right raise, both raise
- [ ] Experiment: Binary message encoding
  - Left brow = 0, Right brow = 1, Both brows = "submit"
  - Encode short binary messages character by character
- [ ] Display decoded characters in real-time
- [ ] **Validation gate:** Can independently detect left vs right eyebrow raise at >60% accuracy

---

### Phase 3: Complex Interaction Experiments

**Goal:** Push toward practical applications — typing, music, sequential gestures.

#### Phase 3.0 — Experiment 07: Eye Typer
- [ ] On-screen QWERTY keyboard with large keys
- [ ] Dwell activation for letter selection (800ms dwell — faster than Phase 1 buttons)
- [ ] Prediction/autocomplete row above keyboard
- [ ] Blink for space, double-blink for backspace
- [ ] Smile for word prediction accept
- [ ] Track WPM (words per minute) — target: 5+ WPM
- [ ] **Validation gate:** Can type a 5-word sentence correctly within 3 minutes

#### Phase 3.1 — Experiment 08: Gesture Sequences
- [ ] Define gesture alphabet: blink, wink-L, wink-R, smile, surprise, brow-raise
- [ ] Gesture sequence recognition (e.g., "blink-blink-smile" = command A)
- [ ] Configurable command mapping
- [ ] Visual gesture history timeline
- [ ] Rhythm-based gestures (timing matters — quick-quick-slow vs slow-slow-quick)
- [ ] **Validation gate:** Can execute 4 distinct 3-gesture sequences at >70% accuracy

#### Phase 3.2 — Experiment 09: Face Piano
- [ ] Musical notes mapped to facial expressions + gaze position
- [ ] Gaze Y position = pitch (look up = high note, look down = low note)
- [ ] Smile = play note, surprise = play chord
- [ ] Blink = percussion hit
- [ ] Head tilt = volume/panning
- [ ] Uses Web Audio API or Tone.js
- [ ] **Validation gate:** Can play a recognizable 4-note melody

---

### Phase 4: Analysis + Accessibility Research

**Goal:** Measure everything, export data, explore assistive technology applications.

#### Phase 4.0 — Metrics Dashboard
- [ ] `SessionRecorder.ts`: Captures all signals at 30Hz with timestamps
- [ ] Export to CSV/JSON for analysis
- [ ] Per-channel metrics:
  - Signal-to-noise ratio
  - False positive/negative rates
  - Latency (signal → detection)
  - User fatigue curve (accuracy over time)
- [ ] Visualization: accuracy heatmaps, signal timelines, channel comparison charts
- [ ] **Validation gate:** Can record a 5-minute session and export clean data with all channels represented

#### Phase 4.1 — Experiment 10: Accessibility Simulation
- [ ] Simulate "hands-free computing" — navigate a mock UI using only face signals
- [ ] Tasks: Open an app, navigate a menu, compose a short message, submit a form
- [ ] Measure time-to-complete vs mouse/keyboard baseline
- [ ] Explore combination of gaze + switch scanning (blink = select in scan mode)
- [ ] Research notes on practical accessibility applications
- [ ] **Validation gate:** Can complete all 4 tasks using only face input; document findings

---

## Technical Decisions & Constraints

### Detection Library Choice

| Library | Pros | Cons | Use When |
|---------|------|------|----------|
| **face-api.js** | Simple API, expressions built-in, CDN-loadable | 68 landmarks only, no iris/tongue, less maintained | Phase 1 (rapid prototyping) |
| **MediaPipe Face Mesh** | 478 landmarks, iris tracking, WASM-accelerated, Google-maintained | More complex setup, no built-in expressions | Phase 2+ (precision work) |
| **TensorFlow.js FaceLandmarksDetection** | TF ecosystem, flexible | Heavier bundle | Only if MediaPipe unavailable |

**Decision:** Start with face-api.js (Phase 1) for fast iteration. Migrate to MediaPipe (Phase 2) for iris tracking and advanced landmark detection. Abstract behind `FaceEngine` interface so experiments are backend-agnostic.

### Gaze Estimation Strategy

We do NOT have infrared eye tracking hardware. Our gaze estimation is approximate, based on:

1. **Face position in frame** — Where is the face relative to the camera? If face is left-of-center, user is likely looking right (mirror).
2. **Nose-tip offset** — Nose tip relative to face bounding box center provides head orientation proxy.
3. **Iris position (Phase 2)** — Pupil position within the eye opening is the strongest web-only gaze signal.
4. **Calibration transform** — Affine mapping from estimated gaze to actual screen position.

**Expected accuracy:** ~150px uncalibrated → ~80px calibrated (Phase 1) → ~40px with iris tracking (Phase 2). This means we design experiments for **large targets** (quadrants, big buttons) not pixel-precise pointing.

### Performance Budget

- Detection loop: ≥15 fps (face-api.js TinyFaceDetector) or ≥25 fps (MediaPipe)
- Signal processing: <2ms per frame
- UI re-render: standard React 18 batching
- Total input latency (camera frame → UI response): <150ms
- Memory: <200MB total (models + video buffer)

### Smoothing & Filtering

- **Gaze position:** Exponential Moving Average (EMA) with α=0.3 (responsive but stable)
  - Consider Kalman filter in Phase 2 for velocity prediction
- **Expression values:** Direct pass-through (already smoothed by model)
- **Blink detection:** Threshold + minimum duration (>50ms) to filter micro-fluctuations
- **Head pose:** EMA with α=0.2 (slower response acceptable)

---

## Key Constants & Thresholds

```typescript
// src/utils/constants.ts

export const THRESHOLDS = {
  // Blink detection
  EAR_BLINK: 0.22,           // Eye Aspect Ratio below this = eyes closed
  EAR_WINK_CLOSED: 0.22,     // Winking eye threshold
  EAR_WINK_OPEN: 0.28,       // Non-winking eye must be above this
  BLINK_MIN_DURATION_MS: 50,  // Ignore EAR dips shorter than this
  DOUBLE_BLINK_WINDOW_MS: 600, // Two blinks within this = double blink

  // Dwell activation
  DWELL_TIME_MS: 1500,        // Exp 1: button activation
  DWELL_FAST_MS: 800,         // Exp 7: keyboard (trained users)
  DWELL_DECAY_RATE: 2,        // Dwell progress decays 2x faster than it builds

  // Expressions
  EXPR_HAPPY: 0.70,
  EXPR_SURPRISED: 0.60,
  EXPR_ANGRY: 0.50,
  EXPR_SAD: 0.50,
  EXPR_FEARFUL: 0.50,
  EXPR_DISGUSTED: 0.50,

  // Gaze smoothing
  GAZE_SMOOTH_ALPHA: 0.3,
  HEAD_SMOOTH_ALPHA: 0.2,

  // Head pose (degrees)
  HEAD_TILT_THRESHOLD: 12,    // Roll > 12° = deliberate tilt
  HEAD_NOD_VELOCITY: 15,      // Pitch change > 15°/s = nod
  HEAD_SHAKE_VELOCITY: 20,    // Yaw change > 20°/s = shake

  // Calibration
  CALIB_HOLD_TIME_MS: 2000,   // Look at each point for 2s
  CALIB_POINTS: 9,
  RECALIB_RESIZE_THRESHOLD: 100, // Recalibrate if window changes by 100px+
} as const;
```

---

## Testing Strategy

### Unit Tests (Vitest)
- All geometry/math utilities: EAR calculation, coordinate transforms, smoothing
- Signal detectors with mock landmark data: BlinkDetector, GestureClassifier
- Threshold logic for each expression channel

### Component Tests (React Testing Library)
- Experiment components render correctly in each state
- Dwell activation progresses and fires callback
- Calibration flow advances through all points

### Integration Tests
- Full detection → signal → experiment pipeline with recorded landmark data
- Calibration → gaze mapping accuracy with known input/output pairs

### Manual Test Protocol
Each experiment has a manual validation checklist (see Validation Gates in phase plan). Run these with a real webcam in varied conditions:
- Good lighting (desk lamp on face)
- Dim lighting (screen light only)
- Glasses vs no glasses
- Distance: 18", 24", 36" from camera
- Off-axis: face at 15° angle to camera

---

## Design System

### Aesthetic: "Lab Console"
Dark theme, monospace telemetry, green-on-black accent. Feels like a research instrument, not a consumer app.

### Tokens

```typescript
export const theme = {
  colors: {
    bg: '#0a0b0f',
    surface: '#12141a',
    surface2: '#1a1d26',
    border: '#2a2d3a',
    text: '#e8e6e3',
    textDim: '#6b6f7b',
    accent: '#00ffc8',       // Primary: gaze/active
    accentDanger: '#ff3d71', // Alert/error
    accentPurple: '#7b61ff', // Secondary highlights
    accentWarm: '#ffc107',   // Selection/confirm
  },
  fonts: {
    display: "'Syne', sans-serif",
    body: "'DM Sans', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
  },
} as const;
```

### Layout Rules
- Sidebar (280px fixed): Camera feed + telemetry. Always visible during experiments.
- Main area: Tab navigation + experiment panel. Each experiment fills available space.
- Gaze cursor: Fixed-position overlay, `pointer-events: none`, `z-index: 9999`.

---

## Development Workflow

### Commands
```bash
npm run dev          # Vite dev server (HTTPS required for camera)
npm run build        # Production build
npm run test         # Vitest
npm run test:watch   # Vitest watch mode
npm run lint         # ESLint + TypeScript strict
```

### HTTPS for Camera
`getUserMedia` requires HTTPS or localhost. For local dev:
```bash
# Vite handles localhost automatically
# For network testing (mobile, etc.):
npm run dev -- --host --https
```

### Model Files
face-api.js models are loaded from CDN in the prototype. For the Vite project, download to `public/models/`:
```bash
# Add to package.json scripts:
"models:download": "node scripts/download-models.js"
```

---

## Research Questions to Track

As we build, maintain a running log of observations:

1. **Channel independence:** Can you smile while maintaining steady gaze? Does blinking disrupt gaze position?
2. **Fatigue:** How long can a user operate gaze-only input before accuracy degrades? Track per-session accuracy curves.
3. **Learning curve:** Does gaze activation accuracy improve with practice? Measure across sessions.
4. **Expression crosstalk:** When detecting "surprise", does it interfere with blink detection? Map the interference matrix.
5. **Lighting sensitivity:** Which signals degrade most in poor lighting? Rank by robustness.
6. **Glasses impact:** Do glasses affect EAR calculation? Does glare cause false blinks?
7. **Simultaneous channels:** What's the maximum number of independent channels a user can control simultaneously? Hypothesis: 3 (gaze + blink + one expression).
8. **Latency perception:** At what detection-to-UI latency does gaze input feel "broken"? Expected threshold: ~200ms.
9. **Tongue detection feasibility:** Can mouth openness + non-surprised expression reliably detect tongue? Or does it need the 478-point mesh?
10. **Musical control:** Is facial expression expressive enough for musical performance, or is it limited to binary triggers?

---

## Glossary

| Term | Definition |
|------|-----------|
| **EAR** | Eye Aspect Ratio — ratio of vertical to horizontal eye opening; drops during blinks |
| **Dwell activation** | Triggering an action by looking at a target for a sustained duration |
| **Gaze cursor** | On-screen indicator showing estimated gaze position |
| **Channel** | A single input signal (gaze, blink, smile, etc.) that can carry independent information |
| **Bandwidth** | The information throughput of a channel — binary (on/off) vs continuous (0–1 range) |
| **Crosstalk** | When activating one channel unintentionally triggers another |
| **Affine transform** | Linear mapping (offset + scale) applied to calibrate raw gaze to screen coords |
| **face-api.js** | JavaScript face detection library (68-point landmark model + expression classifier) |
| **MediaPipe** | Google's ML framework; Face Mesh provides 478-point landmarks + iris tracking |
| **Signal bus** | Event system that broadcasts detected signals to all experiments |

---

## References

- face-api.js: https://github.com/vladmandic/face-api (maintained fork)
- MediaPipe Face Mesh: https://developers.google.com/mediapipe/solutions/vision/face_landmarker
- Eye Aspect Ratio paper: Soukupová & Čech, "Real-Time Eye Blink Detection using Facial Landmarks" (2016)
- WebGazer.js (reference implementation): https://webgazer.cs.brown.edu/
- Dwell time UX research: Majaranta & Bulling, "Eye Tracking and Eye-Based Human–Computer Interaction" (2014)
