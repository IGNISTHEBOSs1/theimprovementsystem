# MASTER IMPLEMENTATION SPECIFICATION & CODING PROMPT
## The Improvement System (TIS) / Kinetic — 7-Stage Onboarding Architecture

> **Target Role:** Senior Frontend & Motion Systems Engineer  
> **Project Root:** `c:\Users\user\Documents\My stuff\theimprovementsystem`  
> **Tech Stack:** React 18, TypeScript, Tailwind CSS, Framer Motion (`^12.23.26`), Lucide React, Radix UI, Capacitor Haptics.  
> **Target Deliverable:** Complete, production-grade 7-stage interactive onboarding funnel integrated seamlessly into `FirstLaunchState.tsx`.

---

## 1. Executive Instructions & System Invariants

You are tasked with implementing the complete **7-Stage Onboarding System** for **The Improvement System (TIS)** (internally referred to as *Kinetic*). This onboarding flow is not an administrative survey—it is a **psychological intervention and commitment mechanism** grounded in empirical behavioral economics (Irrational Labs, Headspace, and Kovalee benchmarks).

### 1.1 Non-Negotiable Brand & Architectural Invariants (`AGENTS.md`)
You must strictly adhere to the project invariants defined in `AGENTS.md`. Any violation of these invariants will result in rejection:

1. **Neoskeuomorphism over Flatness**:
   - Use tactile depth, specular highlights (`inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)` on top borders), and liquid frosted glass (`backdrop-blur-xl`, saturation boost) for elevated cards.
   - Every interactive element must provide a tangible press/hover state (`active:scale-[0.98]`).
2. **Color Palette & Visual Contrast**:
   - Deep Obsidian background (`#080C14` / `#090D16`, never raw `#000000`).
   - Kinetic Emerald accents (`#10B981` / Emerald-500) representing focused momentum.
   - Text contrast strictly adheres to WCAG AAA standards.
3. **The Signature $\pm 10\%$ Mathematical Buffer Cone**:
   - TIS operates on the **90 / 90 / 9 Framework**: 90-Day Horizon, 90 Daily Steps, and **9 Flexible Buffer Days (10% Tolerance)**.
   - The buffer cone absorbs life disruptions. Missing a day is mathematically accounted for, not punished.
4. **NO RPG Gamification**:
   - **Never** introduce XP bars, character levels, coins, fantasy hunter ranks, or confetti explosions. TIS is a high-precision personal operating system for serious operators, not a role-playing game.
5. **NO Streak Counters or Attendance Guilt**:
   - **Never** introduce streak counters, streak badges, flame meters, or streak-preservation pressure ("Don't break the chain", "Streak preserved"). TIS does not measure unbroken daily attendance. Progress is measured strictly through **deterministic trajectory velocity within the buffer cone** and **commitment follow-through**.
6. **Strict Constraint: 1 Primary Focus + 2 Routines**:
   - Onboarding must enforce cognitive bandwidth discipline. The user is strictly limited to **1 Primary 90-Day Goal** and **exactly 2 Supporting Daily Routines**. The UI must physically prevent selecting more.
7. **Local-First & Client-Side Privacy**:
   - All onboarding configurations persist to local client state and user profile via `useAuth().updateProfile` without requiring unverified external telemetry.
8. **Never Commit Secrets**:
   - No hardcoded tokens, API keys, or credentials.

---

## 2. Architecture & File Hierarchy

You will implement or update the following file structure under `src/`:

```
src/
├── lib/
│   ├── motion-tokens.ts           # Centralized Framer Motion physics, springs & easings
│   └── haptics.ts                 # Cross-platform haptic feedback engine (Capacitor + Web fallback)
└── components/
    ├── onboarding/
    │   ├── OnboardingFlow.tsx              # Master orchestrator & step state machine
    │   ├── OnboardingProgress.tsx          # 7-segment discrete progress bar
    │   ├── OnboardingGlobe.tsx             # Interactive 3D Canvas/WebGL dot globe with drag inertia
    │   ├── Stage1BurnoutAudit.tsx          # Step 1: Streak failure diagnosis
    │   ├── Stage2GeographicAnchor.tsx      # Step 2: Country search & 3D Globe anchor
    │   ├── Stage3NorthStar.tsx             # Step 3: 1 Primary 90-Day Focus input
    │   ├── Stage4Scaffolding.tsx           # Step 4: Exactly 2 Supporting Routines
    │   ├── Stage5ExecutionAnchor.tsx       # Step 5: Sliding pill daily time & trigger
    │   ├── Stage6AlgorithmicCalibration.tsx# Step 6: 3.5s 4-act dynamic trajectory visualizer
    │   └── Stage7SovereignPact.tsx         # Step 7: Tactile contract & 1.2s press-and-hold CTA
    └── dashboard/
        └── FirstLaunchState.tsx            # Updated to host the OnboardingFlow
```

---

## 3. Data Schema & State Management

Define the centralized state structure for the onboarding session:

```typescript
// src/components/onboarding/types.ts

export interface OnboardingState {
  // Stage 1: Diagnostic
  failureReason: string | null;

  // Stage 2: Geographic Anchor
  country: string;
  countryCode: string;
  timezone: string;
  utcOffset: string;
  coordinates: [number, number]; // [lat, lng]

  // Stage 3: North Star
  primaryGoal: string;
  goalCategory: "athletic" | "engineering" | "intellectual" | "financial" | "custom";

  // Stage 4: Scaffolding (Strictly 2)
  supportingRoutines: string[];

  // Stage 5: Execution Anchor
  timeWindow: "dawn" | "midday" | "evening";
  contextualTrigger: string;

  // Calibration telemetry
  horizonDays: number; // default 90
  bufferDays: number;  // default 9 (10%)
}
```

---

## 4. Complete Code Implementation Specifications

### 4.1 Motion & Physics Tokens (`src/lib/motion-tokens.ts`)

Create `src/lib/motion-tokens.ts` with exact spring constants and easing curves:

```typescript
// src/lib/motion-tokens.ts

export const MOTION_PRESETS = {
  // Snappy: Direct manipulation, card select, button tap
  snappySpring: {
    type: "spring",
    stiffness: 500,
    damping: 32,
    mass: 1.0,
  },

  // Smooth: Sliding pill indicators, layoutId transitions
  smoothSpring: {
    type: "spring",
    stiffness: 400,
    damping: 35,
    mass: 1.0,
  },

  // Heavy Press: Tactile button depression
  holdDepression: {
    type: "spring",
    stiffness: 520,
    damping: 30,
    mass: 1.0,
  },

  // Commit Pop: Celebration overshoot on long-press lock
  commitOvershoot: {
    type: "spring",
    stiffness: 700,
    damping: 14,
    mass: 0.8,
  },

  // Easing Curves
  curves: {
    velocityTrace: [0.16, 1.0, 0.3, 1.0], // Dynamic trajectory draw
    stepTransition: [0.25, 1.0, 0.5, 1.0], // Directional slide
    asymmetricRewind: [0.22, 1.0, 0.36, 1.0], // Release hold before 92%
  },

  // Durations (ms)
  durations: {
    micro: 150,
    standard: 250,
    modal: 350,
    holdCommit: 1200,
    calibration: 3500,
  },
} as const;

// Direction-aware screen slide variants with subtle 4px motion blur
export const pageTransitionVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 36 : -36,
    opacity: 0,
    filter: "blur(4px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      x: { type: "spring", stiffness: 380, damping: 32 },
      opacity: { duration: 0.22 },
      filter: { duration: 0.22 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 36 : -36,
    opacity: 0,
    filter: "blur(4px)",
    transition: {
      x: { type: "spring", stiffness: 380, damping: 32 },
      opacity: { duration: 0.18 },
      filter: { duration: 0.18 },
    },
  }),
};
```

---

### 4.2 Cross-Platform Haptic Engine (`src/lib/haptics.ts`)

Enhance or create `src/lib/haptics.ts` using `@capacitor/haptics` with Web Vibration fallback:

```typescript
// src/lib/haptics.ts
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

const canVibrate = typeof window !== "undefined" && "navigator" in window && "vibrate" in navigator;

export const triggerHaptic = {
  // Light tap: Card selection, chip toggle (8ms)
  light: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      if (canVibrate) navigator.vibrate(8);
    }
  },

  // Medium tap: Stepper advance, time tab change (15ms)
  medium: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      if (canVibrate) navigator.vibrate(15);
    }
  },

  // Heavy tick: Press-and-hold milestones (25ms)
  heavy: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch {
      if (canVibrate) navigator.vibrate(25);
    }
  },

  // Success double-pulse: Long-press commitment lock
  success: async () => {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      if (canVibrate) navigator.vibrate([30, 40, 50]);
    }
  },

  // Error double-buzz: Selecting >2 routines
  error: async () => {
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch {
      if (canVibrate) navigator.vibrate([10, 40, 10]);
    }
  },
};
```

---

### 4.3 Interactive 3D Dot Globe (`src/components/onboarding/OnboardingGlobe.tsx`)

This component renders an interactive, tactile 3D dot-matrix globe on an HTML5 canvas. It supports:
- Interactive pointer drag with **angular inertia (friction coefficient: 0.95)**.
- **Spherical Slerp auto-rotation** when a country is selected from the combobox.
- An animated **Emerald radar beacon pin** with a pulsing ripple ring at the target coordinates.
- Fully self-contained (zero heavy external GIS bundles), lightweight (~60 FPS hardware accelerated).

```tsx
// src/components/onboarding/OnboardingGlobe.tsx
import React, { useEffect, useRef } from "react";

interface OnboardingGlobeProps {
  targetCoordinates: [number, number]; // [lat, lng]
  onCoordinatesChange?: (coords: [number, number]) => void;
  className?: string;
}

export function OnboardingGlobe({
  targetCoordinates,
  onCoordinatesChange,
  className = "",
}: OnboardingGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Rotation angles (radians)
  const phiRef = useRef<number>(0); // Azimuthal (horizontal)
  const thetaRef = useRef<number>(0.2); // Polar (vertical)

  // Velocities for inertia
  const velocityPhiRef = useRef<number>(0.002); // Ambient drift
  const velocityThetaRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Slerp target
  const targetPhiRef = useRef<number>(0);
  const targetThetaRef = useRef<number>(0);
  const isSlerpingRef = useRef<boolean>(false);

  // Convert lat/lng to target phi/theta
  useEffect(() => {
    const [lat, lng] = targetCoordinates;
    // Map lng to phi (-PI to PI), lat to theta (-PI/2 to PI/2)
    targetPhiRef.current = ((lng + 180) * (Math.PI / 180)) - Math.PI;
    targetThetaRef.current = Math.max(-0.4, Math.min(0.4, lat * (Math.PI / 180)));
    isSlerpingRef.current = true;
  }, [targetCoordinates]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 320);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 320);
    const radius = Math.min(width, height) * 0.42;

    // Generate deterministic sphere dot grid (Fibonacci sphere distribution)
    const DOT_COUNT = 480;
    const dots: Array<{ x: number; y: number; z: number }> = [];
    const phiStep = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle

    for (let i = 0; i < DOT_COUNT; i++) {
      const y = 1 - (i / (DOT_COUNT - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phiStep * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      dots.push({ x, y, z });
    }

    let pulse = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Handle Inertia or Slerp
      if (isSlerpingRef.current) {
        phiRef.current += (targetPhiRef.current - phiRef.current) * 0.08;
        thetaRef.current += (targetThetaRef.current - thetaRef.current) * 0.08;
        if (
          Math.abs(targetPhiRef.current - phiRef.current) < 0.005 &&
          Math.abs(targetThetaRef.current - thetaRef.current) < 0.005
        ) {
          isSlerpingRef.current = false;
        }
      } else if (!isDraggingRef.current) {
        velocityPhiRef.current *= 0.95; // Friction decay
        velocityThetaRef.current *= 0.95;
        // Keep a minimum ambient rotation if idle
        if (Math.abs(velocityPhiRef.current) < 0.001) velocityPhiRef.current = 0.0015;
        phiRef.current += velocityPhiRef.current;
        thetaRef.current += velocityThetaRef.current;
      }

      // Constrain polar angle
      thetaRef.current = Math.max(-0.45, Math.min(0.45, thetaRef.current));

      const cx = width / 2;
      const cy = height / 2;

      // Draw sphere atmospheric glow
      const atmosphere = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.08);
      atmosphere.addColorStop(0, "rgba(16, 185, 129, 0.02)");
      atmosphere.addColorStop(0.85, "rgba(16, 185, 129, 0.08)");
      atmosphere.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = atmosphere;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.08, 0, Math.PI * 2);
      ctx.fill();

      // Rotation matrix values
      const cosP = Math.cos(phiRef.current);
      const sinP = Math.sin(phiRef.current);
      const cosT = Math.cos(thetaRef.current);
      const sinT = Math.sin(thetaRef.current);

      // Render dots
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        // 3D Rotation (Phi around Y, Theta around X)
        const x1 = dot.x * cosP - dot.z * sinP;
        const z1 = dot.z * cosP + dot.x * sinP;

        const y2 = dot.y * cosT - z1 * sinT;
        const z2 = z1 * cosT + dot.y * sinT;

        // Projection (only front-facing dots, z2 > 0)
        if (z2 > -0.2) {
          const depthAlpha = Math.max(0.1, (z2 + 0.5) / 1.5);
          const px = cx + x1 * radius;
          const py = cy + y2 * radius;
          const dotSize = Math.max(0.8, 1.8 * depthAlpha);

          ctx.fillStyle = `rgba(16, 185, 129, ${depthAlpha * 0.75})`;
          ctx.beginPath();
          ctx.arc(px, py, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Render Active Beacon Pin for target location
      const [lat, lng] = targetCoordinates;
      const targetRadLng = (lng + 180) * (Math.PI / 180) - Math.PI;
      const targetRadLat = lat * (Math.PI / 180);

      const targetX = Math.cos(targetRadLat) * Math.sin(targetRadLng);
      const targetY = -Math.sin(targetRadLat);
      const targetZ = Math.cos(targetRadLat) * Math.cos(targetRadLng);

      const bx1 = targetX * cosP - targetZ * sinP;
      const bz1 = targetZ * cosP + targetX * sinP;
      const by2 = targetY * cosT - bz1 * sinT;
      const bz2 = bz1 * cosT + targetY * sinT;

      if (bz2 > 0) {
        const bpx = cx + bx1 * radius;
        const bpy = cy + by2 * radius;

        // Core Pin Dot
        ctx.fillStyle = "#10B981";
        ctx.shadowColor = "#10B981";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(bpx, bpy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset

        // Expanding Radar Ripple Wave
        pulse = (pulse + 0.02) % 1;
        const rippleRadius = 6 + pulse * 20;
        const rippleAlpha = Math.max(0, 0.8 * (1 - pulse));
        ctx.strokeStyle = `rgba(16, 185, 129, ${rippleAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(bpx, bpy, rippleRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Resize handler
    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [targetCoordinates]);

  // Pointer Interaction Handlers (Touch & Mouse Drag)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    isSlerpingRef.current = false;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };

    // Angular delta mapping: 0.006 rad/px
    velocityPhiRef.current = dx * 0.006;
    velocityThetaRef.current = dy * 0.006;

    phiRef.current += velocityPhiRef.current;
    thetaRef.current += velocityThetaRef.current;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if capture lost
    }
  };

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-[#090D16] ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="touch-none cursor-grab active:cursor-grabbing w-full h-[260px] sm:h-[300px]"
        aria-label="Interactive 3D geographic calibration globe"
      />
      <div className="absolute bottom-2 right-3 pointer-events-none text-[10px] uppercase tracking-wider text-emerald-500/60 font-mono">
        Drag to Rotate • 60 FPS
      </div>
    </div>
  );
}
```

---

### 4.4 7-Segment Discrete Progress Bar (`src/components/onboarding/OnboardingProgress.tsx`)

```tsx
// src/components/onboarding/OnboardingProgress.tsx
import React from "react";
import { motion } from "framer-motion";

interface OnboardingProgressProps {
  currentStep: number; // 1 to 7
  totalSteps?: number; // 7
}

export function OnboardingProgress({ currentStep, totalSteps = 7 }: OnboardingProgressProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-emerald-500 font-semibold tracking-wider uppercase">
          Calibration Stage {currentStep} of {totalSteps}
        </span>
        <span className="text-muted-foreground">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>
      <div className="flex gap-1.5 h-1.5 w-full">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              className="relative flex-1 h-full rounded-full bg-slate-800/80 overflow-hidden"
            >
              {isCompleted && (
                <div className="h-full w-full bg-emerald-500 rounded-full" />
              )}
              {isCurrent && (
                <motion.div
                  className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

### 4.5 Stage 1: The Burnout Audit (`src/components/onboarding/Stage1BurnoutAudit.tsx`)

```tsx
// src/components/onboarding/Stage1BurnoutAudit.tsx
import React from "react";
import { motion } from "framer-motion";
import { Flame, Brain, HelpCircle, CalendarX2, CheckCircle2 } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { MOTION_PRESETS } from "@/lib/motion-tokens";

interface Stage1Props {
  selectedReason: string | null;
  onSelect: (reason: string) => void;
  onNext: () => void;
}

const FAILURE_CARDS = [
  {
    id: "streak_trap",
    title: "The Streak Guilt Trap",
    description: "Missed one day, the streak reset to zero, felt demoralized, and abandoned the goal completely.",
    icon: Flame,
    payoff: "TIS replaces brittle streaks with a ±10% buffer cone. 9 missed days over 90 days are absorbed, not penalized.",
  },
  {
    id: "cognitive_overload",
    title: "Cognitive Overload",
    description: "Tried to change 5 habits simultaneously and burned out within two weeks.",
    icon: Brain,
    payoff: "TIS enforces ruthless discipline: Exactly 1 Primary Goal and 2 Supporting Routines. Zero excess.",
  },
  {
    id: "vague_ambition",
    title: "Vague Ambition",
    description: "Set general goals without mathematical velocity, target milestones, or follow-through metrics.",
    icon: HelpCircle,
    payoff: "TIS plots a deterministic trajectory curve with daily velocity checkpoints.",
  },
  {
    id: "rigid_schedules",
    title: "Rigid Schedules",
    description: "Travel, illness, or urgent work obligations shattered an inflexible daily routine.",
    icon: CalendarX2,
    payoff: "TIS buffers your trajectory against life disruptions with dynamic pace rebalancing.",
  },
];

export function Stage1BurnoutAudit({ selectedReason, onSelect, onNext }: Stage1Props) {
  const handleCardClick = (id: string) => {
    triggerHaptic.light();
    onSelect(id);
  };

  const activeCard = FAILURE_CARDS.find((c) => c.id === selectedReason);

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <p className="text-xs font-mono font-semibold text-emerald-500 uppercase tracking-widest">
          Diagnostic • Step 1 of 7
        </p>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          What usually breaks your consistency?
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Most habit systems demand unbroken perfection. When life intervenes, you lose your streak and quit. TIS is engineered differently.
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {FAILURE_CARDS.map((card) => {
          const isSelected = selectedReason === card.id;
          const Icon = card.icon;

          return (
            <motion.div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              whileTap={{ scale: 0.98 }}
              animate={{
                opacity: selectedReason && !isSelected ? 0.45 : 1.0,
                scale: isSelected ? 1.01 : 1.0,
              }}
              transition={MOTION_PRESETS.snappySpring}
              className={`relative cursor-pointer rounded-2xl border p-4 sm:p-5 backdrop-blur-xl transition-colors ${
                isSelected
                  ? "border-emerald-500/60 bg-emerald-950/20 shadow-[inset_0_1px_1px_0_rgba(16,185,129,0.3),0_0_20px_-4px_rgba(16,185,129,0.25)]"
                  : "border-white/10 bg-slate-900/60 hover:border-white/20 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.08)]"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                    isSelected
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : "border-white/10 bg-slate-800/80 text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Dynamic Payoff Note */}
      {activeCard && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-xs text-emerald-300 flex items-start gap-2.5"
        >
          <span className="font-mono font-bold text-emerald-400">ENGINEERING FIX:</span>
          <span>{activeCard.payoff}</span>
        </motion.div>
      )}

      <div className="pt-2">
        <button
          disabled={!selectedReason}
          onClick={onNext}
          className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:pointer-events-none text-slate-950 font-semibold text-sm transition-all active:scale-[0.98] shadow-[0_0_20px_-4px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
        >
          Calibrate System →
        </button>
      </div>
    </div>
  );
}
```

---

### 4.6 Stage 2: Geographic Anchor (`src/components/onboarding/Stage2GeographicAnchor.tsx`)

Combines the combobox search with the interactive 3D dot globe and surfaces real-time circadian HUD readouts:

```tsx
// src/components/onboarding/Stage2GeographicAnchor.tsx
import React, { useState, useMemo } from "react";
import { Search, MapPin, Globe, Clock, Check } from "lucide-react";
import { OnboardingGlobe } from "./OnboardingGlobe";
import { triggerHaptic } from "@/lib/haptics";

interface Stage2Props {
  country: string;
  countryCode: string;
  timezone: string;
  coordinates: [number, number];
  onChange: (data: {
    country: string;
    countryCode: string;
    timezone: string;
    utcOffset: string;
    coordinates: [number, number];
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

interface CountryEntry {
  name: string;
  code: string;
  timezone: string;
  utcOffset: string;
  coords: [number, number]; // [lat, lng]
}

const COUNTRIES: CountryEntry[] = [
  { name: "United States (Eastern)", code: "US", timezone: "America/New_York", utcOffset: "UTC-5", coords: [40.71, -74.0] },
  { name: "United States (Pacific)", code: "US", timezone: "America/Los_Angeles", utcOffset: "UTC-8", coords: [34.05, -118.24] },
  { name: "United Kingdom", code: "GB", timezone: "Europe/London", utcOffset: "UTC+0", coords: [51.5, -0.12] },
  { name: "Germany", code: "DE", timezone: "Europe/Berlin", utcOffset: "UTC+1", coords: [52.52, 13.4] },
  { name: "France", code: "FR", timezone: "Europe/Paris", utcOffset: "UTC+1", coords: [48.85, 2.35] },
  { name: "Japan", code: "JP", timezone: "Asia/Tokyo", utcOffset: "UTC+9", coords: [35.67, 139.65] },
  { name: "Singapore", code: "SG", timezone: "Asia/Singapore", utcOffset: "UTC+8", coords: [1.35, 103.81] },
  { name: "Australia (Sydney)", code: "AU", timezone: "Australia/Sydney", utcOffset: "UTC+11", coords: [-33.86, 151.2] },
  { name: "India", code: "IN", timezone: "Asia/Kolkata", utcOffset: "UTC+5:30", coords: [28.61, 77.2] },
  { name: "Brazil", code: "BR", timezone: "America/Sao_Paulo", utcOffset: "UTC-3", coords: [-23.55, -46.63] },
  { name: "Canada (Toronto)", code: "CA", timezone: "America/Toronto", utcOffset: "UTC-5", coords: [43.65, -79.38] },
  { name: "United Arab Emirates", code: "AE", timezone: "Asia/Dubai", utcOffset: "UTC+4", coords: [25.2, 55.27] },
];

export function Stage2GeographicAnchor({
  country,
  countryCode,
  timezone,
  coordinates,
  onChange,
  onNext,
  onBack,
}: Stage2Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    return COUNTRIES.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSelectCountry = (c: CountryEntry) => {
    triggerHaptic.light();
    onChange({
      country: c.name,
      countryCode: c.code,
      timezone: c.timezone,
      utcOffset: c.utcOffset,
      coordinates: c.coords,
    });
    setDropdownOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <p className="text-xs font-mono font-semibold text-emerald-500 uppercase tracking-widest">
          Temporal Anchor • Step 2 of 7
        </p>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Where are you operating from?
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Calibrates your local day cycle, circadian focus window, and daily closure cadence. Stored strictly in local encrypted storage.
        </p>
      </div>

      {/* Country Combobox Search */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            placeholder={country ? `Selected: ${country}` : "Search country or region..."}
            className="w-full h-12 rounded-xl border border-white/10 bg-slate-900/80 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 backdrop-blur-xl focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 transition-all"
          />
        </div>

        {dropdownOpen && (
          <div className="absolute top-14 left-0 right-0 z-50 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-2xl">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground">
                No matching region found.
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.name === country;
                return (
                  <button
                    key={`${c.name}-${c.timezone}`}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-emerald-500/10 text-emerald-300 font-semibold"
                        : "text-foreground hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-emerald-400/80" />
                      {c.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {c.utcOffset}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 3D Tactile Interactive Globe */}
      <div className="rounded-2xl border border-white/10 p-2 bg-slate-900/40 backdrop-blur-xl shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.08)]">
        <OnboardingGlobe targetCoordinates={coordinates} />
      </div>

      {/* Telemetry HUD Readout */}
      <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-white/10 bg-slate-900/60 p-3.5 backdrop-blur-xl text-xs font-mono">
        <div className="space-y-0.5">
          <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
            <Globe className="h-3 w-3 text-emerald-400" /> Active Anchor
          </span>
          <p className="font-semibold text-foreground truncate">{country || "Unassigned"}</p>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
            <Clock className="h-3 w-3 text-emerald-400" /> Day Reset
          </span>
          <p className="font-semibold text-foreground">Local Midnight (00:00)</p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="h-12 px-5 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-white/5 text-foreground text-sm font-semibold transition-all active:scale-[0.98]"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={!country}
          onClick={onNext}
          className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:pointer-events-none text-slate-950 font-semibold text-sm transition-all active:scale-[0.98] shadow-[0_0_20px_-4px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
        >
          Confirm Location →
        </button>
      </div>
    </div>
  );
}
```

---

### 4.7 Stage 3: The Radical Focus Filter (`src/components/onboarding/Stage3NorthStar.tsx`)

Strictly limits input to 1 goal, provides a dynamic 80-character circular micro-meter, and detects multi-goal ambition with gentle constraint warnings:

```tsx
// src/components/onboarding/Stage3NorthStar.tsx
import React, { useState } from "react";
import { Target, Sparkles, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { triggerHaptic } from "@/lib/haptics";

interface Stage3Props {
  goal: string;
  category: string;
  onChange: (goal: string, category: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const INSPIRATION_CHIPS = [
  { text: "Build consistent 5-mile aerobic endurance", cat: "athletic" },
  { text: "Ship production MVP & acquire first 100 users", cat: "engineering" },
  { text: "Read, annotate, and synthesize 12 core books", cat: "intellectual" },
  { text: "Eliminate consumer debt & build 6-mo buffer", cat: "financial" },
];

export function Stage3NorthStar({ goal, category, onChange, onNext, onBack }: Stage3Props) {
  const charLimit = 80;
  const charsRemaining = charLimit - goal.length;
  const isOverLimit = charsRemaining < 0;
  const isMultiGoal = /\band\b|\balso\b|\bplus\b|\b,\s*\w+/i.test(goal);

  const handleChipClick = (text: string, cat: string) => {
    triggerHaptic.light();
    onChange(text, cat);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <p className="text-xs font-mono font-semibold text-emerald-500 uppercase tracking-widest">
          North Star • Step 3 of 7
        </p>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          What is your single 90-day focus?
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ruthless prioritization. You cannot pursue three priorities simultaneously. One high-leverage objective that changes your personal trajectory.
        </p>
      </div>

      {/* Goal Input Card */}
      <div className="relative rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-xl shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.08)] space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-emerald-400" /> Primary Objective
          </span>
          <span
            className={`font-mono text-[11px] ${
              charsRemaining < 10 ? "text-amber-400 font-bold" : "text-muted-foreground"
            }`}
          >
            {goal.length} / {charLimit}
          </span>
        </label>

        <textarea
          rows={3}
          value={goal}
          maxLength={charLimit + 10}
          onChange={(e) => onChange(e.target.value, category || "custom")}
          placeholder="e.g. Ship production MVP and sign first 5 enterprise pilot clients..."
          className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 transition-all"
        />

        {/* Multi-goal warning */}
        {isMultiGoal && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-300"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              <strong>TIS Guardrail:</strong> Splitting focus across multiple goals leads to zero velocity. Choose the single lead domino for these 90 days.
            </span>
          </motion.div>
        )}
      </div>

      {/* Quick Inspiration Chips */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Or pick a proven baseline archetype:
        </span>
        <div className="grid gap-2">
          {INSPIRATION_CHIPS.map((chip) => (
            <button
              key={chip.text}
              type="button"
              onClick={() => handleChipClick(chip.text, chip.cat)}
              className="text-left rounded-xl border border-white/10 bg-slate-900/40 p-3 text-xs text-foreground/90 hover:border-emerald-500/40 hover:bg-emerald-950/20 transition-all active:scale-[0.98]"
            >
              "{chip.text}"
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="h-12 px-5 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-white/5 text-foreground text-sm font-semibold transition-all active:scale-[0.98]"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={!goal.trim() || isOverLimit}
          onClick={onNext}
          className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:pointer-events-none text-slate-950 font-semibold text-sm transition-all active:scale-[0.98] shadow-[0_0_20px_-4px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
        >
          Lock Primary Goal →
        </button>
      </div>
    </div>
  );
}
```

---

### 4.8 Stage 4: Scaffolding (`src/components/onboarding/Stage4Scaffolding.tsx`)

Enforces the strict limit of **exactly 2 Supporting Routines**, features an animated counter badge bump (`scale: [1, 1.25, 1]`), and triggers an error double-buzz on any attempt to select a 3rd:

```tsx
// src/components/onboarding/Stage4Scaffolding.tsx
import React, { useState } from "react";
import { Check, Plus, Lock, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/lib/haptics";

interface Stage4Props {
  selectedRoutines: string[];
  onChange: (routines: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const PRESET_ROUTINES = [
  "90-min uninterrupted deep work execution block",
  "Daily production code push or architectural review",
  "45-min Zone 2 aerobic cardio or resistance session",
  "Daily 15-min joint mobility & active recovery routine",
  "8 hours non-negotiable sleep & recovery protocol",
  "Read 20 pages of foundational technical literature",
  "1 proactive customer or stakeholder outreach dialog",
];

export function Stage4Scaffolding({ selectedRoutines, onChange, onNext, onBack }: Stage4Props) {
  const [customInput, setCustomInput] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [badgeBump, setBadgeBump] = useState(false);

  const triggerBump = () => {
    setBadgeBump(true);
    setTimeout(() => setBadgeBump(false), 250);
  };

  const handleToggle = (routine: string) => {
    const isSelected = selectedRoutines.includes(routine);
    if (isSelected) {
      triggerHaptic.light();
      triggerBump();
      onChange(selectedRoutines.filter((r) => r !== routine));
    } else {
      if (selectedRoutines.length >= 2) {
        // Enforce strict constraint: Error buzz
        triggerHaptic.error();
        triggerBump();
        return;
      }
      triggerHaptic.light();
      triggerBump();
      onChange([...selectedRoutines, routine]);
    }
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed || selectedRoutines.length >= 2) return;
    triggerHaptic.light();
    triggerBump();
    onChange([...selectedRoutines, trimmed]);
    setCustomInput("");
    setShowCustom(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono font-semibold text-emerald-500 uppercase tracking-widest">
            Scaffolding • Step 4 of 7
          </p>
          {/* Spring-bumped counter badge */}
          <motion.div
            animate={{ scale: badgeBump ? 1.25 : 1.0 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
            className={`rounded-full px-2.5 py-1 text-xs font-mono font-bold flex items-center gap-1.5 ${
              selectedRoutines.length === 2
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-800 text-muted-foreground border border-white/10"
            }`}
          >
            {selectedRoutines.length === 2 && <Lock className="h-3 w-3 text-emerald-400" />}
            Selected: {selectedRoutines.length} / 2
          </motion.div>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Select exactly 2 daily supporting routines.
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Not 5. Not 10. Exactly two non-negotiable daily habits that directly feed your North Star.
        </p>
      </div>

      <div className="grid gap-2.5">
        {PRESET_ROUTINES.map((routine) => {
          const isSelected = selectedRoutines.includes(routine);
          const isDisabled = !isSelected && selectedRoutines.length >= 2;

          return (
            <button
              key={routine}
              type="button"
              disabled={isDisabled}
              onClick={() => handleToggle(routine)}
              className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-left text-xs transition-all active:scale-[0.98] ${
                isSelected
                  ? "border-emerald-500/60 bg-emerald-950/20 text-emerald-200 font-semibold shadow-[0_0_15px_-3px_rgba(16,185,129,0.25)]"
                  : isDisabled
                  ? "border-white/5 bg-slate-900/20 text-muted-foreground/40 opacity-40 cursor-not-allowed"
                  : "border-white/10 bg-slate-900/60 text-foreground hover:border-white/20"
              }`}
            >
              <span>{routine}</span>
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500 text-slate-950"
                    : "border-white/20 bg-slate-800"
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom routine add option */}
      {selectedRoutines.length < 2 && (
        <div>
          {!showCustom ? (
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
            >
              <Plus className="h-3.5 w-3.5" /> Define custom supporting routine
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="e.g. 20-min vocal warm-up..."
                className="flex-1 h-10 rounded-xl border border-white/10 bg-slate-900 px-3 text-xs text-foreground focus:border-emerald-500/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustom}
                className="h-10 px-4 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs"
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="h-12 px-5 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-white/5 text-foreground text-sm font-semibold transition-all active:scale-[0.98]"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={selectedRoutines.length !== 2}
          onClick={onNext}
          className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:pointer-events-none text-slate-950 font-semibold text-sm transition-all active:scale-[0.98] shadow-[0_0_20px_-4px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
        >
          Confirm Scaffolding (2/2) →
        </button>
      </div>
    </div>
  );
}
```

---

### 4.9 Stage 5: Execution Anchor (`src/components/onboarding/Stage5ExecutionAnchor.tsx`)

Features sliding liquid-glass pills utilizing Framer Motion `layoutId="activeAnchorSegment"`:

```tsx
// src/components/onboarding/Stage5ExecutionAnchor.tsx
import React from "react";
import { motion } from "framer-motion";
import { Sunrise, Sun, Moon, Anchor, CheckCircle } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { MOTION_PRESETS } from "@/lib/motion-tokens";

interface Stage5Props {
  timeWindow: "dawn" | "midday" | "evening";
  trigger: string;
  onChange: (timeWindow: "dawn" | "midday" | "evening", trigger: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const TIME_WINDOWS = [
  { id: "dawn", label: "Dawn", sub: "06:00 - 08:30", icon: Sunrise },
  { id: "midday", label: "Midday", sub: "12:00 - 13:30", icon: Sun },
  { id: "evening", label: "Evening", sub: "18:00 - 20:30", icon: Moon },
] as const;

const TRIGGERS = [
  "Immediately after morning espresso / tea",
  "Directly upon closing work workstation",
  "Before opening any email or communications",
  "Right after finishing my midday meal",
];

export function Stage5ExecutionAnchor({
  timeWindow,
  trigger,
  onChange,
  onNext,
  onBack,
}: Stage5Props) {
  const handleTimeSelect = (id: "dawn" | "midday" | "evening") => {
    triggerHaptic.light();
    onChange(id, trigger);
  };

  const handleTriggerSelect = (t: string) => {
    triggerHaptic.light();
    onChange(timeWindow, t);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <p className="text-xs font-mono font-semibold text-emerald-500 uppercase tracking-widest">
          Execution Anchor • Step 5 of 7
        </p>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          When and where does execution happen?
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Habits without temporal and contextual triggers exist only as good intentions. Anchor your execution to an immutable event.
        </p>
      </div>

      {/* Sliding Pill Segmented Control */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Daily Primary Focus Window
        </label>
        <div className="relative flex rounded-2xl border border-white/10 bg-slate-900/80 p-1.5 backdrop-blur-xl">
          {TIME_WINDOWS.map((window) => {
            const isSelected = timeWindow === window.id;
            const Icon = window.icon;

            return (
              <button
                key={window.id}
                type="button"
                onClick={() => handleTimeSelect(window.id)}
                className={`relative flex-1 py-3 px-2 rounded-xl text-center transition-colors z-10 ${
                  isSelected ? "text-slate-950 font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeAnchorSegment"
                    transition={MOTION_PRESETS.smoothSpring}
                    className="absolute inset-0 rounded-xl bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-[-1]"
                  />
                )}
                <div className="flex flex-col items-center gap-1">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-semibold">{window.label}</span>
                  <span className="text-[10px] opacity-80 font-mono">{window.sub}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contextual Anchor Triggers */}
      <div className="space-y-2 pt-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Anchor className="h-3.5 w-3.5 text-emerald-400" /> Behavioral Trigger Event
        </label>
        <div className="grid gap-2">
          {TRIGGERS.map((t) => {
            const isSelected = trigger === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => handleTriggerSelect(t)}
                className={`w-full flex items-center justify-between rounded-xl border p-3 text-left text-xs transition-all active:scale-[0.98] ${
                  isSelected
                    ? "border-emerald-500/60 bg-emerald-950/20 text-emerald-200 font-semibold"
                    : "border-white/10 bg-slate-900/60 text-foreground hover:border-white/20"
                }`}
              >
                <span>"{t}"</span>
                {isSelected && <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="h-12 px-5 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-white/5 text-foreground text-sm font-semibold transition-all active:scale-[0.98]"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={!trigger}
          onClick={onNext}
          className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:pointer-events-none text-slate-950 font-semibold text-sm transition-all active:scale-[0.98] shadow-[0_0_20px_-4px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
        >
          Calibrate Trajectory Engine →
        </button>
      </div>
    </div>
  );
}
```

---

### 4.10 Stage 6: Algorithmic Calibration (`src/components/onboarding/Stage6AlgorithmicCalibration.tsx`)

Executes the **3.5-second 4-act choreographed sequence**:
1. **Act I (0.0s - 0.5s)**: Coordinate Origin Lock at Day 0.
2. **Act II (0.5s - 1.8s)**: Kinetic Emerald Velocity Curve Draw via SVG `strokeDashoffset`.
3. **Act III (1.8s - 2.8s)**: Mathematical Buffer Cone Bloom ($\pm 10\%$ boundary envelope).
4. **Act IV (2.8s - 3.5s)**: Telemetry HUD Ticker Roll and Lock.

```tsx
// src/components/onboarding/Stage6AlgorithmicCalibration.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle2 } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

interface Stage6Props {
  onComplete: () => void;
}

export function Stage6AlgorithmicCalibration({ onComplete }: Stage6Props) {
  const [act, setAct] = useState<number>(1);
  const [counters, setCounters] = useState({
    horizon: 0,
    steps: 0,
    buffer: 0,
    streakPressure: 100,
  });

  useEffect(() => {
    // Act I: Origin Lock (0.0s)
    triggerHaptic.light();

    // Act II: Velocity Draw (0.5s)
    const t1 = setTimeout(() => {
      setAct(2);
      triggerHaptic.medium();
    }, 500);

    // Act III: Buffer Cone Bloom (1.8s)
    const t2 = setTimeout(() => {
      setAct(3);
      triggerHaptic.medium();
    }, 1800);

    // Act IV: Telemetry Roll (2.8s)
    const t3 = setTimeout(() => {
      setAct(4);
      triggerHaptic.heavy();

      // Number counter roll animation
      const interval = setInterval(() => {
        setCounters((prev) => ({
          horizon: Math.min(90, prev.horizon + 6),
          steps: Math.min(90, prev.steps + 6),
          buffer: Math.min(9, prev.buffer + 1),
          streakPressure: Math.max(0, prev.streakPressure - 8),
        }));
      }, 35);

      setTimeout(() => clearInterval(interval), 600);
    }, 2800);

    // Lock & Complete (3.5s)
    const t4 = setTimeout(() => {
      setAct(5); // Ready
      triggerHaptic.success();
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <p className="text-xs font-mono font-semibold text-emerald-500 uppercase tracking-widest">
          Algorithmic Calibration • Step 6 of 7
        </p>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Calibrating Trajectory Dynamics
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Simulating 90-day velocity vectors and generating the ±10% buffer envelope...
        </p>
      </div>

      {/* Dynamic Calibration Canvas Box */}
      <div className="relative h-64 sm:h-72 w-full rounded-2xl border border-white/10 bg-[#070A10] p-4 overflow-hidden backdrop-blur-xl shadow-2xl">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 200">
          <defs>
            {/* Emerald glow filter */}
            <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {/* Linear gradient for buffer envelope */}
            <linearGradient id="bufferGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.18" />
            </linearGradient>
          </defs>

          {/* Coordinate Grid Lines */}
          <line x1="40" y1="170" x2="380" y2="170" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="40" y1="30" x2="40" y2="170" stroke="#334155" strokeWidth="1" />

          {/* Grid Labels */}
          <text x="35" y="185" fill="#64748B" fontSize="9" fontFamily="monospace">Day 0</text>
          <text x="190" y="185" fill="#64748B" fontSize="9" fontFamily="monospace">Day 45</text>
          <text x="360" y="185" fill="#64748B" fontSize="9" fontFamily="monospace">Day 90</text>

          {/* Act III: Buffer Cone Area Polygon */}
          {act >= 3 && (
            <motion.polygon
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              points="40,170 380,25 380,85 40,170"
              fill="url(#bufferGradient)"
            />
          )}

          {/* Act III: Upper (+10%) and Lower (-10%) Boundary Lines */}
          {act >= 3 && (
            <>
              <motion.line
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
                x1="40" y1="170" x2="380" y2="25"
                stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.5"
              />
              <motion.line
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
                x1="40" y1="170" x2="380" y2="85"
                stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.5"
              />
            </>
          )}

          {/* Act II: Main Velocity Vector Line */}
          {act >= 2 && (
            <motion.path
              d="M 40 170 Q 210 120 380 55"
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              filter="url(#emeraldGlow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.3, ease: [0.16, 1.0, 0.3, 1.0] }}
            />
          )}

          {/* Act I: Origin Point Lock */}
          <circle cx="40" cy="170" r="4" fill="#10B981" />
          <circle cx="40" cy="170" r="8" stroke="#10B981" strokeWidth="1" opacity="0.6" />
        </svg>

        {/* Phase Pill Status */}
        <div className="absolute top-3 right-4 font-mono text-[10px] uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full backdrop-blur-md">
          {act === 1 && "Act I: Origin Locked"}
          {act === 2 && "Act II: Computing Velocity"}
          {act === 3 && "Act III: Expanding ±10% Buffer Cone"}
          {act >= 4 && "Act IV: Mathematical Trajectory Verified"}
        </div>
      </div>

      {/* Hard Telemetry Dashboard Roll */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-center">
          <span className="text-[10px] font-mono text-muted-foreground uppercase block">Horizon</span>
          <span className="text-lg font-mono font-bold text-foreground">{counters.horizon} Days</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-center">
          <span className="text-[10px] font-mono text-muted-foreground uppercase block">Goal Steps</span>
          <span className="text-lg font-mono font-bold text-foreground">{counters.steps} Units</span>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-center">
          <span className="text-[10px] font-mono text-emerald-400 uppercase block">Buffer Cone</span>
          <span className="text-lg font-mono font-bold text-emerald-300">{counters.buffer} Flex Days</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-center">
          <span className="text-[10px] font-mono text-muted-foreground uppercase block">Streak Pressure</span>
          <span className="text-lg font-mono font-bold text-slate-400">{counters.streakPressure}% (None)</span>
        </div>
      </div>

      {/* Completion CTA */}
      <div className="pt-2">
        <button
          disabled={act < 5}
          onClick={onComplete}
          className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-20 disabled:pointer-events-none text-slate-950 font-semibold text-sm transition-all active:scale-[0.98] shadow-[0_0_20px_-4px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          Review Sovereign Pact →
        </button>
      </div>
    </div>
  );
}
```

---

### 4.11 Stage 7: The Sovereign Pact (`src/components/onboarding/Stage7SovereignPact.tsx`)

Features an **Obsidian glass parchment summary** and the **1.2-second asymmetric press-and-hold interaction** (button sinks to `0.96 scale`, triggers ticks at 25%, 50%, 75%, executes a **92% early snap**, and rewinds at 2.4x speed if released prematurely):

```tsx
// src/components/onboarding/Stage7SovereignPact.tsx
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Sparkles, CheckCircle2 } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { OnboardingState } from "./types";
import { MOTION_PRESETS } from "@/lib/motion-tokens";

interface Stage7Props {
  state: OnboardingState;
  onCommit: () => void;
  onBack: () => void;
}

export function Stage7SovereignPact({ state, onCommit, onBack }: Stage7Props) {
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 1
  const [isHolding, setIsHolding] = useState(false);
  const [committed, setCommitted] = useState(false);

  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const HOLD_DURATION = 1200; // 1.2s
  const EARLY_SNAP_THRESHOLD = 0.92; // 92% snap

  // Haptic ticks tracking
  const haptic25Ref = useRef(false);
  const haptic50Ref = useRef(false);
  const haptic75Ref = useRef(false);

  const startHold = () => {
    if (committed) return;
    setIsHolding(true);
    startTimeRef.current = performance.now();
    haptic25Ref.current = false;
    haptic50Ref.current = false;
    haptic75Ref.current = false;
    triggerHaptic.light();

    const loop = (time: number) => {
      const elapsed = time - (startTimeRef.current || time);
      const current = Math.min(1.0, elapsed / HOLD_DURATION);

      // Multi-tier haptic schedule
      if (current >= 0.25 && !haptic25Ref.current) {
        haptic25Ref.current = true;
        triggerHaptic.light();
      }
      if (current >= 0.5 && !haptic50Ref.current) {
        haptic50Ref.current = true;
        triggerHaptic.medium();
      }
      if (current >= 0.75 && !haptic75Ref.current) {
        haptic75Ref.current = true;
        triggerHaptic.heavy();
      }

      // Early Snap Threshold (92%)
      if (current >= EARLY_SNAP_THRESHOLD) {
        setHoldProgress(1.0);
        setCommitted(true);
        triggerHaptic.success();
        setTimeout(onCommit, 500);
        return;
      }

      setHoldProgress(current);
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
  };

  const endHold = () => {
    if (committed) return;
    setIsHolding(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    // Asymmetric rewind (2.4x speed)
    const rewindStart = performance.now();
    const initialProgress = holdProgress;

    const rewindLoop = (time: number) => {
      const elapsed = time - rewindStart;
      const progress = Math.max(0, initialProgress - (elapsed / 500));
      setHoldProgress(progress);
      if (progress > 0) {
        requestRef.current = requestAnimationFrame(rewindLoop);
      }
    };

    requestRef.current = requestAnimationFrame(rewindLoop);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <p className="text-xs font-mono font-semibold text-emerald-500 uppercase tracking-widest">
          The Sovereign Pact • Step 7 of 7
        </p>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Seal Your Trajectory Contract
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          No casual clicking. Formalize your agreement with the system.
        </p>
      </div>

      {/* Tactile Parchment Card */}
      <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/80 p-5 backdrop-blur-xl shadow-[inset_0_1px_1px_0_rgba(16,185,129,0.25),0_12px_32px_-8px_rgba(0,0,0,0.6)] space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold tracking-wider text-foreground uppercase">
              TIS Operational Covenant
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">STATUS: VERIFIED</span>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-muted-foreground">OPERATING REGION:</span>
            <span className="text-foreground font-semibold">{state.country} ({state.utcOffset})</span>
          </div>
          <div className="py-1 border-b border-white/5 space-y-0.5">
            <span className="text-muted-foreground text-[10px]">NORTH STAR FOCUS (90 DAYS):</span>
            <p className="text-emerald-300 font-semibold font-sans text-xs">{state.primaryGoal}</p>
          </div>
          <div className="py-1 border-b border-white/5 space-y-0.5">
            <span className="text-muted-foreground text-[10px]">DAILY SUPPORTING ENGINES:</span>
            <ul className="text-foreground font-sans list-disc list-inside space-y-0.5">
              {state.supportingRoutines.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-muted-foreground">TIME ANCHOR:</span>
            <span className="text-foreground uppercase">{state.timeWindow} Session</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">BUFFER CAPACITY:</span>
            <span className="text-emerald-400 font-bold">9 Flex Days (10% Tolerance)</span>
          </div>
        </div>
      </div>

      {/* 1.2s Asymmetric Press-and-Hold Button */}
      <div className="space-y-3 pt-2">
        <motion.button
          type="button"
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerCancel={endHold}
          onPointerLeave={endHold}
          animate={{ scale: isHolding ? 0.96 : committed ? 1.05 : 1.0 }}
          transition={MOTION_PRESETS.holdDepression}
          className="relative w-full h-14 select-none touch-none overflow-hidden rounded-2xl border border-emerald-500/50 bg-slate-900/90 font-semibold text-sm shadow-[0_0_24px_-4px_rgba(16,185,129,0.35)] flex items-center justify-center cursor-pointer active:cursor-grabbing"
        >
          {/* Progress fill track */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-emerald-500 z-0"
            style={{ width: `${holdProgress * 100}%` }}
          />

          <span
            className={`relative z-10 flex items-center gap-2 font-mono uppercase tracking-wider text-xs transition-colors ${
              holdProgress > 0.5 ? "text-slate-950 font-bold" : "text-emerald-300 font-semibold"
            }`}
          >
            {committed ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Trajectory Initialized
              </>
            ) : isHolding ? (
              `Hold to Commit (${Math.round(holdProgress * 100)}%)`
            ) : (
              "Press & Hold to Initialize Trajectory"
            )}
          </span>
        </motion.button>

        <p className="text-center font-mono text-[10px] text-muted-foreground">
          Hold thumb down for 1.2s to commit • Early snap at 92%
        </p>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onBack}
          disabled={isHolding || committed}
          className="text-xs text-muted-foreground hover:text-foreground font-semibold"
        >
          ← Adjust Parameters
        </button>
      </div>
    </div>
  );
}
```

---

### 4.12 Master Orchestrator (`src/components/onboarding/OnboardingFlow.tsx`)

Coordinates the 7 stages, executes direction-aware Framer Motion transitions, and synchronizes profile updates with `useAuth`:

```tsx
// src/components/onboarding/OnboardingFlow.tsx
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OnboardingProgress } from "./OnboardingProgress";
import { Stage1BurnoutAudit } from "./Stage1BurnoutAudit";
import { Stage2GeographicAnchor } from "./Stage2GeographicAnchor";
import { Stage3NorthStar } from "./Stage3NorthStar";
import { Stage4Scaffolding } from "./Stage4Scaffolding";
import { Stage5ExecutionAnchor } from "./Stage5ExecutionAnchor";
import { Stage6AlgorithmicCalibration } from "./Stage6AlgorithmicCalibration";
import { Stage7SovereignPact } from "./Stage7SovereignPact";
import { OnboardingState } from "./types";
import { pageTransitionVariants } from "@/lib/motion-tokens";

interface OnboardingFlowProps {
  onComplete: () => Promise<void> | void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const [state, setState] = useState<OnboardingState>({
    failureReason: null,
    country: "United States (Eastern)",
    countryCode: "US",
    timezone: "America/New_York",
    utcOffset: "UTC-5",
    coordinates: [40.71, -74.0],
    primaryGoal: "",
    goalCategory: "engineering",
    supportingRoutines: [],
    timeWindow: "dawn",
    contextualTrigger: "Immediately after morning espresso / tea",
    horizonDays: 90,
    bufferDays: 9,
  });

  const nextStep = () => {
    setDirection(1);
    setStep((prev) => Math.min(7, prev + 1));
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="w-full max-w-lg mx-auto py-6 px-4 sm:px-6 space-y-6">
      <OnboardingProgress currentStep={step} totalSteps={7} />

      <div className="relative overflow-hidden min-h-[480px]">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={pageTransitionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full"
          >
            {step === 1 && (
              <Stage1BurnoutAudit
                selectedReason={state.failureReason}
                onSelect={(reason) => setState((s) => ({ ...s, failureReason: reason }))}
                onNext={nextStep}
              />
            )}

            {step === 2 && (
              <Stage2GeographicAnchor
                country={state.country}
                countryCode={state.countryCode}
                timezone={state.timezone}
                coordinates={state.coordinates}
                onChange={(geo) => setState((s) => ({ ...s, ...geo }))}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}

            {step === 3 && (
              <Stage3NorthStar
                goal={state.primaryGoal}
                category={state.goalCategory}
                onChange={(primaryGoal, goalCategory) =>
                  setState((s) => ({ ...s, primaryGoal, goalCategory: goalCategory as any }))
                }
                onNext={nextStep}
                onBack={prevStep}
              />
            )}

            {step === 4 && (
              <Stage4Scaffolding
                selectedRoutines={state.supportingRoutines}
                onChange={(supportingRoutines) =>
                  setState((s) => ({ ...s, supportingRoutines }))
                }
                onNext={nextStep}
                onBack={prevStep}
              />
            )}

            {step === 5 && (
              <Stage5ExecutionAnchor
                timeWindow={state.timeWindow}
                trigger={state.contextualTrigger}
                onChange={(timeWindow, contextualTrigger) =>
                  setState((s) => ({ ...s, timeWindow, contextualTrigger }))
                }
                onNext={nextStep}
                onBack={prevStep}
              />
            )}

            {step === 6 && (
              <Stage6AlgorithmicCalibration onComplete={nextStep} />
            )}

            {step === 7 && (
              <Stage7SovereignPact
                state={state}
                onCommit={async () => {
                  await onComplete();
                }}
                onBack={prevStep}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
```

---

### 4.13 Integration into `FirstLaunchState.tsx`

Update `src/components/dashboard/FirstLaunchState.tsx` to render `<OnboardingFlow />` and persist data via `useAuth`:

```tsx
// src/components/dashboard/FirstLaunchState.tsx
import React from "react";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useAuth } from "@/hooks/useAuth";

interface FirstLaunchStateProps {
  name: string;
}

export function FirstLaunchState({ name }: FirstLaunchStateProps) {
  const { updateProfile, completeFirstLaunch } = useAuth();

  const handleComplete = async () => {
    try {
      await completeFirstLaunch();
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] flex flex-col items-center justify-center py-6">
      <OnboardingFlow onComplete={handleComplete} />
    </div>
  );
}
```

---

## 5. Verification & Quality Assurance Protocol

Before considering the task complete, verify each step against this checklist:

1. **Lint & Build Cleanliness**:
   - Run `npm run lint` — ensure 0 warnings or errors in new components.
   - Run `npm run build` — ensure clean Vite build without TypeScript typing issues.
2. **Behavioral Constraint Verifications**:
   - **Step 1**: Tapping a card selects it, springs smoothly, dims unselected cards to `0.45`, and fires an 8ms haptic tap.
   - **Step 2**: Dragging the globe applies angular inertia decay (0.95 friction); choosing a country slerps the globe to target coordinates and pulses the emerald beacon.
   - **Step 3**: Single goal input enforces maximum 80 characters; entering multiple goals with conjunctions displays the single-focus guardrail warning.
   - **Step 4**: Enforces **strictly 2 routines**. Clicking a 3rd routine triggers the `[10ms, 40ms, 10ms]` error double-buzz and pulses the badge.
   - **Step 5**: The liquid glass segment pill physically glides across the track (`layoutId="activeAnchorSegment"`).
   - **Step 6**: The 3.5s sequence plays all 4 acts smoothly with the dynamic SVG buffer cone bloom and HUD counter tickers.
   - **Step 7**: The commitment button requires a 1.2s continuous hold, executes an early snap at 92%, and rewinds at 2.4x speed if cancelled early.
3. **Hardware & Accessibility**:
   - All hit targets are $\ge 48\text{px}$ high.
   - Respects `prefers-reduced-motion` where appropriate.
   - Zero hardcoded secrets, API tokens, or external unauthorized tracking scripts.
