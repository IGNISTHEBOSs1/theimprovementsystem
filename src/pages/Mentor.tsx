import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, RotateCcw, Sparkles, ArrowRight, Pause, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { cn } from "@/lib/utils";
import { PlaceholderExperience } from "@/components/shared/PlaceholderExperience";
import { AutoRebalanceModal } from "@/components/mentor/AutoRebalanceModal";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { deriveGuidance } from "@/lib/guidance";
import { deriveInsights } from "@/lib/insights";
import { deriveGoalPace, deriveTrajectory } from "@/lib/trajectory";
import { computeRebalanceProposal } from "@/lib/rebalance";
import { TIS_SPRINGS } from "@/lib/motion-tokens";
import { toast } from "@/hooks/use-toast";
import { soundEngine } from "@/hooks/useSoundEffects";

const GUIDANCE_CATEGORY_LABELS: Record<string, string> = {
  "repeated-commitment": "Repeating habit",
  "weekday-miss-pattern": "Day pattern",
  "series-reliability": "Repeating quest",
  "goal-linkage-gap": "Goal link",
  "recovery-after-miss": "Bouncing back",
  "trajectory-position": "Direction",
  "priority-completion-pattern": "Priority",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: TIS_SPRINGS.settle,
  },
};

interface RankedItem {
  key: string;
  categoryLabel: string;
  observation: string;
  evidence?: string;
  interpretation?: string;
  adjustment: string;
  actionLabel: string;
  actionDestination?: string;
  onAction?: () => void;
  strength: number;
}

const MAX_SURFACED_INSIGHTS = 4;

export default function Mentor() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const {
    state,
    loading,
    error,
    reload,
    updateSeriesRecurrence,
    pauseSeries,
  } = useDashboardDataContext();

  const [rebalanceOpen, setRebalanceOpen] = useState(false);
  const [showAllDynamics, setShowAllDynamics] = useState(false);
  const [pausingSeriesId, setPausingSeriesId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-28 sm:px-8 sm:py-10">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" aria-label="Loading your mentor" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-28 sm:px-8 sm:py-10">
        <section className="rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-7" aria-label="Mentor unavailable">
          <p className="text-label text-muted-foreground">Mentor</p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">We couldn't load your history.</h2>
          <p className="mt-2 text-body-md text-muted-foreground">This is usually temporary. You can try again now.</p>
          <Button size="lg" onClick={() => void reload()} className="mt-4 min-h-11">
            Try again
          </Button>
        </section>
      </div>
    );
  }

  const safeQuests = Array.isArray(state?.quests) ? state.quests.filter(Boolean) : [];
  const guidance = deriveGuidance(safeQuests, profile?.timezone || "UTC");
  const insights = deriveInsights(safeQuests);
  const trajectory = deriveTrajectory(safeQuests, profile?.primary_goal);
  const pace = deriveGoalPace(safeQuests, profile?.primary_goal_target_date, undefined, profile?.primary_goal);

  const recurring = insights.find((i) => i.id === "recurring-friction");
  const momentum = insights.find((i) => i.id === "momentum");
  const recovery = guidance.find((g) => g.id === "recovery-after-miss");
  const rebalanceProposal = computeRebalanceProposal(safeQuests, profile?.timezone || "UTC");

  const currentHour = new Date().getHours();
  const isEvening = currentHour >= 18 || currentHour < 4;
  const leadWithRecovery = Boolean(recovery) && isEvening;

  const isRecurringHero = Boolean(recurring);
  const isRecoveryHero = !isRecurringHero && leadWithRecovery && Boolean(recovery);
  const isMomentumHero = !isRecurringHero && !isRecoveryHero && Boolean(momentum);
  const hasHero = isRecurringHero || isRecoveryHero || isMomentumHero;

  const usedInGrid = new Set(
    [
      isRecurringHero ? "insight-recurring-friction" : null,
      isRecurringHero ? "guidance-series-reliability" : null,
      isRecurringHero ? "guidance-repeated-commitment" : null,
      isRecoveryHero ? "guidance-recovery-after-miss" : null,
      isMomentumHero ? "insight-momentum" : null,
      insights.some((i) => i.id === "goal-alignment") ? "guidance-goal-linkage-gap" : null,
    ].filter(Boolean),
  );

  const getGuidanceDetails = (gId: string): { evidence: string; adjustment: string; actionLabel: string; actionDestination?: string; onAction?: () => void } => {
    switch (gId) {
      case "repeated-commitment":
        return {
          evidence: "Multiple separate one-shot commitments logged with the exact same title.",
          adjustment: "Convert this repeating commitment into a scheduled daily or weekly routine.",
          actionLabel: "Add Routine",
          actionDestination: "/quests",
        };
      case "weekday-miss-pattern":
        return {
          evidence: "Completion history shows failures concentrated on a specific weekday.",
          adjustment: "Rebalance your weekly routine schedule to avoid overload on friction-heavy days.",
          actionLabel: rebalanceProposal ? `Rebalance (${rebalanceProposal.fromDayLabel} → ${rebalanceProposal.toDayLabel})` : "Adjust Schedule",
          onAction: rebalanceProposal ? () => setRebalanceOpen(true) : undefined,
          actionDestination: rebalanceProposal ? undefined : "/quests",
        };
      case "series-reliability":
        return {
          evidence: "This routine completes at a rate significantly below your baseline.",
          adjustment: "Reduce frequency or pause this routine to protect your trajectory buffer.",
          actionLabel: rebalanceProposal ? "Rebalance Routine" : "Manage Routines",
          onAction: rebalanceProposal ? () => setRebalanceOpen(true) : undefined,
          actionDestination: rebalanceProposal ? undefined : "/quests",
        };
      case "goal-linkage-gap":
        return {
          evidence: "Completion rates between goal-linked commitments and unlinked tasks diverge noticeably.",
          adjustment: "Review your North Star goal and link all daily commitments to your primary objective.",
          actionLabel: "Review North Star",
          actionDestination: "/profile",
        };
      case "recovery-after-miss":
        return {
          evidence: "A missed commitment was followed by another miss, indicating avoidance friction.",
          adjustment: "Commit to one manageable primary focus today to rebuild deterministic momentum.",
          actionLabel: "Commit to Focus",
          actionDestination: "/quests",
        };
      case "trajectory-position":
        return {
          evidence: "Completions have fallen below the lower boundary of the ±10% buffer corridor.",
          adjustment: "Complete your anchor commitments this week to restore nominal velocity.",
          actionLabel: "View Trajectory",
          actionDestination: "/journey",
        };
      case "priority-completion-pattern":
        return {
          evidence: "Significant variance in follow-through across different commitment priorities.",
          adjustment: "Focus execution strictly on your single primary focus before routine commitments.",
          actionLabel: "Focus Commitments",
          actionDestination: "/quests",
        };
      default:
        return {
          evidence: "Verified from your logged commitment timestamps.",
          adjustment: "Anchor this habit to a consistent daily trigger.",
          actionLabel: "Adjust in Quests",
          actionDestination: "/quests",
        };
    }
  };

  const getInsightAction = (i: typeof insights[0]): { actionLabel: string; actionDestination?: string; onAction?: () => void } => {
    switch (i.category) {
      case "recurring-friction":
        return {
          actionLabel: rebalanceProposal ? `Rebalance (${rebalanceProposal.fromDayLabel} → ${rebalanceProposal.toDayLabel})` : "Manage Routines",
          onAction: rebalanceProposal ? () => setRebalanceOpen(true) : undefined,
          actionDestination: rebalanceProposal ? undefined : "/quests",
        };
      case "goal-alignment":
        return {
          actionLabel: "Review North Star",
          actionDestination: "/profile",
        };
      case "momentum":
        return {
          actionLabel: "View Trajectory",
          actionDestination: "/journey",
        };
      case "follow-through":
      default:
        return {
          actionLabel: "Commit to Focus",
          actionDestination: "/quests",
        };
    }
  };

  const pool: RankedItem[] = [
    ...guidance.map((g): RankedItem => {
      const details = getGuidanceDetails(g.id);
      return {
        key: `guidance-${g.id}`,
        categoryLabel: GUIDANCE_CATEGORY_LABELS[g.id] ?? "Pattern",
        observation: g.text,
        evidence: details.evidence,
        adjustment: details.adjustment,
        actionLabel: details.actionLabel,
        actionDestination: details.actionDestination,
        onAction: details.onAction,
        strength: g.strength,
      };
    }),
    ...insights.map((i): RankedItem => {
      const action = getInsightAction(i);
      return {
        key: `insight-${i.id}`,
        categoryLabel: i.categoryLabel,
        observation: i.observation,
        evidence: i.evidence,
        interpretation: i.interpretation,
        adjustment: i.adjustment || "Maintain consistent execution within your buffer.",
        actionLabel: action.actionLabel,
        actionDestination: action.actionDestination,
        onAction: action.onAction,
        strength: i.strength,
      };
    }),
  ].filter((item) => !usedInGrid.has(item.key));

  const surfaced = [...pool].sort((a, b) => b.strength - a.strength).slice(0, MAX_SURFACED_INSIGHTS);

  if (!hasHero && surfaced.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-28 sm:px-8 sm:py-10">
        <PlaceholderExperience
          icon={MessageSquare}
          title="No clear behavioral pattern yet."
          message="As you complete and miss more commitments, your mentor will diagnose friction and propose actionable adjustments."
        />
      </div>
    );
  }

  const handleApplyProposal = async (seriesId: string, targetDays: number[]) => {
    soundEngine.playConfirmation();
    const { error: err } = await updateSeriesRecurrence(seriesId, targetDays);
    if (err) {
      toast({
        title: "Could not update routine days",
        description: "Please try again.",
        variant: "destructive",
      });
      throw err;
    } else {
      toast({
        title: "Routine schedule updated",
        description: "Successfully rebalanced your routine cadence.",
      });
    }
  };

  const handlePauseRoutine = async (seriesId: string) => {
    setPausingSeriesId(seriesId);
    soundEngine.playTap();
    const { error: err } = await pauseSeries(seriesId);
    setPausingSeriesId(null);
    if (err) {
      toast({
        title: "Could not pause routine",
        description: "Please try again.",
        variant: "destructive",
      });
      throw err;
    } else {
      toast({
        title: "Routine paused",
        description: "Paused this recurring routine for the current cycle.",
      });
    }
  };

  const visibleDynamics = showAllDynamics ? surfaced : surfaced.slice(0, 3);

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : containerVariants}
      initial={shouldReduceMotion ? false : "hidden"}
      animate="visible"
      className="mx-auto w-full max-w-4xl px-4 py-6 pb-28 sm:px-8 sm:py-10"
    >
      <PageHeader
        eyebrow="Behavioral Diagnostics"
        title="Your mentor."
        description="Deterministic behavioral observations paired with immediate treatments to eliminate friction."
      />

      {/* ── 1. PRIMARY ADVISORY DIAGNOSIS (THE HERO ACTION ENGINE) ── */}
      {hasHero && (
        <motion.div variants={shouldReduceMotion ? undefined : itemVariants} className="mt-6">
          {recurring && (
            <section
              aria-labelledby="primary-insight-heading"
              className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] space-y-4"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block font-semibold">
                  DIAGNOSIS · RECURRING FRICTION
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  Action Engine
                </span>
              </div>

              {/* 1. Observation */}
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-primary font-semibold block mb-1">
                  1. Observation
                </span>
                <h2
                  id="primary-insight-heading"
                  className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-snug"
                >
                  {recurring.observation}
                </h2>
              </div>

              {/* 2. Evidence */}
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold block mb-1">
                  2. Evidence
                </span>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {recurring.evidence}
                </p>
              </div>

              {/* 3. Recommendation */}
              {recurring.adjustment && (
                <div className="rounded-xl bg-muted/40 p-4 border border-border/60 text-xs sm:text-sm">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-foreground font-semibold block mb-1">
                    3. Recommended Adjustment
                  </span>
                  <p className="text-foreground/90 leading-relaxed font-medium">
                    {recurring.adjustment}
                  </p>
                </div>
              )}

              {/* 4. Action Treatment Controls */}
              <div className="pt-2 border-t border-border/50">
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold block mb-2.5">
                  4. Apply Treatment
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  {rebalanceProposal ? (
                    <>
                      <Button
                        size="sm"
                        className="min-h-10 px-4 text-xs font-semibold gap-1.5"
                        onClick={() => setRebalanceOpen(true)}
                      >
                        <RotateCcw className="size-3.5" aria-hidden="true" />
                        <span>Move from {rebalanceProposal.fromDayLabel} to {rebalanceProposal.toDayLabel}</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pausingSeriesId === rebalanceProposal.seriesId}
                        onClick={() => void handlePauseRoutine(rebalanceProposal.seriesId)}
                        className="min-h-10 px-4 text-xs font-medium gap-1.5"
                      >
                        <Pause className="size-3.5" aria-hidden="true" />
                        <span>{pausingSeriesId === rebalanceProposal.seriesId ? "Pausing…" : "Pause Routine"}</span>
                      </Button>
                    </>
                  ) : (
                    <Button asChild size="sm" className="min-h-10 px-4 text-xs font-semibold">
                      <Link to="/quests">Manage repeating routines →</Link>
                    </Button>
                  )}
                </div>
              </div>
            </section>
          )}

          {isRecoveryHero && recovery && (
            <section
              aria-labelledby="primary-insight-heading"
              className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-primary">
                  DIAGNOSIS · BOUNCING BACK
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-primary font-semibold block mb-1">
                  1. Observation
                </span>
                <h2 id="primary-insight-heading" className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-snug">
                  {recovery.text}
                </h2>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold block mb-1">
                  2. Evidence
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A missed commitment creates friction only when followed by avoidance. Immediate resumption restores mathematical velocity within the buffer.
                </p>
              </div>

              <div className="rounded-xl bg-muted/40 p-3.5 border border-border/60 text-xs">
                <span className="text-[10px] uppercase font-mono tracking-wider text-foreground font-semibold block mb-1">
                  3. Recommended Adjustment
                </span>
                <p className="text-foreground/90 font-medium">
                  Commit to one clear, manageable primary focus for today to lock momentum.
                </p>
              </div>

              <div className="pt-2 border-t border-border/50">
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold block mb-2">
                  4. Action
                </span>
                <Button
                  size="sm"
                  className="min-h-10 px-4 text-xs font-semibold"
                  onClick={() => {
                    soundEngine.playTap();
                    navigate("/quests");
                  }}
                >
                  Commit to Today's Focus →
                </Button>
              </div>
            </section>
          )}

          {isMomentumHero && momentum && (
            <section
              aria-labelledby="primary-insight-heading"
              className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-500">
                  DIAGNOSIS · MOMENTUM ACCELERATION
                </span>
                {momentum.comparison && (
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    +{Math.round(momentum.comparison.delta * 100)}% shift
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-500 font-semibold block mb-1">
                  1. Observation
                </span>
                <h2 id="primary-insight-heading" className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-snug">
                  {momentum.observation}
                </h2>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold block mb-1">
                  2. Evidence
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {momentum.evidence}
                </p>
              </div>

              <div className="rounded-xl bg-muted/40 p-3.5 border border-border/60 text-xs">
                <span className="text-[10px] uppercase font-mono tracking-wider text-foreground font-semibold block mb-1">
                  3. Recommended Adjustment
                </span>
                <p className="text-foreground/90 font-medium">
                  {momentum.adjustment || "Maintain your current cadence within the ±10% buffer zone without overextending."}
                </p>
              </div>

              <div className="pt-2 border-t border-border/50">
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold block mb-2">
                  4. Action
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-10 px-4 text-xs font-medium"
                  onClick={() => {
                    soundEngine.playTap();
                    navigate("/journey");
                  }}
                >
                  Verify on Journey Path →
                </Button>
              </div>
            </section>
          )}
        </motion.div>
      )}

      {/* ── 2. BEHAVIORAL PATTERN LEDGER (STRUCTURED OBSERVATION -> ACTION) ── */}
      {surfaced.length > 0 && (
        <motion.div
          variants={shouldReduceMotion ? undefined : itemVariants}
          className="mt-7 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card overflow-hidden shadow-[var(--shadow-card)]"
        >
          <div className="px-5 sm:px-6 py-4 bg-muted/20 border-b border-border/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
              Pattern Ledger & Actionable Adjustments
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {surfaced.length} signals
            </span>
          </div>

          <div className="divide-y divide-border/40">
            {visibleDynamics.map((item) => (
              <div key={item.key} className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold font-mono text-primary uppercase">
                    {item.categoryLabel}
                  </span>
                  {item.evidence && (
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Evidence verified
                    </span>
                  )}
                </div>

                {/* 1. Observation */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-0.5">
                    Observation
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-foreground leading-snug">
                    {item.observation}
                  </p>
                </div>

                {/* 2. Evidence */}
                {item.evidence && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Evidence: </span>
                    {item.evidence}
                  </p>
                )}

                {/* 3 & 4. Recommendation + Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/40 text-xs">
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-primary">Recommendation: </span>
                    <span className="text-foreground/90 font-medium">
                      {item.adjustment || "Maintain consistent execution on scheduled days."}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      soundEngine.playTap();
                      if (item.onAction) {
                        item.onAction();
                      } else if (item.actionDestination) {
                        navigate(item.actionDestination);
                      }
                    }}
                    className="h-8 px-3 text-xs shrink-0 self-start sm:self-auto gap-1 font-medium"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {surfaced.length > 3 && (
            <div className="p-3 border-t border-border/40 text-center bg-muted/10">
              <button
                type="button"
                onClick={() => setShowAllDynamics((prev) => !prev)}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                {showAllDynamics ? "Show fewer patterns" : "Show all patterns"}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {rebalanceProposal && (
        <AutoRebalanceModal
          open={rebalanceOpen}
          onOpenChange={setRebalanceOpen}
          proposal={rebalanceProposal}
          onApplyProposal={handleApplyProposal}
          onPauseRoutine={handlePauseRoutine}
        />
      )}
    </motion.div>
  );
}
