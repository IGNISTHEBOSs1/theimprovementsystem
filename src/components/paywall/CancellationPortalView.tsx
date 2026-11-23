// src/components/paywall/CancellationPortalView.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Snowflake,
  Shield,
  Download,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  X,
  FileText,
} from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import {
  SubscriptionState,
  applyCryoBufferFreeze,
  cancelSubscription,
  exportTrajectoryTelemetryJSON,
} from "@/services/monetizationService";
import { OnboardingState } from "@/components/onboarding/types";

interface CancellationPortalViewProps {
  onboardingState?: OnboardingState;
  subscriptionState: SubscriptionState;
  onClose: () => void;
  onFreezeConfirmed: () => void;
  onCancelConfirmed: () => void;
}

const DEPARTURE_OPTIONS = [
  { id: "target_achieved", label: "Target achieved early", desc: "Successfully hit my primary objective." },
  { id: "pace_aggressive", label: "Pace too aggressive", desc: "Need to step back and rebalance daily commitment." },
  { id: "financial", label: "Financial reprioritization", desc: "Temporarily reallocating personal budget." },
  { id: "technical", label: "Technical or workflow friction", desc: "Tool did not align with existing routine setup." },
];

export function CancellationPortalView({
  onboardingState,
  subscriptionState,
  onClose,
  onFreezeConfirmed,
  onCancelConfirmed,
}: CancellationPortalViewProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [freezeDurationDays, setFreezeDurationDays] = useState<number>(30);
  const [hasExported, setHasExported] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleReasonSelect = (id: string) => {
    triggerHaptic.light();
    setSelectedReason(id);
    setStep(2); // Advance to Sovereign Alternative (Rescue Offer)
  };

  const handleAcceptFreeze = async () => {
    triggerHaptic.medium();
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 600));
    applyCryoBufferFreeze(freezeDurationDays);
    triggerHaptic.success();
    setIsProcessing(false);
    onFreezeConfirmed();
  };

  const handleDeclineFreeze = () => {
    triggerHaptic.light();
    setStep(3); // Proceed to 1-Tap Final Exit
  };

  const handleDownloadTelemetry = () => {
    triggerHaptic.light();
    const jsonStr = exportTrajectoryTelemetryJSON(onboardingState, subscriptionState);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kinetic_trajectory_telemetry_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setHasExported(true);
  };

  const handleFinalCancel = async () => {
    triggerHaptic.heavy();
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 800));
    cancelSubscription(selectedReason || "User opted out via cancellation portal");
    triggerHaptic.success();
    setIsProcessing(false);
    onCancelConfirmed();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-lg rounded-2xl border border-border/90 bg-card p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-foreground">
              Subscription Management & Sovereign Portal
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded"
            aria-label="Close cancellation portal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step 1: Diagnostic Survey */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                Help Us Understand Your Trajectory
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Kinetic treats your departure with institutional dignity. Select the reason for adjusting your subscription:
              </p>
            </div>

            <div className="space-y-2.5" role="radiogroup" aria-label="Departure reasons">
              {DEPARTURE_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  role="radio"
                  aria-checked={selectedReason === opt.id}
                  tabIndex={0}
                  onClick={() => handleReasonSelect(opt.id)}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      handleReasonSelect(opt.id);
                    }
                  }}
                  className="min-h-[50px] p-3.5 rounded-xl border border-border/80 bg-background hover:bg-muted/40 cursor-pointer transition-[border-color,background-color] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-foreground block">{opt.label}</span>
                      <span className="text-[11px] text-muted-foreground">{opt.desc}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: The Sovereign Alternative (Rescue Offer: 30-Day Cryo-Buffer Freeze) */}
        {step === 2 && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium">
                <Snowflake className="h-3.5 w-3.5" />
                <span>The Sovereign Alternative ($0.00)</span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                Activate 30-Day Cryo-Buffer Freeze
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed text-pretty">
                Pause your subscription without abandoning your momentum. We freeze your billing and preserve all 90-day trajectory data and buffer capacity.
              </p>
            </div>

            {/* Cryo Milled Slab */}
            <div className="rounded-2xl border border-emerald-500/30 bg-card p-4 shadow-[var(--shadow-card)] space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="font-semibold text-foreground">Freeze Conditions</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">$0.00 / month</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Billing status:</span>
                <span className="font-semibold text-foreground">Immediate 30-day pause</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Telemetry data:</span>
                <span className="font-semibold text-foreground">100% Preserved in vault</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Buffer capacity:</span>
                <span className="font-semibold text-foreground">9 Flex days locked</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleAcceptFreeze}
                className="w-full min-h-[52px] rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm tracking-wide shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:bg-emerald-400 active:scale-[0.98] transition-[background-color,transform] flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-50"
              >
                <Snowflake className="h-4 w-4" />
                <span>Freeze trajectory for 30 days ($0.00)</span>
              </button>

              <button
                type="button"
                onClick={handleDeclineFreeze}
                className="w-full min-h-[44px] rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground text-xs font-mono transition-colors active:scale-[0.98] cursor-pointer"
              >
                Decline freeze and continue to cancellation
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 1-Tap Final Exit + JSON Export */}
        {step === 3 && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to rescue offer</span>
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                Confirm Sovereign Departure
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You retain complete ownership of your execution history. Export your telemetry data before departing:
              </p>
            </div>

            {/* Export Telemetry Box */}
            <div className="rounded-2xl border border-border/80 bg-background p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-mono font-bold text-foreground">
                    Trajectory Telemetry (JSON)
                  </span>
                </div>
                {hasExported && (
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Downloaded</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Includes your 90-day primary focus, supporting routines, geographic parameters, and mathematical buffer configurations.
              </p>
              <button
                type="button"
                onClick={handleDownloadTelemetry}
                className="w-full min-h-[44px] rounded-xl border border-border bg-card hover:bg-muted/40 text-foreground text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export trajectory telemetry (JSON)</span>
              </button>
            </div>

            {/* Final Single-Tap Cancellation Button */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleFinalCancel}
                className="w-full min-h-[50px] rounded-xl border border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20 font-bold text-xs tracking-wide shadow-xs active:scale-[0.98] transition-[background-color,transform] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? "Finalizing cancellation…" : "Confirm cancellation"}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-[44px] rounded-xl border border-border bg-card text-foreground text-xs font-mono transition-colors active:scale-[0.98] cursor-pointer"
              >
                Keep my subscription active
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
