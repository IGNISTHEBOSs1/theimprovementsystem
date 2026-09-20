import React, { useState, useEffect } from "react";
import {
  Sparkles,
  HeartPulse,
  Circle,
  Send,
  Scroll,
  RotateCcw,
  Zap,
  Activity,
  Check,
  ShieldCheck,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Compass,
  Sprout,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { deriveGuidance } from "@/lib/guidance";
import { deriveInsights } from "@/lib/insights";
import { deriveTrajectory } from "@/lib/trajectory";
import { computeRebalanceProposal } from "@/lib/rebalance";
import { AutoRebalanceModal } from "@/components/mentor/AutoRebalanceModal";
import { triggerHaptic } from "@/lib/haptics";

interface AssignedQuest {
  id: string;
  title: string;
  category: string;
  standardTarget: string;
  halvedTarget: string;
  priority: "Essential" | "Important" | "Optional";
  isCompleted: boolean;
  isAutoHalved: boolean;
  isDbQuest?: boolean;
}

const DEFAULT_ARCHETYPE_QUESTS: AssignedQuest[] = [
  {
    id: "archetype-1",
    title: "Scriptorium Focus",
    category: "Intellect",
    standardTarget: "Read 20 pages of classical philosophy",
    halvedTarget: "Read 10 pages of classical philosophy",
    priority: "Essential",
    isCompleted: false,
    isAutoHalved: true,
  },
  {
    id: "archetype-2",
    title: "Martial Conditioning",
    category: "Stamina",
    standardTarget: "Run 5.0 km endurance tempo",
    halvedTarget: "Walk 2.5 km gentle restorative stroll",
    priority: "Important",
    isCompleted: false,
    isAutoHalved: true,
  },
  {
    id: "archetype-3",
    title: "Architectural Drafting",
    category: "Craft",
    standardTarget: "Deep Work: 90 mins core system refactor",
    halvedTarget: "Deep Work: 45 mins core system refactor",
    priority: "Essential",
    isCompleted: true,
    isAutoHalved: true,
  },
  {
    id: "archetype-4",
    title: "Vesper Contemplation",
    category: "Mindfulness",
    standardTarget: "20 minutes silent mindfulness meditation",
    halvedTarget: "10 minutes silent mindfulness meditation",
    priority: "Optional",
    isCompleted: false,
    isAutoHalved: false,
  },
];

const PRESET_REFLECTIONS: string[] = [
  "Fatigue is heavy; accepting the lighter pace today.",
  "Realigned and rested. Ready to accelerate tomorrow.",
  "Focus was sharp on essential tasks despite lower volume.",
];

function deriveTargets(title: string, priority: "Essential" | "Important" | "Optional") {
  const match = title.match(/(\d+(?:\.\d+)?)\s*(pages?|mins?|minutes?|km|reps?|hours?|hrs?)/i);
  if (match) {
    const val = parseFloat(match[1]);
    const unit = match[2];
    const halvedVal = val > 1 ? Math.round((val / 2) * 10) / 10 : val;
    return {
      standard: `${val} ${unit}`,
      halved: `${halvedVal} ${unit}`,
    };
  }

  if (priority === "Essential") {
    return {
      standard: "Full deep-focus execution (approx. 60–90m)",
      halved: "Calibrated micro-block (approx. 30–45m)",
    };
  }
  return {
    standard: "Complete standard habit reps",
    halved: "Half cadence / restorative pacing",
  };
}

export default function Mentor() {
  const { profile } = useAuth();
  const { state, loading, error, activeQuests, completeQuest, reload } = useDashboardDataContext();

  const [interventionActive, setInterventionActive] = useState<boolean>(true);
  const [reflectionText, setReflectionText] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [rebalanceOpen, setRebalanceOpen] = useState(false);
  const [showDossier, setShowDossier] = useState(false);

  // Initialize quests from active database quests or archetypes
  const [quests, setQuests] = useState<AssignedQuest[]>(() => {
    if (activeQuests && activeQuests.length > 0) {
      return activeQuests.map((q) => {
        const targets = deriveTargets(q.title, q.priority);
        return {
          id: q.id,
          title: q.title,
          category: q.linkedToGoal ? "Goal Alignment" : "Daily Cadence",
          standardTarget: targets.standard,
          halvedTarget: targets.halved,
          priority: q.priority,
          isCompleted: q.completed,
          isAutoHalved: true,
          isDbQuest: true,
        };
      });
    }
    return DEFAULT_ARCHETYPE_QUESTS;
  });

  // Keep quests in sync if activeQuests updates from backend
  useEffect(() => {
    if (activeQuests && activeQuests.length > 0) {
      setQuests(
        activeQuests.map((q) => {
          const targets = deriveTargets(q.title, q.priority);
          return {
            id: q.id,
            title: q.title,
            category: q.linkedToGoal ? "Goal Alignment" : "Daily Cadence",
            standardTarget: targets.standard,
            halvedTarget: targets.halved,
            priority: q.priority,
            isCompleted: q.completed,
            isAutoHalved: interventionActive,
            isDbQuest: true,
          };
        })
      );
    }
  }, [activeQuests, interventionActive]);

  // Telemetry signals from codebase analysis engines
  const guidance = state?.quests ? deriveGuidance(state.quests, profile?.timezone || "UTC") : [];
  const insights = state?.quests ? deriveInsights(state.quests) : [];
  const trajectory = state?.quests ? deriveTrajectory(state.quests) : { actual: [], currentPosition: 0 };
  const rebalanceProposal = state?.quests
    ? computeRebalanceProposal(state.quests, profile?.timezone || "UTC")
    : null;

  // Toggle global narrative intervention (Auto-halving)
  const handleToggleIntervention = () => {
    const nextState = !interventionActive;
    setInterventionActive(nextState);
    triggerHaptic(nextState ? "success" : "light");

    setQuests((prev) =>
      prev.map((q) => ({
        ...q,
        isAutoHalved: nextState,
      }))
    );

    if (nextState) {
      toast.success("Respite engaged: All daily commitments auto-halved to protect stamina.");
    } else {
      toast.info("Standard load restored: Quests returned to full capacity.");
    }
  };

  // Toggle individual quest auto-halving status
  const handleToggleIndividualHalving = (id: string) => {
    triggerHaptic("light");
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isAutoHalved: !q.isAutoHalved } : q))
    );
  };

  // Toggle completion of individual quest
  const handleToggleQuest = async (quest: AssignedQuest) => {
    triggerHaptic("success");
    const nextCompleted = !quest.isCompleted;

    setQuests((prev) =>
      prev.map((q) => (q.id === quest.id ? { ...q, isCompleted: nextCompleted } : q))
    );

    if (quest.isDbQuest && nextCompleted) {
      try {
        await completeQuest(quest.id);
        toast.success(`Cleared: "${quest.title}" logged to your trajectory!`);
      } catch {
        toast.error("Could not sync quest completion to server.");
      }
    } else if (nextCompleted) {
      toast.success(`Cleared: "${quest.title}"`);
    }
  };

  const handleReflectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText.trim()) return;

    triggerHaptic("success");
    setSubmitted(true);
    toast.success("Wayfinder reflection recorded. Arch-Mentor Ronald acknowledged your update.");
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="h-44 animate-pulse rounded-2xl border border-[#27272a] bg-[#18181b]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="rounded-2xl border border-[#27272a] bg-[#18181b] p-7 text-[#fafafa]">
          <p className="font-mono text-xs uppercase tracking-wider text-[#a1a1aa]">Mentor System</p>
          <h2 className="mt-2 text-lg font-semibold">Unable to establish connection to mentor chronicles.</h2>
          <p className="mt-1 text-sm text-[#a1a1aa]">Telemetry link experienced interference. Re-link now.</p>
          <button
            type="button"
            onClick={() => void reload()}
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl bg-[#7c66dc] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#654dc4]"
          >
            Reconnect
          </button>
        </section>
      </div>
    );
  }

  const completedCount = quests.filter((q) => q.isCompleted).length;
  const activeCount = quests.length;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] antialiased selection:bg-[#7c66dc]/30 selection:text-[#fafafa]">
      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* ── 1. HEADER / HERO SECTION ── */}
        <header className="relative overflow-hidden rounded-2xl border border-[#27272a] bg-[#18181b] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] sm:p-8">
          {/* Ambient top highlight */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7c66dc]/40 to-transparent"
            aria-hidden="true"
          />

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Mentor Identity */}
            <div className="flex items-start gap-4 sm:items-center">
              <div className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl border border-[#7c66dc]/40 bg-[#7c66dc]/10 shadow-[0_0_20px_rgba(124,102,220,0.2)]">
                <Scroll className="size-7 text-[#7c66dc]" aria-hidden="true" />
                <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#09090b] ring-2 ring-[#18181b]">
                  <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl font-bold tracking-tight text-[#fafafa] sm:text-2xl">
                    Arch-Mentor Ronald
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#7c66dc]/30 bg-[#7c66dc]/12 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#fafafa]">
                    <ShieldCheck className="size-3 text-[#7c66dc]" />
                    Trajectory Healer
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#a1a1aa]">
                  Specialty: Cognitive Ergonomics & Arcane Habit Calibration
                  {profile?.username ? ` • Guiding ${profile.username}` : ""}
                </p>
              </div>
            </div>

            {/* Current Narrative Status */}
            <div className="flex items-center gap-3 self-start rounded-xl border border-[#27272a] bg-[#09090b]/80 px-4 py-3 sm:self-auto">
              <Activity className="size-4 text-[#7c66dc]" aria-hidden="true" />
              <div className="text-left">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#a1a1aa]">
                  Current Narrative State
                </p>
                <p className="text-xs font-semibold text-[#fafafa]">
                  Chapter IV: The Shaded Sanctuary
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ── 2. THE NARRATIVE INTERVENTION (CORE ANTI-BURNOUT COMPONENT) ── */}
        <section
          aria-labelledby="intervention-heading"
          className="relative overflow-hidden rounded-2xl border border-[#7c66dc]/40 bg-[#18181b] p-6 shadow-[0_0_30px_rgba(124,102,220,0.08)] sm:p-7"
        >
          {/* Subtle Iris Ambient Glow */}
          <div
            className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[#7c66dc]/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#7c66dc]/30 bg-[#7c66dc]/12 text-[#7c66dc]">
                <HeartPulse className="size-5" aria-hidden="true" />
              </div>

              <div className="max-w-2xl space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#7c66dc]">
                    Narrative Trigger Active
                  </span>
                  <span className="rounded bg-[#27272a] px-2 py-0.5 text-[11px] font-medium text-[#a1a1aa]">
                    Workload: -50% Energy Conserved
                  </span>
                </div>

                <h2
                  id="intervention-heading"
                  className="text-lg font-bold text-[#fafafa]"
                >
                  &ldquo;The Monastic Healer Orders a Controlled Respite.&rdquo;
                </h2>

                <p className="text-sm leading-relaxed text-[#a1a1aa]">
                  We observed strain along your trajectory over recent cycles.
                  In accordance with the Stoic Wayfinder Accords, your daily habit targets have
                  been halved today to safeguard your cognitive stamina. Accept this respite&mdash;endurance
                  is cemented in deliberate recovery, not relentless attrition.
                </p>
              </div>
            </div>

            {/* High-Agency Action Button */}
            <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
              <button
                type="button"
                onClick={handleToggleIntervention}
                className={`relative inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-xs font-semibold tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7c66dc] focus:ring-offset-2 focus:ring-offset-[#09090b] ${
                  interventionActive
                    ? "bg-[#7c66dc] text-white shadow-[0_4px_16px_rgba(124,102,220,0.35)] hover:bg-[#654dc4]"
                    : "border border-[#27272a] bg-[#18181b] text-[#a1a1aa] hover:border-[#7c66dc]/50 hover:text-[#fafafa]"
                }`}
              >
                {interventionActive ? (
                  <>
                    <ShieldCheck className="size-4" aria-hidden="true" />
                    <span>Respite Engaged (50% Load)</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="size-4" aria-hidden="true" />
                    <span>Restore Standard Load</span>
                  </>
                )}
              </button>

              <span className="font-mono text-[11px] text-[#a1a1aa]/80">
                {interventionActive ? "Workload auto-halved" : "Standard intensity"}
              </span>
            </div>
          </div>
        </section>

        {/* ── 3. ASSIGNED QUESTS & MODIFIED STATES ── */}
        <section aria-labelledby="quests-heading" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 id="quests-heading" className="text-base font-bold text-[#fafafa]">
                Today&apos;s Calibrated Quests
              </h2>
              <p className="text-xs text-[#a1a1aa]">
                Habits modified under the active narrative protection directive.
              </p>
            </div>

            <div className="font-mono text-xs text-[#a1a1aa]">
              Progress:{" "}
              <span className="font-semibold text-[#fafafa]">
                {completedCount} of {activeCount} Cleared
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {quests.map((quest) => {
              const isModified = quest.isAutoHalved;

              return (
                <div
                  key={quest.id}
                  className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 sm:p-5 ${
                    quest.isCompleted
                      ? "border-[#27272a] bg-[#18181b]/50 opacity-75"
                      : isModified
                      ? "border-[#7c66dc]/40 bg-[#7c66dc]/[0.06] shadow-[0_4px_20px_rgba(124,102,220,0.06)]"
                      : "border-[#27272a] bg-[#18181b] hover:border-[#27272a]/80"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-[#27272a] bg-[#09090b] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#a1a1aa]">
                          {quest.category}
                        </span>

                        <span
                          className={`rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                            quest.priority === "Essential"
                              ? "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                              : "bg-[#27272a] text-[#a1a1aa]"
                          }`}
                        >
                          {quest.priority}
                        </span>
                      </div>

                      {/* Auto-halved pill badge */}
                      {isModified && (
                        <button
                          type="button"
                          onClick={() => handleToggleIndividualHalving(quest.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-[#7c66dc]/30 bg-[#7c66dc]/12 px-2 py-0.5 font-mono text-[10px] font-medium text-[#fafafa] transition-colors hover:bg-[#7c66dc]/25 focus:outline-none focus:ring-1 focus:ring-[#7c66dc]"
                          title="Click to toggle standard or halved intensity"
                        >
                          <Sparkles className="size-3 text-[#7c66dc]" aria-hidden="true" />
                          <span>-50% Halved</span>
                        </button>
                      )}
                    </div>

                    {/* Quest Title */}
                    <div>
                      <h3
                        className={`text-base font-semibold leading-tight ${
                          quest.isCompleted
                            ? "text-[#a1a1aa] line-through"
                            : "text-[#fafafa]"
                        }`}
                      >
                        {quest.title}
                      </h3>

                      {/* Target Specs with Strikethrough for Halved Habit */}
                      <div className="mt-2 space-y-1">
                        {isModified ? (
                          <>
                            <p className="text-xs text-[#a1a1aa]/60 line-through">
                              Target: {quest.standardTarget}
                            </p>
                            <p className="flex items-center gap-1.5 text-xs font-medium text-[#fafafa]">
                              <Zap className="size-3.5 shrink-0 text-[#7c66dc]" />
                              <span>Calibrated: {quest.halvedTarget}</span>
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-[#a1a1aa]">
                            Target: {quest.standardTarget}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Completion Action */}
                  <div className="mt-4 flex items-center justify-between border-t border-[#27272a]/60 pt-3">
                    <span className="text-[11px] text-[#a1a1aa]">
                      {quest.isCompleted ? "Marked as cleared" : "Tap to complete"}
                    </span>

                    <button
                      type="button"
                      onClick={() => void handleToggleQuest(quest)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#7c66dc] ${
                        quest.isCompleted
                          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : "border border-[#27272a] bg-[#09090b] text-[#fafafa] hover:border-[#7c66dc]/50 hover:bg-[#7c66dc]/10"
                      }`}
                    >
                      {quest.isCompleted ? (
                        <>
                          <Check className="size-3.5" aria-hidden="true" />
                          <span>Cleared</span>
                        </>
                      ) : (
                        <>
                          <Circle className="size-3.5 text-[#a1a1aa]" aria-hidden="true" />
                          <span>Complete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. QUICK REFLECTION & RE-ALIGNMENT ── */}
        <section
          aria-labelledby="reflection-heading"
          className="rounded-2xl border border-[#27272a] bg-[#18181b] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.3)] sm:p-7"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-[#7c66dc]" aria-hidden="true" />
            <h2 id="reflection-heading" className="text-base font-bold text-[#fafafa]">
              Wayfinder Reflection
            </h2>
          </div>
          <p className="mt-1 text-xs text-[#a1a1aa]">
            Send an assessment note or acknowledge today&apos;s workload intervention to Arch-Mentor Ronald.
          </p>

          {/* Quick preset response chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {PRESET_REFLECTIONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setReflectionText(preset)}
                className="rounded-lg border border-[#27272a] bg-[#09090b] px-3 py-1.5 text-xs text-[#a1a1aa] transition-all hover:border-[#7c66dc]/50 hover:bg-[#7c66dc]/10 hover:text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#7c66dc]"
              >
                &ldquo;{preset}&rdquo;
              </button>
            ))}
          </div>

          <form onSubmit={handleReflectionSubmit} className="mt-4 space-y-4">
            <div className="relative">
              <textarea
                rows={3}
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Log physical sensation, mental resistance, or express acknowledgment of the reduced load..."
                className="w-full resize-none rounded-xl border border-[#27272a] bg-[#09090b] p-3.5 text-sm text-[#fafafa] placeholder-[#a1a1aa]/50 transition-all focus:border-[#7c66dc] focus:outline-none focus:ring-2 focus:ring-[#7c66dc]/40"
              />
            </div>

            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-[11px] text-[#a1a1aa]">
                {submitted ? (
                  <span className="font-medium text-emerald-400">
                    ✓ Transmitted to Mentor journal. Calibration updated.
                  </span>
                ) : (
                  "Notes are preserved in your personal trajectory chronicle."
                )}
              </p>

              <button
                type="submit"
                disabled={!reflectionText.trim()}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#7c66dc] px-5 text-xs font-semibold text-white shadow-[0_2px_12px_rgba(124,102,220,0.3)] transition-all hover:bg-[#654dc4] focus:outline-none focus:ring-2 focus:ring-[#7c66dc] focus:ring-offset-2 focus:ring-offset-[#09090b] disabled:pointer-events-none disabled:opacity-40"
              >
                <Send className="size-3.5" aria-hidden="true" />
                <span>Transmit Reflection</span>
              </button>
            </div>
          </form>
        </section>

        {/* ── 5. INTEGRATED TELEMETRY DOSSIER (EXPANDABLE) ── */}
        {(guidance.length > 0 || insights.length > 0 || trajectory.actual.length > 0 || rebalanceProposal) && (
          <section className="rounded-2xl border border-[#27272a] bg-[#18181b]/70 p-5">
            <button
              type="button"
              onClick={() => setShowDossier((prev) => !prev)}
              className="flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] transition-colors hover:text-[#fafafa]"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-[#7c66dc]" aria-hidden="true" />
                <span>Wayfinder Analytical Telemetry & Historical Patterns</span>
              </div>
              {showDossier ? (
                <ChevronUp className="size-4 text-[#a1a1aa]" />
              ) : (
                <ChevronDown className="size-4 text-[#a1a1aa]" />
              )}
            </button>

            {showDossier && (
              <div className="mt-4 space-y-3 border-t border-[#27272a] pt-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {trajectory.actual.length > 0 && (
                    <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-4">
                      <div className="flex items-center gap-2">
                        <Compass className="size-4 text-[#7c66dc]" />
                        <span className="text-xs font-medium text-[#a1a1aa]">Trajectory Position</span>
                      </div>
                      <p className="mt-1 text-xl font-bold text-[#fafafa]">
                        {trajectory.currentPosition >= 0 ? "+" : ""}{trajectory.currentPosition}
                      </p>
                      <p className="mt-1 text-[11px] text-[#a1a1aa]">Derived from your actual resolve velocity.</p>
                    </div>
                  )}

                  {rebalanceProposal && (
                    <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RotateCcw className="size-4 text-[#7c66dc]" />
                          <span className="text-xs font-medium text-[#a1a1aa]">Rebalance Available</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRebalanceOpen(true)}
                          className="rounded-lg bg-[#7c66dc]/20 px-2.5 py-1 text-[11px] font-semibold text-[#fafafa] hover:bg-[#7c66dc]/30"
                        >
                          View Plan
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-[#fafafa]">{rebalanceProposal.questTitle}</p>
                      <p className="mt-1 text-[11px] text-[#a1a1aa]">
                        Shift from {rebalanceProposal.fromDayLabel} to {rebalanceProposal.toDayLabel} for higher historical adherence.
                      </p>
                    </div>
                  )}
                </div>

                {insights.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[#a1a1aa]">Active Insights</p>
                    {insights.slice(0, 2).map((item) => (
                      <div key={item.id} className="rounded-xl border border-[#27272a] bg-[#09090b] p-3">
                        <p className="text-xs font-semibold text-[#fafafa]">{item.observation}</p>
                        {item.evidence && <p className="mt-1 text-[11px] text-[#a1a1aa]">{item.evidence}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {guidance.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[#a1a1aa]">Heuristic Guidance</p>
                    {guidance.slice(0, 2).map((g) => (
                      <div key={g.id} className="flex items-start gap-2 rounded-xl border border-[#27272a] bg-[#09090b] p-3">
                        <Sprout className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
                        <p className="text-xs text-[#a1a1aa]">{g.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {rebalanceProposal && (
        <AutoRebalanceModal
          open={rebalanceOpen}
          onOpenChange={setRebalanceOpen}
          proposal={rebalanceProposal}
        />
      )}
    </div>
  );
}
