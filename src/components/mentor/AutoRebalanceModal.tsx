import { Link } from "react-router-dom";
import { RotateCcw, ArrowRight, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { RebalanceProposal } from "@/lib/rebalance";

interface AutoRebalanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: RebalanceProposal;
}

// Upgrades "Restructure Quests" from a bare link to the manual edit
// screen into an actual proposal — computed from this series' own
// resolved history (see lib/rebalance.ts), not a generic tip. Important
// honesty note, visible in the UI itself (not just this comment): there
// is currently no mutation in useDashboardData.ts that edits an existing
// series' recurrenceDays, so "Apply" cannot silently persist this for
// you yet — it hands you the exact change to make on the Quests screen
// instead of claiming to have done something it didn't. That's a
// backend gap (one new Supabase mutation + a UI control on the edit
// flow), not something to fake from the modal layer.
export function AutoRebalanceModal({ open, onOpenChange, proposal }: AutoRebalanceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[28px] bg-[#12141A] border border-[rgba(148,163,184,0.16)] text-foreground specular-top shadow-[0_24px_64px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-foreground">
            <RotateCcw className="size-4 text-zinc-400" aria-hidden="true" />
            Change quest days
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Based on the days you usually finish this quest.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border border-[rgba(148,163,184,0.14)] bg-[#181B24] p-4 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.06)]">
          <p className="text-sm font-semibold text-foreground">{proposal.questTitle}</p>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs sm:text-sm">
            <div className="text-center">
              <div className="text-foreground font-medium">{proposal.fromDayLabel}</div>
              <div className="text-muted-foreground font-mono text-xs tnum">
                {Math.round(proposal.fromDayRate * 100)}% finished
              </div>
            </div>
            <ArrowRight className="size-4 shrink-0 text-zinc-400" aria-hidden="true" />
            <div className="text-center">
              <div className="text-foreground font-medium">{proposal.toDayLabel}</div>
              <div className="text-muted-foreground font-mono text-xs tnum">
                {proposal.toDayRate >= 0 ? `~${Math.round(proposal.toDayRate * 100)}% usual` : "no history yet"}
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            You usually miss this on {proposal.fromDayLabel}. You finish a lot more on {proposal.toDayLabel}.
          </p>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-[rgba(148,163,184,0.12)] bg-[#181B24]/60 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-zinc-400" aria-hidden="true" />
          <p>
            To switch it, open Quests and change the days.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-2 mt-2">
          <Button
            variant="ghost"
            className="min-h-11 rounded-[16px] text-muted-foreground hover:text-foreground hover:bg-white/5 active:scale-[0.98]"
            onClick={() => onOpenChange(false)}
          >
            Not now
          </Button>
          <Button
            asChild
            className="min-h-11 rounded-[16px] bg-white text-black hover:bg-zinc-200 font-bold active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          >
            <Link to="/quests" onClick={() => onOpenChange(false)}>
              Go to Quests
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
