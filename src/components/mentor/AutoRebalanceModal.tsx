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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="size-4 text-primary" aria-hidden="true" />
            Change quest days
          </DialogTitle>
          <DialogDescription>
            Based on the days you usually finish this quest.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border bg-card/60 p-4">
          <p className="text-body-md font-medium text-foreground">{proposal.questTitle}</p>
          <div className="mt-3 flex items-center justify-center gap-3 text-body-sm">
            <div className="text-center">
              <div className="text-foreground">{proposal.fromDayLabel}</div>
              <div className="text-muted-foreground">
                {Math.round(proposal.fromDayRate * 100)}% finished
              </div>
            </div>
            <ArrowRight className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <div className="text-center">
              <div className="text-foreground">{proposal.toDayLabel}</div>
              <div className="text-muted-foreground">
                {proposal.toDayRate >= 0 ? `~${Math.round(proposal.toDayRate * 100)}% usual` : "no history yet"}
              </div>
            </div>
          </div>
          <p className="mt-3 text-body-sm text-muted-foreground">
            You usually miss this on {proposal.fromDayLabel}. You finish a lot more on {proposal.toDayLabel}.
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-body-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            To switch it, open Quests and change the days.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" className="min-h-11" onClick={() => onOpenChange(false)}>
            Not now
          </Button>
          <Button asChild className="min-h-11">
            <Link to="/quests" onClick={() => onOpenChange(false)}>
              Go to Quests
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
