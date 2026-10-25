import { useState, useRef, useEffect } from "react";
import { RotateCcw, ArrowRight, Check, Pause } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { triggerHaptic } from "@/lib/haptics";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import type { RebalanceProposal } from "@/lib/rebalance";

interface AutoRebalanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: RebalanceProposal;
  onApplyProposal: (seriesId: string, newDays: number[]) => Promise<void>;
  onPauseRoutine?: (seriesId: string) => Promise<void>;
}

export function AutoRebalanceModal({
  open,
  onOpenChange,
  proposal,
  onApplyProposal,
  onPauseRoutine,
}: AutoRebalanceModalProps) {
  const { playSuccess, playTap } = useSoundEffects();
  const [applying, setApplying] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [reducing, setReducing] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const targetDays = proposal.currentDays
    .map((d) => (d === proposal.fromDay ? proposal.toDay : d))
    .sort();

  const canReduce = proposal.currentDays.length > 1;

  const handleApply = async () => {
    if (applying || pausing || reducing || appliedMessage) return;
    setApplying(true);
    triggerHaptic("success");
    playSuccess();
    try {
      await onApplyProposal(proposal.seriesId, targetDays);
      setAppliedMessage(`Routine moved from ${proposal.fromDayLabel} to ${proposal.toDayLabel}.`);
      timerRef.current = setTimeout(() => {
        onOpenChange(false);
        setAppliedMessage(null);
        setApplying(false);
      }, 1200);
    } catch {
      setApplying(false);
    }
  };

  const handlePause = async () => {
    if (!onPauseRoutine || applying || pausing || reducing || appliedMessage) return;
    setPausing(true);
    playTap();
    try {
      await onPauseRoutine(proposal.seriesId);
      setAppliedMessage("Routine paused for this cycle.");
      timerRef.current = setTimeout(() => {
        onOpenChange(false);
        setAppliedMessage(null);
        setPausing(false);
      }, 1200);
    } catch {
      setPausing(false);
    }
  };

  const handleReduce = async () => {
    if (applying || pausing || reducing || appliedMessage || !canReduce) return;
    setReducing(true);
    playTap();
    try {
      const reducedDays = proposal.currentDays.filter((d) => d !== proposal.fromDay);
      await onApplyProposal(proposal.seriesId, reducedDays);
      setAppliedMessage(`Reduced routine frequency by dropping ${proposal.fromDayLabel}.`);
      timerRef.current = setTimeout(() => {
        onOpenChange(false);
        setAppliedMessage(null);
        setReducing(false);
      }, 1200);
    } catch {
      setReducing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="size-4 text-primary" aria-hidden="true" />
            Adjust Routine Cadence
          </DialogTitle>
          <DialogDescription>
            Deterministic recommendation based on your verified completion history.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">{proposal.questTitle}</p>

          <div className="flex items-center justify-center gap-4 py-2 text-xs">
            <div className="text-center p-2 rounded-lg bg-muted/40 border border-border/50 min-w-[90px]">
              <div className="font-semibold text-foreground">{proposal.fromDayLabel}</div>
              <div className="text-muted-foreground mt-0.5">
                {Math.round(proposal.fromDayRate * 100)}% finish
              </div>
            </div>

            <ArrowRight className="size-4 shrink-0 text-primary" aria-hidden="true" />

            <div className="text-center p-2 rounded-lg bg-primary/10 border border-primary/30 min-w-[90px]">
              <div className="font-semibold text-primary">{proposal.toDayLabel}</div>
              <div className="text-primary/80 mt-0.5">
                {proposal.toDayRate >= 0 ? `${Math.round(proposal.toDayRate * 100)}% usual` : "Recommended"}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            You frequently miss on <strong className="text-foreground">{proposal.fromDayLabel}</strong> ({Math.round(proposal.fromDayRate * 100)}% follow-through across {proposal.fromDaySample} checks). Moving this occurrence to <strong className="text-foreground">{proposal.toDayLabel}</strong> removes structural friction.
          </p>
        </div>

        {appliedMessage ? (
          <div
            role="status"
            aria-live="polite"
            className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2"
          >
            <Check className="size-4 shrink-0" />
            <span>{appliedMessage}</span>
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-2 flex-wrap sm:flex-nowrap">
          {onPauseRoutine && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handlePause()}
              disabled={applying || pausing || reducing || Boolean(appliedMessage)}
              className="min-h-10 text-xs"
            >
              <Pause className="size-3 mr-1" />
              {pausing ? "Pausing…" : "Pause Routine"}
            </Button>
          )}
          {canReduce && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleReduce()}
              disabled={applying || pausing || reducing || Boolean(appliedMessage)}
              className="min-h-10 text-xs"
            >
              {reducing ? "Reducing…" : `Drop ${proposal.fromDayLabel}`}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => void handleApply()}
            disabled={applying || pausing || reducing || Boolean(appliedMessage)}
            className="min-h-10 text-xs font-semibold"
          >
            {applying ? "Applying…" : `Move to ${proposal.toDayLabel}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
