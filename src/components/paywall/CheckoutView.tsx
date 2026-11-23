// src/components/paywall/CheckoutView.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Lock,
  ArrowRight,
  ShieldCheck,
  Bell,
  ArrowLeft,
  Loader2,
  Check,
} from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import {
  PlanPricing,
  detectCardScheme,
  formatCardNumber,
  formatExpiry,
  formatCvc,
  CardScheme,
} from "@/services/monetizationService";

interface CheckoutViewProps {
  plan: PlanPricing;
  onBack: () => void;
  onSuccess: (paymentSummary: string) => void;
  onRequire3DS: () => void;
  onPaymentFailed: (reason: string) => void;
  onOfflineDetected: () => void;
}

export function CheckoutView({
  plan,
  onBack,
  onSuccess,
  onRequire3DS,
  onPaymentFailed,
  onOfflineDetected,
}: CheckoutViewProps) {
  const [method, setMethod] = useState<"express" | "card">("express");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiry, setExpiry] = useState<string>("");
  const [cvc, setCvc] = useState<string>("");
  const [nameOnCard, setNameOnCard] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cardScheme: CardScheme = detectCardScheme(cardNumber);

  // Billing date: Today + 7 days
  const now = new Date();
  const billingDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const formattedBillingDate = billingDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleExpressCheckout = async (walletType: "Apple Pay" | "Google Pay") => {
    triggerHaptic.medium();
    setIsProcessing(true);
    setErrorMessage(null);

    // Check offline status
    if (!navigator.onLine) {
      setIsProcessing(false);
      onOfflineDetected();
      return;
    }

    try {
      // Simulate native wallet SetupIntent sheet
      await new Promise((r) => setTimeout(r, 900));
      triggerHaptic.success();
      onSuccess(`${walletType} (Pre-authorized)`);
    } catch {
      setIsProcessing(false);
      setErrorMessage("Express authorization interrupted. Please try entering card details.");
    }
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic.medium();
    setErrorMessage(null);

    // Basic tolerant validation
    const cleanNum = cardNumber.replace(/\D/g, "");
    if (cleanNum.length < 13) {
      setErrorMessage("Please enter a valid credit or debit card number.");
      return;
    }
    if (expiry.length < 4) {
      setErrorMessage("Please enter a valid card expiration date (MM/YY).");
      return;
    }
    if (cvc.length < 3) {
      setErrorMessage("Please enter a valid card security code.");
      return;
    }

    setIsProcessing(true);

    // Check network offline
    if (!navigator.onLine) {
      setIsProcessing(false);
      onOfflineDetected();
      return;
    }

    // Diagnostic / Testing trigger hooks based on card number digits
    // - Ending in 3000 triggers 3D Secure
    // - Ending in 4002 triggers Card Decline (to test 16-day grace period)
    if (cleanNum.endsWith("3000")) {
      setTimeout(() => {
        setIsProcessing(false);
        onRequire3DS();
      }, 700);
      return;
    }

    if (cleanNum.endsWith("4002")) {
      setTimeout(() => {
        setIsProcessing(false);
        onPaymentFailed("Card issuer declined: Insufficient funds or velocity check.");
      }, 700);
      return;
    }

    // Standard Success simulation
    setTimeout(() => {
      setIsProcessing(false);
      triggerHaptic.success();
      const last4 = cleanNum.slice(-4);
      const schemeTitle =
        cardScheme === "visa"
          ? "Visa"
          : cardScheme === "mastercard"
          ? "Mastercard"
          : cardScheme === "amex"
          ? "American Express"
          : "Card";
      onSuccess(`${schemeTitle} ending ${last4}`);
    }, 1100);
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 text-foreground selection:bg-emerald-500/20">
      {/* Header with Back button */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="min-h-[44px] px-2 text-xs font-mono font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-lg flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Change plan</span>
        </button>

        <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-emerald-500" />
          <span>Sovereign 256-bit vault</span>
        </span>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground leading-tight">
          Authorize Sovereign Setup
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Zero commitment. Your trial runs for 7 full days before billing activates.
        </p>
      </div>

      {/* Order Summary Milled Slab */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-[var(--shadow-card)] space-y-2.5">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <span className="text-xs font-mono font-semibold text-foreground">
            {plan.name}
          </span>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
            7-Day Free Trial
          </span>
        </div>

        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Due today:</span>
            <span className="font-bold text-foreground tabular-nums">$0.00</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Next billing date:</span>
            <span className="font-semibold text-foreground">{formattedBillingDate}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Subsequent renewal:</span>
            <span className="font-semibold text-foreground tabular-nums">
              {plan.displayPrice} / {plan.cadenceLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Pre-Permission Notification Priming */}
      <div className="rounded-xl border border-border/80 bg-muted/20 p-3 flex items-start gap-2.5">
        <Bell className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Pre-billing guarantee:</strong> We dispatch an automated alert on Day 5 before billing activates so you can adjust or cancel with 2 taps.
        </p>
      </div>

      {/* Express Checkout Button */}
      <div className="space-y-2">
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => handleExpressCheckout("Apple Pay")}
          className="w-full min-h-[50px] rounded-xl bg-foreground text-background font-bold text-sm tracking-wide shadow-xs active:scale-[0.98] transition-[background-color,transform] flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-50"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
          ) : (
            <>
              <span>One-Touch Setup with</span>
              <span className="font-semibold">Apple Pay / Google Pay</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-border/60" />
          <span className="text-[11px] font-mono text-muted-foreground">or enter card</span>
          <div className="flex-1 h-px bg-border/60" />
        </div>
      </div>

      {/* Tolerant Card Input Form (Postel's Law) */}
      <form onSubmit={handleCardSubmit} className="space-y-3">
        {errorMessage && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive font-mono">
            {errorMessage}
          </div>
        )}

        {/* Card Number with Brand Badge */}
        <div className="space-y-1">
          <label htmlFor="card-number-input" className="text-xs font-mono text-muted-foreground block">
            Card number
          </label>
          <div className="relative flex items-center">
            <input
              id="card-number-input"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="4242 4242 4242 4242"
              className="w-full h-11 rounded-xl border border-border/80 bg-background px-3 pr-20 text-xs sm:text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/40 shadow-xs transition-colors"
            />
            <div className="absolute right-3 flex items-center gap-1.5 pointer-events-none">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase px-1.5 py-0.5 rounded bg-muted/60 border border-border/60">
                {cardScheme}
              </span>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Expiry & CVC Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="card-expiry-input" className="text-xs font-mono text-muted-foreground block">
              Expiration date
            </label>
            <input
              id="card-expiry-input"
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/YY"
              className="w-full h-11 rounded-xl border border-border/80 bg-background px-3 text-xs sm:text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/40 shadow-xs transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="card-cvc-input" className="text-xs font-mono text-muted-foreground block">
              Security code (CVC)
            </label>
            <input
              id="card-cvc-input"
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              value={cvc}
              onChange={(e) => setCvc(formatCvc(e.target.value, cardScheme))}
              placeholder={cardScheme === "amex" ? "1234" : "123"}
              className="w-full h-11 rounded-xl border border-border/80 bg-background px-3 text-xs sm:text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/40 shadow-xs transition-colors"
            />
          </div>
        </div>

        {/* Name on Card */}
        <div className="space-y-1">
          <label htmlFor="card-name-input" className="text-xs font-mono text-muted-foreground block">
            Name on card
          </label>
          <input
            id="card-name-input"
            type="text"
            autoComplete="cc-name"
            value={nameOnCard}
            onChange={(e) => setNameOnCard(e.target.value)}
            placeholder="Operator name"
            className="w-full h-11 rounded-xl border border-border/80 bg-background px-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/40 shadow-xs transition-colors"
          />
        </div>

        {/* Primary CTA */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full min-h-[52px] rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm tracking-wide shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:bg-emerald-400 active:scale-[0.98] transition-[background-color,transform] flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 motion-safe:animate-spin" />
            ) : (
              <>
                <span>Authorize $0.00 setup & start trial</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
