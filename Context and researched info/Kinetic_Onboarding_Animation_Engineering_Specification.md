# Kinetic: Onboarding Animation Engineering Specification
*Complete Mathematical Physics, Spring Presets, Easing Curves, and Interactive Choreography for the 7-Stage Onboarding Flow.*

---

## 1. Global Motion Design System & Physics Tokens

In strict accordance with Kinetic brand invariants in `AGENTS.md`:
> **"Story-Driven Motion: Motion must do real work (guiding the eye, recalculating velocity curves, demonstrating buffer resilience). If the user notices the animation before the product, the motion is too loud."**

All animations in Kinetic are categorized into three physical regimes:
1. **Tactile Springs**: For direct manipulation, touch feedback, and physical collisions.
2. **Kinematic Curves**: For linear data tracing, trajectory curves, and mathematical reveals.
3. **Ambient Rotations & Particulates**: Shader-driven, frame-budgeted WebGL loops running off the main thread.

### 1.1 Core Spring & Easing Presets

```typescript
// src/lib/motion-tokens.ts

export const MOTION_PRESETS = {
  // Snappy: For card clicks, button presses, selection toggles
  snappySpring: {
    type: "spring",
    stiffness: 500,
    damping: 32,
    mass: 1.0, // Damping ratio ~0.72 (subtle tactile crispness, no floatiness)
  },

  // Smooth: For sliding pill indicators, layoutId transitions, drawers
  smoothSpring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 1.0, // Damping ratio ~0.87 (near-critical damping, minimal overshoot)
  },

  // Heavy Press: For press-and-hold depression states
  holdDepression: {
    type: "spring",
    stiffness: 520,
    damping: 30,
    mass: 1.0,
  },

  // Decisive Pop: For commitment lock-in and confirmation states
  commitOvershoot: {
    type: "spring",
    stiffness: 700,
    damping: 14,
    mass: 0.8,
  },

  // Easing Curves (Cubic Bezier)
  curves: {
    // Sharp entry for mathematical curves
    velocityTrace: [0.16, 1.0, 0.3, 1.0], // Snappy initial burst, smooth deceleration
    // Standard screen exit / advance
    stepTransition: [0.25, 1.0, 0.5, 1.0],
    // Asymmetric rewind when cancelling a hold
    asymmetricRewind: [0.22, 1.0, 0.36, 1.0],
    // Linear progression
    linear: [0.0, 0.0, 1.0, 1.0],
  },

  // Durations (Milliseconds)
  durations: {
    micro: 150,     // Tooltips, hover borders, tag pills
    standard: 250,  // Card transitions, input glows, active state swaps
    modal: 350,     // Step slide transitions
    holdCommit: 1200, // Long-press pact affirmation
    calibration: 3500 // 4-act algorithmic calibration sequence
  }
} as const;
```

---

## 2. Stage-by-Stage Detailed Animation Specifications

```mermaid
sequenceDiagram
    autonumber
    participant UI as Interface Components
    participant Motion as Framer Motion / WebGL
    participant Haptic as Haptic Engine (Vibration API)

    Note over UI, Haptic: STAGE 1: Burnout Audit
    UI->>Motion: User taps failure diagnosis card
    Motion-->>UI: Scale 0.98 -> 1.0 (snappySpring) + Emerald rim glow expands
    Haptic-->>UI: 8ms light tap

    Note over UI, Haptic: STAGE 2: Interactive 3D Globe
    UI->>Motion: User drags globe / selects country
    Motion-->>UI: Angular inertia (friction 0.95/frame) + Slerp to target lat/long
    Motion-->>UI: Emerald radar beacon expands (scale 1.0 -> 2.4, opacity 0.8 -> 0)

    Note over UI, Haptic: STAGE 6: Algorithmic Calibration (3.5s)
    UI->>Motion: 0.0s - Origin locks; 0.5s - Velocity curve traces; 1.8s - Buffer cone blooms
    Motion-->>UI: 2.8s - Telemetry counters roll; 3.5s - System locks into place
    Haptic-->>UI: Multi-stage haptic chimes at key lock points

    Note over UI, Haptic: STAGE 7: The Sovereign Pact
    UI->>Motion: User holds confirmation button (1.2s)
    Motion-->>UI: Button compresses to 0.96 scale, radial fill tracks linearly
    Haptic-->>UI: Ticks at 25%, 50%, 75% -> 35ms double-pulse commit pop at 100%
```

---

### Stage 1: The Burnout Audit (Selection Spring & Dimming Physics)

#### Animation Description
When the user taps one of the four failure diagnostic cards (*"The Streak Guilt Trap"*, *"Cognitive Overload"*, etc.):
1. **Tactile Compression**: The card instantly compresses on tap to `scale: 0.98`.
2. **Selected Spring Pop**: Upon release, the card springs back to `scale: 1.0` using `MOTION_PRESETS.snappySpring` (`stiffness: 500, damping: 32`).
3. **Emerald Specular Rim Expansion**:
   - The border transitions from `border-white/10` to `border-emerald-500/60` over $200\text{ms}$.
   - An ambient inner glow fades in: `box-shadow: inset 0 1px 1px 0 rgba(16,185,129,0.3), 0 0 20px -4px rgba(16,185,129,0.25)`.
4. **Secondary Card Dimming**: The unselected 3 cards interpolate from `opacity: 1.0` to `opacity: 0.45` over $200\text{ms}$ with `easeOut`, reducing visual noise.
5. **Inline Insight Reveal**: A contextual feedback banner unfolds below the selected card (`height: 0 -> auto`, `opacity: 0 -> 1` over $250\text{ms}$) with an emerald checkmark.
6. **Haptic Trigger**: Single $8\text{ms}$ light haptic pulse upon selection.

---

### Stage 2: Geographic Calibration & Interactive 3D Globe Physics

#### Technology & Renderer
Implemented via **COBE** (5KB WebGL sphere renderer with custom GLSL dot shaders) embedded inside a hardware-accelerated HTML5 canvas.

#### 1. Angular Inertia & Drag Physics
- **Coordinates**: Azimuthal angle $\phi$ (longitude) and polar angle $\theta$ (latitude).
- **Pointer Drag Capture**:
  - Horizontal drag delta $\Delta x \implies \Delta\phi = \Delta x \times 0.005\text{ rad/px}$.
  - Vertical drag delta $\Delta y \implies \Delta\theta = \Delta y \times 0.005\text{ rad/px}$ (clamped to $[-0.4, 0.4]$ to prevent polar inversion).
- **Inertial Momentum Decay**:
  ```typescript
  // Render loop physics per frame
  onRender: (state) => {
    if (!isDragging) {
      // Exponential decay of angular velocity (friction = 0.95)
      velocityPhi *= 0.95;
      velocityTheta *= 0.95;
      phi += velocityPhi;
      theta += velocityTheta;
    }
  }
  ```

#### 2. Auto-Focus Interpolation (Spherical Slerp)
When a user selects a country from the search list, the globe smoothly rotates to center that country's coordinates:
- Target coordinates: $[\text{lat}, \text{lng}] \implies [\phi_{\text{target}}, \theta_{\text{target}}]$.
- Interpolation:
  $$\phi_{t+1} = \phi_t + (\phi_{\text{target}} - \phi_t) \times 0.08$$
  $$\theta_{t+1} = \theta_t + (\theta_{\text{target}} - \theta_t) \times 0.08$$
- Duration: $\approx 650\text{ms}$ smooth settling curve.

#### 3. Emerald Radar Beacon & Ripple Wave
At the exact coordinates of the selected country:
- **Core Pin**: An emerald marker dot (`size: 0.05`) pulses with gentle breathing physics:
  $$\text{size}(t) = 0.05 + 0.015 \times \sin(t \times 3.0)$$
- **Radar Ripple Ring**: An absolute SVG/CSS concentric ring centered on the 3D marker:
  - Keyframes: `scale: [1.0, 2.4]`, `opacity: [0.8, 0.0]`.
  - Duration: $1600\text{ms}$ infinite loop, `easeOut`.

#### 4. Search Combobox Transition
- Focus state: Container background transitions from `bg-slate-900/60` to `bg-slate-900/90`, border glows from `border-white/10` to `border-emerald-500/40`, and dropdown expands downward with `scaleY: 0.95 -> 1.0` and `opacity: 0 -> 1` ($180\text{ms}$).

---

### Stage 3: The Radical Focus Filter (Input Glow & Chip Selection)

#### Animation Description
1. **Single-Goal Input Glow**:
   - On input focus, the outer border transitions to emerald with a subtle specular highlight: `shadow-[0_0_20px_-4px_rgba(16,185,129,0.2)]`.
2. **Dynamic Character Counter Meter**:
   - A micro progress ring (from 0 to 80 characters) updates fluidly. If the user exceeds 70 characters, the ring shifts from emerald to amber with a micro-shake animation ($6\text{px}$ horizontal oscillation over $200\text{ms}$) to enforce concise 6th-grade clarity.
3. **Pre-Set Category Chips (Quick Select)**:
   - Tapping an inspiration chip snaps it into the text field with a spring translation (`y: 6px -> 0px`, `opacity: 0 -> 1` over $180\text{ms}$).

---

### Stage 4: Scaffolding (2 Routines Strict Counter Bump & Lock)

#### Animation Description
1. **Interactive Counter Badge Bump**:
   - Located at the top right of the card: `(Selected: X / 2)`.
   - Every time a routine is toggled, the badge executes a **spring bump**:
     - `scale: [1.0, 1.25, 1.0]` over $220\text{ms}$ using `easeOut`.
     - When $X = 2$, the badge text changes to `Emerald` and a micro padlock icon snaps shut.
2. **2-Item Selection Constraint Lock**:
   - As soon as the second routine is checked, all remaining unselected routines smoothly fade to `opacity: 0.35` and become non-interactive.
   - If the user attempts to click a 3rd routine, the container triggers an instantaneous **haptic error double-buzz** (`[10ms, 40ms, 10ms]`) and the counter badge pulses red for $300\text{ms}$ with the tooltip: *"Maximum capacity reached: Exactly 2 routines."*
3. **Primary CTA Reveal**:
   - The "Continue" button unlocks at the bottom with a tactile spring elevation: `y: 8px -> 0px`, `opacity: 0 -> 1` ($250\text{ms}$).

---

### Stage 5: Execution Anchor (Sliding Pill Segmented Control)

#### Animation Description
1. **Sliding Segment Indicator (Framer Motion `layoutId`)**:
   - Uses a shared layout ID (`layoutId="activeAnchorSegment"`) on the liquid glass pill backdrop.
   - When the user taps between *"Dawn (06:00 - 08:30)"*, *"Midday (12:00 - 13:30)"*, and *"Evening (18:00 - 20:30)"*, the illuminated pill does not fade in/out—it **physically glides across the track**:
     - Spring configuration: `stiffness: 400, damping: 35` (`MOTION_PRESETS.smoothSpring`).
     - As it glides, the text inside the newly selected tab switches from muted grey (`#94A3B8`) to crisp high-contrast white (`#FFFFFF`) with a weight bump from `font-normal` to `font-semibold`.

---

### Stage 6: Algorithmic Calibration (The 3.5-Second 4-Act Orchestration)

This is the central visual centerpiece of onboarding. Duration is calibrated to **exactly 3,500ms** to satisfy the Harvard Labor Illusion threshold without triggering user impatience.

```
Calibration Timeline (3,500ms Total):
0.0s          0.5s                   1.8s                  2.8s         3.5s
 |-------------|----------------------|---------------------|------------|
 [Act I: Lock] [Act II: Trajectory]   [Act III: Buffer]     [Act IV: HUD] [Ready]
 (Origin Day0) (Emerald Vector Trace) (Cone 10% Bloom)      (Ticker Roll) (Haptic)
```

#### Act I: Coordinate Origin Lock ($0.0\text{s} - 0.5\text{s}$, $500\text{ms}$)
- Canvas background dims to `#05080E`.
- An origin crosshair and dot appear at coordinates `(0, 0)`.
- The dot scales in from $0 \implies 1.3 \implies 1.0$ (`spring: { stiffness: 600, damping: 20 }`).
- A subtle radial emerald gradient ring radiates outward $40\text{px}$ and dissolves.

#### Act II: Trajectory Velocity Draw ($0.5\text{s} - 1.8\text{s}$, $1,300\text{ms}$)
- A high-precision cubic bezier SVG path generates across a 90-day coordinate grid:
  $$P(t) = (1-t)^3 P_0 + 3(1-t)^2 t P_1 + 3(1-t) t^2 P_2 + t^3 P_3$$
- **Path Draw Technique**:
  - `pathLength: 0 -> 1` (animated via `strokeDashoffset`).
  - Stroke: $2.5\text{px}$ solid `#10B981` (Emerald-500) with an ambient SVG Gaussian blur drop-shadow (`stdDeviation="4"`).
  - Easing: `MOTION_PRESETS.curves.velocityTrace` (`cubic-bezier(0.16, 1.0, 0.3, 1.0)`). Fast launch, gliding into Day 90.

#### Act III: The Mathematical Buffer Cone Bloom ($1.8\text{s} - 2.8\text{s}$, $1,000\text{ms}$)
- Two secondary dashed boundary lines separate from the central line and expand outward:
  - Upper Boundary: $+10\%$ buffer line (`stroke-emerald-400/40`, dashed `4 4`).
  - Lower Boundary: $-10\%$ buffer line (`stroke-emerald-400/40`, dashed `4 4`).
- **Surface Envelope Mesh**:
  - The closed polygon area bounded between $+10\%$ and $-10\%$ fades in from `opacity: 0.0` to `opacity: 0.12`.
  - Gradient: `linear-gradient(90deg, rgba(16,185,129,0.02) 0%, rgba(16,185,129,0.2) 100%)`.
  - Demonstrates physically that the user's trajectory is a **protective resilient cone**, not a brittle line.

#### Act IV: Telemetry HUD Number Roll ($2.8\text{s} - 3.5\text{s}$, $700\text{ms}$)
- Below the canvas, 4 telemetry metrics animate with digital number counter tickers:
  - `Target Horizon`: $0 \implies 90\text{ Days}$
  - `Primary Steps`: $0 \implies 90\text{ Units}$
  - `Buffer Capacity`: $0 \implies 9\text{ Days (10% Tolerance)}$
  - `Streak Pressure`: $100\% \implies 0\%\text{ (Disabled)}$
- **Completion Lock**: At $3.5\text{s}$, a soft $25\text{ms}$ haptic pulse fires, and a green lock pill illuminates: `CALIBRATION COMPLETE`.

---

### Stage 7: The Sovereign Pact (1.2s Asymmetric Press-and-Hold Physics)

#### Animation Description
To eliminate casual, mindless clicking and establish psychological commitment, Stage 7 utilizes an **engineered press-and-hold interaction**.

```
Hold Dynamics:
[ IDLE ] 
   |  (User presses thumb down)
   v
[ HOLDING (0ms -> 1200ms) ]
   - Button compresses to scale 0.96 (stiffness: 520, damping: 30)
   - Emerald radial/linear track floods left-to-right at linear speed
   - Haptics: 5ms at 300ms, 8ms at 600ms, 12ms at 900ms
   |
   +---> (User releases BEFORE 1100ms? CANCELLED)
   |        - Asymmetric Rewind: Empties at 2.4x speed (500ms)
   |        - Button springs back to 1.0 scale
   v
[ 1100ms: Decisive Snap Threshold (92%) ]
   - Final 8% closes automatically in 120ms (cubic-bezier(0.16, 1, 0.3, 1))
   |
   v
[ 1200ms: COMMITTED OVERSHOOT ]
   - Scale pops to 1.06 (stiffness: 700, damping: 14)
   - Settles back to 1.0 (stiffness: 320, damping: 24)
   - Double-pulse haptic: [30ms, 40ms, 50ms]
   - Smooth cross-fade into Dashboard
```

#### Core Engineering Parameters
- **Hold Duration**: Exactly $1,200\text{ms}$ ($1.2\text{s}$). Research indicates holds under $600\text{ms}$ are triggered accidentally by reflexive taps; holds over $2,000\text{ms}$ make users assume the software is frozen.
- **Early Snap Threshold**: $0.92$ ($92\%$). The final $8\%$ closes itself automatically over $120\text{ms}$. This early snap gives the interaction a **decisive, authoritative click** rather than a sluggish mechanical wait.
- **Depression Depth (`holdScale`)**: $0.96$ ($96\%$). The button physically sinks under the thumb (`spring: { stiffness: 520, damping: 30 }`). Without this depression, the hold feels digital and disconnected.
- **Asymmetric Rewind Rate ($2.4\times$)**: If the user lets go early, the progress track drains at **$2.4\times$ speed** ($500\text{ms}$) using `cubic-bezier(0.22, 1, 0.36, 1)`. An asymmetric release curve feels like a physical mechanical spring returning to rest.
- **Haptic Schedule (Vibration API)**:
  - $300\text{ms}$ ($25\%$): Light $5\text{ms}$ tap.
  - $600\text{ms}$ ($50\%$): Medium $8\text{ms}$ tap.
  - $900\text{ms}$ ($75\%$): Firmer $12\text{ms}$ tap.
  - $1200\text{ms}$ ($100\%$ Commit): Definitive double-pulse `[30ms, 40ms, 50ms]`.

---

## 3. Global Page Transition Physics (Direction-Aware Slide)

When moving forward or backward between the 7 onboarding steps, the viewport employs an **AnimatePresence direction-aware slide**:

```typescript
export const pageTransitionVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 32 : -32,
    opacity: 0,
    filter: "blur(4px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      x: { type: "spring", stiffness: 350, damping: 32 },
      opacity: { duration: 0.22 },
      filter: { duration: 0.22 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 32 : -32,
    opacity: 0,
    filter: "blur(4px)",
    transition: {
      x: { type: "spring", stiffness: 350, damping: 32 },
      opacity: { duration: 0.18 },
      filter: { duration: 0.18 },
    },
  }),
};
```

- **GPU Acceleration Guarantee**: Only hardware-composited properties are animated (`transform: translate3d`, `opacity`, `filter`). No layout shifts, zero repaints (`reflow = 0`).
- **Subtle Motion Blur**: A tiny $4\text{px}$ Gaussian blur on enter/exit prevents high-contrast text flickering on fast mobile displays.

---

## 4. Hardware Budget & Performance Benchmarks

- **Target Frame Rate**: Consistent **60 FPS** on mid-tier mobile (Snapdragon 700 series / Apple A12 Bionic) and **120 FPS** on ProMotion displays.
- **WebGL Memory Budget**: COBE Canvas bundle: $\approx 5\text{KB}$; WebGL context uses 1 single shared instance destroyed cleanly upon step unmount (`globe.destroy()`).
- **Reduced Motion Support**:
  ```typescript
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    // Replaces all physical springs and path tracing with instant 150ms opacity cross-fades
  }
  ```
