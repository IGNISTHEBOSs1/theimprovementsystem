// src/components/onboarding/Stage6AlgorithmicCalibration.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
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

    // Act II: Velocity Draw (0.3s)
    const t1 = setTimeout(() => {
      setAct(2);
      triggerHaptic.medium();
    }, 300);

    // Act III: Buffer Cone Bloom (0.8s)
    const t2 = setTimeout(() => {
      setAct(3);
      triggerHaptic.medium();
    }, 800);

    // Act IV: Telemetry Roll (1.2s)
    const t3 = setTimeout(() => {
      setAct(4);
      triggerHaptic.heavy();

      // Number counter roll animation
      const interval = setInterval(() => {
        setCounters((prev) => ({
          horizon: Math.min(90, prev.horizon + 9),
          steps: Math.min(90, prev.steps + 9),
          buffer: Math.min(9, prev.buffer + 1),
          streakPressure: Math.max(0, prev.streakPressure - 10),
        }));
      }, 25);

      setTimeout(() => clearInterval(interval), 400);
    }, 1200);

    // Lock & Complete (1.8s)
    const t4 = setTimeout(() => {
      setAct(5); // Ready
      triggerHaptic.success();
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
          Calibrating Trajectory Dynamics
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto text-pretty">
          Simulating 90-day velocity vectors and ±10% buffer envelope.
        </p>
      </div>

      {/* Dynamic Calibration Canvas Box */}
      <div className="relative h-48 sm:h-56 w-full rounded-2xl border border-border/80 bg-card p-3 overflow-hidden shadow-[var(--shadow-card)]">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 350 180" role="img" aria-label="Trajectory velocity and buffer cone simulation">
          <defs>
            <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="bufferGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.18" />
            </linearGradient>
          </defs>

          {/* Coordinate Grid Lines */}
          <line x1="30" y1="150" x2="330" y2="150" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="30" y1="20" x2="30" y2="150" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />

          {/* Grid Labels */}
          <text x="26" y="166" fill="currentColor" opacity="0.6" fontSize="9" fontFamily="monospace">Day 0</text>
          <text x="165" y="166" fill="currentColor" opacity="0.6" fontSize="9" fontFamily="monospace">Day 45</text>
          <text x="302" y="166" fill="currentColor" opacity="0.6" fontSize="9" fontFamily="monospace">Day 90</text>

          {/* Act III: Buffer Cone Area Polygon */}
          {act >= 3 && (
            <motion.polygon
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              points="30,150 330,25 330,85 30,150"
              fill="url(#bufferGradient)"
            />
          )}

          {/* Act III: Upper (+10%) and Lower (-10%) Boundary Lines */}
          {act >= 3 && (
            <>
              <motion.line
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
                x1="30" y1="150" x2="330" y2="25"
                stroke="#10B981" strokeWidth="1.2" strokeDasharray="4 4" strokeOpacity="0.5"
              />
              <motion.line
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
                x1="30" y1="150" x2="330" y2="85"
                stroke="#10B981" strokeWidth="1.2" strokeDasharray="4 4" strokeOpacity="0.5"
              />
            </>
          )}

          {/* Act II: Main Velocity Vector Line */}
          {act >= 2 && (
            <motion.path
              d="M 30 150 Q 180 105 330 55"
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              filter="url(#emeraldGlow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1.0, 0.3, 1.0] }}
            />
          )}

          {/* Act I: Origin Point Lock */}
          <circle cx="30" cy="150" r="3.5" fill="#10B981" />
          <circle cx="30" cy="150" r="7" stroke="#10B981" strokeWidth="1" opacity="0.5" />
        </svg>

        {/* Phase Pill Status */}
        <div className="absolute top-2.5 right-3 text-[11px] font-medium text-muted-foreground bg-card/90 border border-border px-2.5 py-0.5 rounded-full shadow-xs">
          {act === 1 && "Origin Locked"}
          {act === 2 && "Computing Velocity"}
          {act === 3 && "Expanding ±10% Buffer Cone"}
          {act >= 4 && "Trajectory Verified"}
        </div>
      </div>

      {/* Telemetry Dashboard Roll */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-xl border border-border/80 bg-card p-2.5 text-center shadow-xs">
          <span className="text-xs text-muted-foreground block font-medium">Horizon</span>
          <span className="text-sm sm:text-base font-bold text-foreground">
            <span className="font-mono tabular-nums">{counters.horizon}</span> Days
          </span>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-2.5 text-center shadow-xs">
          <span className="text-xs text-muted-foreground block font-medium">Steps</span>
          <span className="text-sm sm:text-base font-bold text-foreground">
            <span className="font-mono tabular-nums">{counters.steps}</span> Steps
          </span>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2.5 text-center shadow-xs">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-semibold">Buffer Cone</span>
          <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
            <span className="font-mono tabular-nums">{counters.buffer}</span> Flex Days
          </span>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-2.5 text-center shadow-xs">
          <span className="text-xs text-muted-foreground block font-medium">Attendance Pressure</span>
          <span className="text-sm sm:text-base font-bold text-muted-foreground">
            <span className="font-mono tabular-nums">{counters.streakPressure}%</span>
          </span>
        </div>
      </div>

      {/* Completion CTA */}
      <div className="pt-1">
        <button
          type="button"
          disabled={act < 5}
          onClick={onComplete}
          className="w-full min-h-11 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm tracking-wide transition-colors active:scale-[0.98] motion-reduce:transform-none shadow-xs flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Review Sovereign Pact</span>
        </button>
      </div>
    </div>
  );
}
