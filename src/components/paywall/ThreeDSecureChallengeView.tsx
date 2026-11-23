// src/components/paywall/ThreeDSecureChallengeView.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Shield, CheckCircle2, AlertTriangle, ArrowRight, X } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

interface ThreeDSecureChallengeViewProps {
  onSuccess: () => void;
  onCancel: () => void;
  onTimeout?: () => void;
}

export function ThreeDSecureChallengeView({
  onSuccess,
  onCancel,
  onTimeout,
}: ThreeDSecureChallengeViewProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(45);
  const [smsCode, setSmsCode] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 45-second fallback timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onTimeout) onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeout]);

  const handleSimulateBankApproval = async () => {
    triggerHaptic.medium();
    setIsVerifying(true);
    setErrorMsg(null);
    await new Promise((r) => setTimeout(r, 1000));
    triggerHaptic.success();
    setIsVerifying(false);
    onSuccess();
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsCode || smsCode.length < 4) {
      setErrorMsg("Please enter the 6-digit confirmation code.");
      return;
    }
    handleSimulateBankApproval();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-md rounded-2xl border border-border/90 bg-card p-5 shadow-2xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-mono font-bold text-foreground">
              Strong Customer Authentication (3D Secure)
            </span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded"
            aria-label="Cancel verification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Bank Simulation Frame */}
        <div className="rounded-xl border border-border/80 bg-background p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">Verified by Visa / Mastercard ID Check</span>
            <span className="font-mono text-muted-foreground tabular-nums">{secondsLeft}s left</span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Your bank requires biometric or SMS authentication to complete the $0.00 trial verification.
          </p>

          {/* Emerald Pulse */}
          <div className="flex items-center gap-2 py-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono text-foreground/80">
              Awaiting banking challenge token verification…
            </span>
          </div>

          {/* Code Input */}
          <form onSubmit={handleManualCodeSubmit} className="space-y-2 pt-1">
            {errorMsg && (
              <span className="text-[11px] text-destructive block font-mono">{errorMsg}</span>
            )}
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={smsCode}
              onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit SMS code"
              className="w-full h-11 rounded-xl border border-border/80 bg-card px-3 text-sm font-mono tracking-widest text-center text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/40 shadow-xs"
            />
          </form>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            disabled={isVerifying}
            onClick={handleSimulateBankApproval}
            className="w-full min-h-[50px] rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-xs hover:bg-emerald-400 active:scale-[0.98] transition-[background-color,transform] flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-50"
          >
            {isVerifying ? (
              <span>Confirming with bank…</span>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Simulate Bank Authorization (Approve)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full min-h-[44px] rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground text-xs font-mono transition-colors active:scale-[0.98] cursor-pointer"
          >
            Cancel and try another card
          </button>
        </div>
      </motion.div>
    </div>
  );
}
