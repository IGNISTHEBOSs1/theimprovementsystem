// src/components/paywall/PaywallView.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Target,
  CircleDot,
  CheckCircle2,
  Clock,
  ArrowRight,
  X,
  Bell,
  Lock,
  ChevronDown,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { OnboardingState } from "@/components/onboarding/types";
import {
  getPricingByCountry,
  PlanPricing,
  PricingTierData,
} from "@/services/monetizationService";

interface PaywallViewProps {
  onboardingState: OnboardingState;
  onSelectPlanAndCheckout: (plan: PlanPricing) => void;
  onContinueUnmonitored: () => void;
  onRestorePurchases?: () => void;
  onDismiss?: () => void;
}

export function PaywallView({
  onboardingState,
  onSelectPlanAndCheckout,
  onContinueUnmonitored,
  onRestorePurchases,
  onDismiss,
}: PaywallViewProps) {
  const pricingData: PricingTierData = getPricingByCountry(onboardingState.countryCode);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(pricingData.annual.id);
  const [showAlternateCadences, setShowAlternateCadences] = useState<boolean>(false);
  const [showLossAversionModal, setShowLossAversionModal] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  // Strict 1 Focus + up to 2 Routines invariant
  const primaryGoal = onboardingState.primaryGoal || "Production MVP & 100 paying customers";
  const supportingRoutines = (onboardingState.supportingRoutines || []).slice(0, 2);

  const selectedPlan: PlanPricing =
    selectedPlanId === pricingData.monthly.id
      ? pricingData.monthly
      : selectedPlanId === pricingData.quarterly.id
      ? pricingData.quarterly
      : selectedPlanId === pricingData.lifetime.id
      ? pricingData.lifetime
      : pricingData.annual;

  const handleStartTrial = () => {
    triggerHaptic.medium();
    onSelectPlanAndCheckout(selectedPlan);
  };

  const handleRestore = async () => {
    triggerHaptic.light();
    setIsRestoring(true);
    setRestoreMessage(null);
    try {
      if (onRestorePurchases) {
        await onRestorePurchases();
      } else {
        await new Promise((r) => setTimeout(r, 800));
      }
      setRestoreMessage("No previous active subscription found for this account.");
    } catch {
      setRestoreMessage("Unable to connect to app store vault.");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 text-foreground selection:bg-emerald-500/20">
      {/* Header Utilities */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={handleRestore}
          disabled={isRestoring}
          className="min-h-[44px] px-2 text-xs font-mono font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-lg disabled:opacity-50"
        >
          {isRestoring ? "Restoring..." : "Restore purchases"}
        </button>

        <button
          type="button"
          onClick={() => setShowLossAversionModal(true)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-lg"
          aria-label="Dismiss paywall"
        >
          <X className="h-5 w-5 stroke-[2]" />
        </button>
      </div>

      {restoreMessage && (
        <div className="rounded-xl border border-border/80 bg-card p-3 text-xs text-muted-foreground font-mono">
          {restoreMessage}
        </div>
      )}

      {/* Goal-Gradient Progress Bar (Step 6 of 7 complete) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Calibration stage 6 / 7</span>
          </span>
          <span className="font-semibold text-foreground tabular-nums">85% complete</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={85}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Calibration progress"
          className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden border border-border/60"
        >
          <div className="h-full bg-emerald-500 rounded-full transition-[width] duration-500" style={{ width: "85%" }} />
        </div>
      </div>

      {/* Hero Framing: Outcome Framing */}
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
          Lock in your 90-day mathematical buffer cone
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty">
          Kinetic absorbs up to <span className="font-mono tabular-nums font-semibold text-foreground">9 flexible days</span> without
          trajectory reset. Real-time deterministic pace calculation.
        </p>
      </div>

      {/* Calibrated Parameters Plinth (Milled Slab: 1 Focus + up to 2 Routines) */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-[var(--shadow-card)] space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <span className="text-xs font-mono font-semibold text-foreground flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-500" />
            <span>Calibrated parameters</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
            Nominal Lock
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px] font-mono">Primary focus (90 days)</span>
            <p className="font-semibold text-foreground text-xs leading-snug mt-0.5">{primaryGoal}</p>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px] font-mono">
              Supporting routines (Strictly {supportingRoutines.length} / 2)
            </span>
            <div className="mt-1 space-y-1">
              {supportingRoutines.length > 0 ? (
                supportingRoutines.map((routine, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-foreground/90">
                    <CircleDot className="h-3 w-3 text-emerald-500 shrink-0" />
                    <span className="truncate">{routine}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 text-foreground/90">
                  <CircleDot className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>Uninterrupted deep work execution block</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Blinkist Transparency Timeline */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-[var(--shadow-card)] space-y-3">
        <span className="text-xs font-mono font-semibold text-foreground block">
          Transparent 7-day trial timeline
        </span>

        <div className="relative pl-6 space-y-4">
          {/* Vertical Connecting Line */}
          <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-border/80" />

          {/* Step 1: Today */}
          <div className="relative space-y-0.5">
            <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-emerald-500 bg-background flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-bold text-foreground">Today</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">$0.00 Due</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Full trajectory unlocked. Instant calibration of your 90-day velocity vectors and buffer envelope.
            </p>
          </div>

          {/* Step 2: Day 5 */}
          <div className="relative space-y-0.5">
            <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-border bg-background flex items-center justify-center">
              <Bell className="h-2 w-2 text-amber-500" />
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-semibold text-foreground">Day 5</span>
              <span className="font-mono text-muted-foreground">Notification alert</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              We send an automatic push reminder that billing activates in 48 hours. Zero unexpected charges.
            </p>
          </div>

          {/* Step 3: Day 7 */}
          <div className="relative space-y-0.5">
            <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-border bg-background flex items-center justify-center">
              <Lock className="h-2 w-2 text-foreground" />
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-semibold text-foreground">Day 7</span>
              <span className="font-mono text-foreground font-semibold tabular-nums">{selectedPlan.displayPrice} / {selectedPlan.cadenceLabel}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Annual covenant begins. Cancel anytime in 2 taps directly inside Settings.
            </p>
          </div>
        </div>
      </div>

      {/* Plan Selector (Hick's Law: 2 primary options by default) */}
      <div className="space-y-2.5" role="radiogroup" aria-label="Subscription plans">
        {/* Annual Covenant (Pre-selected default) */}
        <div
          role="radio"
          aria-checked={selectedPlanId === pricingData.annual.id}
          tabIndex={0}
          onClick={() => {
            triggerHaptic.light();
            setSelectedPlanId(pricingData.annual.id);
          }}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              setSelectedPlanId(pricingData.annual.id);
            }
          }}
          className={`min-h-[50px] p-3.5 rounded-xl border cursor-pointer transition-[border-color,background-color] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground ${
            selectedPlanId === pricingData.annual.id
              ? "border-emerald-500/60 bg-accent/60 shadow-[var(--shadow-card)] ring-1 ring-emerald-500/30"
              : "border-border/80 bg-card hover:bg-muted/40"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
                  selectedPlanId === pricingData.annual.id
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-muted-foreground/50 bg-transparent"
                }`}
              >
                {selectedPlanId === pricingData.annual.id && <CheckCircle2 className="h-3.5 w-3.5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    {pricingData.annual.name}
                  </span>
                  {pricingData.annual.savingsBadge && (
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {pricingData.annual.savingsBadge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">
                  <span className="tabular-nums">{pricingData.annual.perDayPrice}</span> / day (<span className="tabular-nums">{pricingData.annual.perWeekPrice}</span> / wk)
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs sm:text-sm font-bold font-mono text-foreground tabular-nums">
                {pricingData.annual.displayPrice}
              </span>
              <span className="text-[10px] text-muted-foreground block font-mono">
                / {pricingData.annual.cadenceLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Operator */}
        <div
          role="radio"
          aria-checked={selectedPlanId === pricingData.monthly.id}
          tabIndex={0}
          onClick={() => {
            triggerHaptic.light();
            setSelectedPlanId(pricingData.monthly.id);
          }}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              setSelectedPlanId(pricingData.monthly.id);
            }
          }}
          className={`min-h-[50px] p-3.5 rounded-xl border cursor-pointer transition-[border-color,background-color] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground ${
            selectedPlanId === pricingData.monthly.id
              ? "border-emerald-500/60 bg-accent/60 shadow-[var(--shadow-card)] ring-1 ring-emerald-500/30"
              : "border-border/80 bg-card hover:bg-muted/40"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
                  selectedPlanId === pricingData.monthly.id
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-muted-foreground/50 bg-transparent"
                }`}
              >
                {selectedPlanId === pricingData.monthly.id && <CheckCircle2 className="h-3.5 w-3.5" />}
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-foreground">
                  {pricingData.monthly.name}
                </span>
                <span className="text-[11px] text-muted-foreground block font-mono">
                  <span className="tabular-nums">{pricingData.monthly.perWeekPrice}</span> / week
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs sm:text-sm font-bold font-mono text-foreground tabular-nums">
                {pricingData.monthly.displayPrice}
              </span>
              <span className="text-[10px] text-muted-foreground block font-mono">
                / {pricingData.monthly.cadenceLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Progressive Disclosure: Alternate Cadence (Quarterly / Lifetime) */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => setShowAlternateCadences((prev) => !prev)}
            className="w-full min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-lg"
          >
            <span>{showAlternateCadences ? "Hide alternate cadence" : "View alternate cadence (Quarterly / Lifetime)"}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showAlternateCadences ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showAlternateCadences && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-2 pt-2"
              >
                {/* Quarterly */}
                <div
                  role="radio"
                  aria-checked={selectedPlanId === pricingData.quarterly.id}
                  tabIndex={0}
                  onClick={() => {
                    triggerHaptic.light();
                    setSelectedPlanId(pricingData.quarterly.id);
                  }}
                  className={`min-h-[50px] p-3 rounded-xl border cursor-pointer transition-[border-color,background-color] active:scale-[0.98] ${
                    selectedPlanId === pricingData.quarterly.id
                      ? "border-emerald-500/60 bg-accent/60 shadow-xs"
                      : "border-border/80 bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-foreground">{pricingData.quarterly.name}</span>
                      <span className="text-[11px] text-muted-foreground block font-mono">Every 90-day trajectory cycle</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono text-foreground tabular-nums">{pricingData.quarterly.displayPrice}</span>
                      <span className="text-[10px] text-muted-foreground block font-mono">/ quarter</span>
                    </div>
                  </div>
                </div>

                {/* Lifetime */}
                <div
                  role="radio"
                  aria-checked={selectedPlanId === pricingData.lifetime.id}
                  tabIndex={0}
                  onClick={() => {
                    triggerHaptic.light();
                    setSelectedPlanId(pricingData.lifetime.id);
                  }}
                  className={`min-h-[50px] p-3 rounded-xl border cursor-pointer transition-[border-color,background-color] active:scale-[0.98] ${
                    selectedPlanId === pricingData.lifetime.id
                      ? "border-emerald-500/60 bg-accent/60 shadow-xs"
                      : "border-border/80 bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-foreground">{pricingData.lifetime.name}</span>
                      <span className="text-[11px] text-muted-foreground block font-mono">Perpetual sovereign access</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono text-foreground tabular-nums">{pricingData.lifetime.displayPrice}</span>
                      <span className="text-[10px] text-muted-foreground block font-mono">one-time</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Primary & Secondary Actions */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={handleStartTrial}
          className="w-full min-h-[52px] px-6 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm tracking-wide shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:bg-emerald-400 active:scale-[0.98] transition-[background-color,transform] flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          <span>Start 7-day trajectory trial</span>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </button>

        <p className="text-[11px] text-center font-mono text-muted-foreground">
          No commitment. Cancel anytime in 2 taps.
        </p>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setShowLossAversionModal(true)}
            className="min-h-[44px] px-4 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-lg"
          >
            Continue unmonitored
          </button>
        </div>
      </div>

      {/* Status Quo Loss Aversion Warning Modal */}
      <AnimatePresence>
        {showLossAversionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl border border-border/90 bg-card p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-2.5 text-amber-500">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-bold text-sm text-foreground">Operate without buffer protection?</span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                You are choosing to operate on the unmonitored free tier without the <span className="text-foreground font-semibold">±10% mathematical buffer cone</span>. Missed days will immediately compromise velocity calculations with no recovery absorption.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLossAversionModal(false);
                    handleStartTrial();
                  }}
                  className="w-full min-h-[50px] rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-xs hover:bg-emerald-400 active:scale-[0.98] transition-[background-color,transform] cursor-pointer"
                >
                  Activate 7-day protected trial
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowLossAversionModal(false);
                    onContinueUnmonitored();
                  }}
                  className="w-full min-h-[44px] rounded-xl border border-border bg-muted/20 text-muted-foreground hover:text-foreground text-xs font-mono transition-colors active:scale-[0.98] cursor-pointer"
                >
                  Proceed unmonitored
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
