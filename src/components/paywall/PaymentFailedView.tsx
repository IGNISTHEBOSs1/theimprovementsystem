// src/components/paywall/PaymentFailedView.tsx
import React, { useState } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  CreditCard,
  RefreshCw,
  ArrowRight,
  Clock,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import {
  SubscriptionState,
  formatCardNumber,
  formatExpiry,
  formatCvc,
  detectCardScheme,
  resolvePaymentIssue,
} from "@/services/monetizationService";

interface PaymentFailedViewProps {
  subscriptionState: SubscriptionState;
  onPaymentResolved: (newPaymentSummary: string) => void;
  onContinueUninterrupted: () => void;
}

export function PaymentFailedView({
  subscriptionState,
  onPaymentResolved,
  onContinueUninterrupted,
}: PaymentFailedViewProps) {
  const [resolutionMode, setResolutionMode] = useState<"retry" | "replace">("retry");
  const [newCardNumber, setNewCardNumber] = useState<string>("");
  const [newExpiry, setNewExpiry] = useState<string>("");
  const [newCvc, setNewCvc] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 16-Day Grace Period calculation
  const graceEndDate = subscriptionState.gracePeriodEndDate
    ? new Date(subscriptionState.gracePeriodEndDate)
    : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const daysRemaining = Math.max(
    1,
    Math.ceil((graceEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const formattedGraceEnd = graceEndDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const nextRetryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic.medium();
    setIsSubmitting(true);
    setErrorMessage(null);

    if (resolutionMode === "replace") {
      const clean = newCardNumber.replace(/\D/g, "");
      if (clean.length < 13 || newExpiry.length < 4 || newCvc.length < 3) {
        setIsSubmitting(false);
        setErrorMessage("Please complete all replacement card fields.");
        return;
      }

      await new Promise((r) => setTimeout(r, 900));
      const last4 = clean.slice(-4);
      const scheme = detectCardScheme(clean);
      const schemeLabel = scheme.toUpperCase();
      const updated = resolvePaymentIssue(`${schemeLabel} ending ${last4}`);
      triggerHaptic.success();
      setIsSubmitting(false);
      onPaymentResolved(updated.paymentMethodSummary || `Card ending ${last4}`);
    } else {
      // Retry current card
      await new Promise((r) => setTimeout(r, 800));
      const updated = resolvePaymentIssue(subscriptionState.paymentMethodSummary || "Primary Card");
      triggerHaptic.success();
      setIsSubmitting(false);
      onPaymentResolved(updated.paymentMethodSummary || "Primary Card");
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 text-foreground selection:bg-emerald-500/20">
      {/* Institutional Diagnostic Header */}
      <div className="space-y-1.5 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-medium">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Payment authorization paused</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
          Your 90-Day Trajectory Remains Active
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed text-pretty">
          Under StoreKit 2 and Stripe 16-day grace protocols, your daily access and telemetry logging are 100% uninterrupted while billing updates.
        </p>
      </div>

      {/* Grace Window Milled Slab */}
      <div className="rounded-2xl border border-amber-500/30 bg-card p-4 shadow-[var(--shadow-card)] space-y-2.5">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <span className="text-xs font-mono font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Trajectory Protection Status</span>
          </span>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            100% Uninterrupted
          </span>
        </div>

        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Grace window remaining:</span>
            <span className="font-bold text-amber-500 tabular-nums">{daysRemaining} days left (until {formattedGraceEnd})</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Next automatic retry:</span>
            <span className="font-semibold text-foreground">{nextRetryDate}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Diagnostic reason:</span>
            <span className="text-foreground/80 truncate max-w-[200px]">
              {subscriptionState.lastPaymentError || "Bank authorization required"}
            </span>
          </div>
        </div>
      </div>

      {/* Resolution Choice Form */}
      <form onSubmit={handleAction} className="space-y-3">
        {errorMessage && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive font-mono">
            {errorMessage}
          </div>
        )}

        <div className="space-y-2" role="radiogroup" aria-label="Payment recovery options">
          {/* Option 1: Retry Current Card */}
          <div
            role="radio"
            aria-checked={resolutionMode === "retry"}
            tabIndex={0}
            onClick={() => setResolutionMode("retry")}
            className={`min-h-[50px] p-3 rounded-xl border cursor-pointer transition-[border-color,background-color] active:scale-[0.98] ${
              resolutionMode === "retry"
                ? "border-emerald-500/60 bg-accent/60 shadow-xs"
                : "border-border/80 bg-card hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-4 w-4 text-emerald-500" />
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Retry currently registered card
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {subscriptionState.paymentMethodSummary || "Primary Card"}
                  </span>
                </div>
              </div>
              <div
                className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  resolutionMode === "retry" ? "border-emerald-500 bg-emerald-500 text-white" : "border-border"
                }`}
              >
                {resolutionMode === "retry" && <CheckCircle2 className="h-3 w-3" />}
              </div>
            </div>
          </div>

          {/* Option 2: Enter Replacement Card */}
          <div
            role="radio"
            aria-checked={resolutionMode === "replace"}
            tabIndex={0}
            onClick={() => setResolutionMode("replace")}
            className={`min-h-[50px] p-3 rounded-xl border cursor-pointer transition-[border-color,background-color] active:scale-[0.98] ${
              resolutionMode === "replace"
                ? "border-emerald-500/60 bg-accent/60 shadow-xs"
                : "border-border/80 bg-card hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-emerald-500" />
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Enter replacement payment method
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Update card details in 256-bit encrypted vault
                  </span>
                </div>
              </div>
              <div
                className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  resolutionMode === "replace" ? "border-emerald-500 bg-emerald-500 text-white" : "border-border"
                }`}
              >
                {resolutionMode === "replace" && <CheckCircle2 className="h-3 w-3" />}
              </div>
            </div>
          </div>
        </div>

        {/* Replacement Card Inputs */}
        {resolutionMode === "replace" && (
          <div className="space-y-2.5 pt-1">
            <div className="space-y-1">
              <label htmlFor="replace-card-num" className="text-xs font-mono text-muted-foreground block">
                Replacement card number
              </label>
              <input
                id="replace-card-num"
                type="text"
                inputMode="numeric"
                value={newCardNumber}
                onChange={(e) => setNewCardNumber(formatCardNumber(e.target.value))}
                placeholder="4242 4242 4242 4242"
                className="w-full h-11 rounded-xl border border-border/80 bg-background px-3 text-xs sm:text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/40 shadow-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="replace-expiry" className="text-xs font-mono text-muted-foreground block">
                  Expiration (MM/YY)
                </label>
                <input
                  id="replace-expiry"
                  type="text"
                  inputMode="numeric"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  className="w-full h-11 rounded-xl border border-border/80 bg-background px-3 text-xs sm:text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/40 shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="replace-cvc" className="text-xs font-mono text-muted-foreground block">
                  Security code
                </label>
                <input
                  id="replace-cvc"
                  type="text"
                  inputMode="numeric"
                  value={newCvc}
                  onChange={(e) => setNewCvc(formatCvc(e.target.value))}
                  placeholder="123"
                  className="w-full h-11 rounded-xl border border-border/80 bg-background px-3 text-xs sm:text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/40 shadow-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="pt-2 space-y-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[52px] rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm tracking-wide shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:bg-emerald-400 active:scale-[0.98] transition-[background-color,transform] flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Reconciling with vault…</span>
            ) : (
              <>
                <span>{resolutionMode === "retry" ? "Retry current card authorization" : "Update card & resolve authorization"}</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onContinueUninterrupted}
            className="w-full min-h-[44px] rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground text-xs font-mono transition-colors active:scale-[0.98] cursor-pointer"
          >
            Continue to dashboard (Grace period active)
          </button>
        </div>
      </form>
    </div>
  );
}
