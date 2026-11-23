// src/components/paywall/OfflineSyncView.tsx
import React, { useState, useEffect } from "react";
import { ShieldCheck, WifiOff, RefreshCw, ArrowRight, CheckCircle2 } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { clearOfflineCachedToken, getOfflineCachedToken } from "@/services/monetizationService";

interface OfflineSyncViewProps {
  onProceedToPact: () => void;
  onReconnected?: () => void;
}

export function OfflineSyncView({ onProceedToPact, onReconnected }: OfflineSyncViewProps) {
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : false
  );
  const cachedData = getOfflineCachedToken();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerHaptic.success();
      if (onReconnected) onReconnected();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [onReconnected]);

  const handleManualCheck = async () => {
    triggerHaptic.light();
    setIsChecking(true);
    await new Promise((r) => setTimeout(r, 800));
    const online = typeof navigator !== "undefined" ? navigator.onLine : false;
    setIsOnline(online);
    setIsChecking(false);
    if (online) {
      triggerHaptic.success();
      if (onReconnected) onReconnected();
    }
  };

  const handleProceed = () => {
    triggerHaptic.medium();
    onProceedToPact();
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 text-foreground selection:bg-emerald-500/20">
      {/* Offline Status Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium">
        <ShieldCheck className="h-4 w-4" />
        <span>Optimistic Vault Sync Active</span>
      </div>

      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
          Authorization Cached in Encrypted Vault
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed text-pretty">
          Your payment setup was accepted locally. Your 90-day trajectory is active. Reconciliation with the payment gateway will complete automatically upon reconnect.
        </p>
      </div>

      {/* Vault Milled Slab */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-[var(--shadow-card)] space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <span className="text-xs font-mono font-semibold text-foreground flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-amber-500" />
            <span>Connection Telemetry</span>
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">
            {isOnline ? "Back online" : "Operating offline"}
          </span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Vault token:</span>
            <span className="font-semibold text-foreground truncate max-w-[180px]">
              {cachedData?.token || "vault_token_synced"}
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Reconciliation strategy:</span>
            <span className="font-semibold text-foreground">Optimistic store-and-forward</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Access status:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Unrestricted</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          type="button"
          onClick={handleProceed}
          className="w-full min-h-[52px] rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm tracking-wide shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:bg-emerald-400 active:scale-[0.98] transition-[background-color,transform] flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          <span>Proceed to Stage 7 (Sovereign Pact)</span>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </button>

        <button
          type="button"
          disabled={isChecking}
          onClick={handleManualCheck}
          className="w-full min-h-[44px] rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground text-xs font-mono transition-colors active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? "motion-safe:animate-spin" : ""}`} />
          <span>{isChecking ? "Checking link…" : "Check connection status now"}</span>
        </button>
      </div>
    </div>
  );
}
