// src/components/onboarding/OnboardingFlow.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon, Monitor, ArrowLeft } from "lucide-react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { isCapacitorNative } from "@/services/otaUpdateService";
import { KineticLogo } from "@/components/branding/Logo";
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
import { triggerHaptic } from "@/lib/haptics";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useAndroidBackNavigation } from "@/hooks/useAndroidBackNavigation";
import { cn } from "@/lib/utils";

interface OnboardingFlowProps {
  onComplete: (state: OnboardingState) => Promise<void> | void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const navigate = useNavigate();
  useAndroidBackNavigation();
  const { mode: themeMode, setMode: setThemeMode } = useThemeContext();
  const queryStep = typeof window !== "undefined"
    ? parseInt(new URLSearchParams(window.location.search).get("step") || "1", 10)
    : 1;
  const initialStep = !isNaN(queryStep) && queryStep >= 1 && queryStep <= 7 ? queryStep : 1;
  const [step, setStep] = useState(initialStep);
  const [direction, setDirection] = useState(1);

  // Sync mobile native status bar on theme change
  useEffect(() => {
    if (!isCapacitorNative()) return;
    try {
      const isDark =
        themeMode === "dark" ||
        (themeMode === "system" &&
          typeof window !== "undefined" &&
          Boolean(window.matchMedia?.("(prefers-color-scheme: dark)")?.matches));
      StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => {});
    } catch {
      // Graceful fallback
    }
  }, [themeMode]);

  const [state, setState] = useState<OnboardingState>(() => {
    // Check if there is previously pending saved state
    try {
      const saved = localStorage.getItem("kinetic_pending_onboarding");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return {
            failureReason: parsed.failureReason || (initialStep > 1 ? "streak_trap" : null),
            country: parsed.country || "United States (Eastern)",
            countryCode: parsed.countryCode || "US",
            timezone: parsed.timezone || "America/New_York",
            utcOffset: parsed.utcOffset || "UTC-5",
            coordinates: parsed.coordinates || [40.71, -74.0],
            primaryGoal: parsed.primaryGoal || "",
            goalCategory: parsed.goalCategory || "engineering",
            supportingRoutines: parsed.supportingRoutines || [],
            timeWindow: parsed.timeWindow || "dawn",
            contextualTrigger: parsed.contextualTrigger || "Immediately after morning espresso / tea",
            horizonDays: parsed.horizonDays || 90,
            bufferDays: parsed.bufferDays || 9,
          };
        }
      }
    } catch {
      // Fall through to auto-detection
    }

    // Attempt auto-detect timezone
    let detectedTz = "America/New_York";
    let detectedCountry = "United States (Eastern)";
    let detectedOffset = "UTC-5";
    let detectedCoords: [number, number] = [40.71, -74.0];

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        detectedTz = tz;
        if (tz.includes("Kolkata") || tz.includes("Calcutta")) {
          detectedCountry = "India";
          detectedOffset = "UTC+5:30";
          detectedCoords = [28.61, 77.2];
        } else if (tz.includes("London")) {
          detectedCountry = "United Kingdom";
          detectedOffset = "UTC+0";
          detectedCoords = [51.5, -0.12];
        } else if (tz.includes("Berlin") || tz.includes("Paris") || tz.includes("Rome")) {
          detectedCountry = "Europe";
          detectedOffset = "UTC+1";
          detectedCoords = [48.85, 2.35];
        } else if (tz.includes("Tokyo")) {
          detectedCountry = "Japan";
          detectedOffset = "UTC+9";
          detectedCoords = [35.67, 139.65];
        } else if (tz.includes("Singapore")) {
          detectedCountry = "Singapore";
          detectedOffset = "UTC+8";
          detectedCoords = [1.35, 103.81];
        } else if (tz.includes("Los_Angeles")) {
          detectedCountry = "United States (Pacific)";
          detectedOffset = "UTC-8";
          detectedCoords = [34.05, -118.24];
        }
      }
    } catch {
      // Fallback
    }

    return {
      failureReason: initialStep > 1 ? "streak_trap" : null,
      country: detectedCountry,
      countryCode: "US",
      timezone: detectedTz,
      utcOffset: detectedOffset,
      coordinates: detectedCoords,
      primaryGoal: initialStep >= 4 ? "Ship production MVP and secure first 100 paying customers" : "",
      goalCategory: "engineering",
      supportingRoutines: initialStep >= 5
        ? [
            "90-minute uninterrupted deep work execution block",
            "Daily production code push or architectural review",
          ]
        : [],
      timeWindow: "dawn",
      contextualTrigger: "Immediately after morning espresso / tea",
      horizonDays: 90,
      bufferDays: 9,
    };
  });

  const nextStep = () => {
    triggerHaptic.light();
    setDirection(1);
    setStep((prev) => Math.min(7, prev + 1));
  };

  const prevStep = () => {
    triggerHaptic.light();
    setDirection(-1);
    setStep((prev) => {
      if (prev === 7) return 5;
      return Math.max(1, prev - 1);
    });
  };

  const handleBack = () => {
    triggerHaptic.light();
    if (step > 1) {
      prevStep();
    } else {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/auth", { replace: true });
      }
    }
  };

  return (
    <div className="w-full max-w-full min-w-0 mx-auto space-y-4">
      {/* Top Protocol Header */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2.5">
          {/* Universal Back Arrow */}
          <button
            type="button"
            data-onboarding-back="true"
            disabled={step <= 1}
            onClick={handleBack}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-muted/60 hover:bg-muted border border-border text-foreground transition-colors active:scale-[0.96] motion-reduce:transform-none shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Previous step"
            title="Previous step"
          >
            <ArrowLeft className="h-4 w-4 stroke-[2.2]" />
          </button>

          <div className="flex items-center gap-2 pl-0.5">
            <KineticLogo size={22} className="shrink-0 drop-shadow-xs" />
            <span className="text-xs sm:text-sm font-semibold tracking-tight text-foreground">
              Kinetic
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border shadow-xs">
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={cn(
                "min-h-[44px] min-w-[44px] p-2 flex items-center justify-center rounded-lg text-xs transition-colors cursor-pointer active:scale-[0.98]",
                themeMode === 'light' ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
              )}
              title="Light"
              aria-label="Light palette"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={cn(
                "min-h-[44px] min-w-[44px] p-2 flex items-center justify-center rounded-lg text-xs transition-colors cursor-pointer active:scale-[0.98]",
                themeMode === 'dark' ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
              )}
              title="Dark"
              aria-label="Dark palette"
            >
              <Moon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setThemeMode('system')}
              className={cn(
                "min-h-[44px] min-w-[44px] p-2 flex items-center justify-center rounded-lg text-xs transition-colors cursor-pointer active:scale-[0.98]",
                themeMode === 'system' ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
              )}
              title="Auto"
              aria-label="Auto palette"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Discrete 7-Segment Progress */}
      <OnboardingProgress currentStep={step} totalSteps={7} />

      <div className="relative overflow-hidden min-w-0 min-h-[460px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={pageTransitionVariants}
            initial={false}
            animate="center"
            exit="exit"
            className="w-full min-w-0"
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
                  setState((s) => ({
                    ...s,
                    primaryGoal,
                    goalCategory: goalCategory as OnboardingState["goalCategory"],
                  }))
                }
                onNext={nextStep}
                onBack={prevStep}
              />
            )}

            {step === 4 && (
              <Stage4Scaffolding
                selectedRoutines={state.supportingRoutines}
                onChange={(routinesOrFn) =>
                  setState((s) => ({
                    ...s,
                    supportingRoutines:
                      typeof routinesOrFn === "function"
                        ? routinesOrFn(s.supportingRoutines)
                        : routinesOrFn,
                  }))
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
                  await onComplete(state);
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
