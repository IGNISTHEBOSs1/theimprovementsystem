import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { TodaysCommitment } from "@/components/quests/TodaysCommitment";
import { QuestCard } from "@/components/quests/QuestCard";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { nextEligibleDayLabel, MAX_ACTIVE_QUESTS, type CadencePreset } from "@/hooks/useDashboardData";
import { getServerLocalDate, type ServerLocalDate } from "@/lib/serverTime";
import { PRIORITY_BADGE_CLASSES } from "@/lib/priority";
import type { Quest, QuestPriority } from "@/types/quest";

interface RecommitPrefill {
  title: string;
  priority: QuestPriority;
  linkedToGoal: boolean;
}

export default function Quests() {
  const { profile } = useAuth();
  const { state, loading, error, saving, activeQuests, completeQuest, cancelQuest, commitToTodaysQuest, reload } = useDashboardDataContext();
  const [commitError, setCommitError] = useState(false);
  const [completeError, setCompleteError] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(false);
  // Founder Decision (Quest defaults chunk): commitment is centered on an
  // explicit "+ New Commitment" entry point rather than an
  // always-visible form. Tapping it, typing, and tapping Commit is the
  // whole normal path — still well inside the 1-3 interaction budget.
  //
  // Founder Decision (Recovery/Guidance chunk): arriving here via a
  // Dashboard recommit action (see Dashboard.tsx handleRecommit) opens
  // the form pre-populated, rather than making the user retype a
  // commitment they already made once and just missed. history.state is
  // read once on mount and immediately replaced (see effect below) so a
  // browser back-navigation to this page doesn't silently re-prefill.
  const location = useLocation();
  const navigate = useNavigate();
  const [recommitPrefill] = useState<RecommitPrefill | undefined>(
    () => (location.state as { prefill?: RecommitPrefill } | null)?.prefill,
  );
  const [showCommitForm, setShowCommitForm] = useState(Boolean(recommitPrefill));

  useEffect(() => {
    if (recommitPrefill) {
      navigate(location.pathname, { replace: true, state: null });
    }
    // Intentionally runs once on mount only — consumes the navigation
    // state exactly once, regardless of later location/navigate identity
    // changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Server-authoritative "today", fetched once per page visit — used
  // only for the read-only Upcoming display below (which day a dormant
  // recurring series resumes on). The actual persisted expiry/
  // continuation decisions happen inside useDashboardData's load(), using
  // their own independently-fetched server time; this is a separate,
  // display-only fetch so Quests.tsx doesn't need to reach into that
  // internal state. Null while loading — the Upcoming section simply
  // doesn't render its date-dependent parts until this resolves.
  const [serverLocal, setServerLocal] = useState<ServerLocalDate | null>(null);
  useEffect(() => {
    let cancelled = false;
    getServerLocalDate(profile?.timezone).then((result) => {
      if (!cancelled) setServerLocal(result);
    });
    return () => { cancelled = true; };
  }, [profile?.timezone]);

  // Upcoming: recurring series whose most recent occurrence has already
  // resolved (completed or failed) and hasn't been re-created for today
  // yet — i.e. it's waiting for its next eligible day. This reads only
  // data that already exists (seriesId, recurrenceDays, createdAt); it
  // does not introduce a backlog of committable-but-inactive Quests, and
  // it never creates or activates anything itself — that stays entirely
  // in useDashboardData's load() sweep. Deliberately secondary: smaller,
  // muted, and rendered after the active Quest section, never before it.
  const seriesMap = new Map<string, Quest[]>();
  for (const quest of state.quests) {
    if (!quest.seriesId) continue;
    const existing = seriesMap.get(quest.seriesId) ?? [];
    existing.push(quest);
    seriesMap.set(quest.seriesId, existing);
  }
  const upcoming = serverLocal ? Array.from(seriesMap.values())
    .map((occurrences) => occurrences.reduce((a, b) => (a.createdAt > b.createdAt ? a : b)))
    .filter((mostRecent) =>
      (mostRecent.completed || mostRecent.failed) &&
      mostRecent.recurrenceDays &&
      mostRecent.recurrenceDays.length > 0 &&
      mostRecent.createdAt.split("T")[0] !== serverLocal.dateStr,
    ) : [];

  const handleCommit = async (commitment: string, linkedToGoal: boolean, cadence: CadencePreset, customDays: number[], priority: QuestPriority) => {
    setCommitError(false);
    const { error: commitErr } = await commitToTodaysQuest(
      commitment, linkedToGoal, cadence, customDays, priority,
      linkedToGoal ? profile?.primary_goal ?? undefined : undefined,
    );
    if (commitErr) {
      setCommitError(true);
    } else {
      setShowCommitForm(false);
    }
  };

  const handleComplete = async (questId: string) => {
    setCompleteError(false);
    const { error: completeErr } = await completeQuest(questId);
    if (completeErr) setCompleteError(true);
  };

  // Founder Decision (Cancel/abandon chunk): a native confirm() rather
  // than a custom dialog component — this app has no existing modal
  // primitive, and building one is UI surface this chunk doesn't
  // authorize. Cancellation is also irreversible (the Quest record is
  // removed, not marked), so a confirmation step matters even in its
  // simplest form.
  const handleCancel = async (questId: string) => {
    if (!window.confirm("Cancel this commitment? This can't be undone.")) return;
    setCancelError(false);
    setCancelling(true);
    const { error: cancelErr } = await cancelQuest(questId);
    setCancelling(false);
    if (cancelErr) setCancelError(true);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Your quests"
        title="All active quests."
        description="Every quest available to you right now, in one place."
      />

      <div className="mt-8">
        {loading ? (
          <div className="space-y-3" aria-label="Loading quests">
            <div className="h-20 animate-pulse rounded-2xl bg-muted" />
            <div className="h-20 animate-pulse rounded-2xl bg-muted" />
            <div className="h-20 animate-pulse rounded-2xl bg-muted" />
          </div>
        ) : error ? (
          // A failed load must never be treated as "no quests yet" — that
          // would risk the commitment form appearing on top of quests that
          // actually exist but couldn't be read, and a subsequent commit
          // overwriting them once the read eventually succeeds.
          <section
            className="rounded-2xl border border-border bg-card p-7"
            aria-label="Quests unavailable"
          >
            <p className="text-label text-muted-foreground">Your quests</p>
            <h2 className="mt-2 text-lg font-semibold text-foreground">
              We couldn't load your quests.
            </h2>
            <p className="mt-2 text-body-md text-muted-foreground">
              This is usually temporary. You can try again now.
            </p>
            <Button variant="neon" size="lg" className="mt-4" onClick={() => void reload()}>
              Try again
            </Button>
          </section>
        ) : (
          <>
            {activeQuests.length > 0 && (
              <div>
                <ul className="space-y-3">
                  {activeQuests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      completing={saving}
                      onComplete={handleComplete}
                      onCancel={handleCancel}
                      cancelling={cancelling}
                    />
                  ))}
                </ul>
                {completeError && (
                  <p className="mt-3 text-body-sm text-muted-foreground" role="alert">
                    That didn't go through. You can try again.
                  </p>
                )}
                {cancelError && (
                  <p className="mt-3 text-body-sm text-muted-foreground" role="alert">
                    That didn't go through. You can try again.
                  </p>
                )}
              </div>
            )}

            {/* Founder Decision (multi-active Quest chunk): up to
                MAX_ACTIVE_QUESTS Quests may be active at once. The option
                to add another commitment stays visible at all times — it's
                only disabled once the cap is reached, with the reason
                stated, rather than disappearing or gating on a single
                existing Quest as it previously did. */}
            <div className={activeQuests.length > 0 ? "mt-6" : undefined}>
              {showCommitForm ? (
                <>
                  <TodaysCommitment
                    committing={saving}
                    onCommit={handleCommit}
                    goalLabel={profile?.primary_goal ?? undefined}
                    initialValues={recommitPrefill}
                  />
                  {commitError && (
                    <p className="mt-3 text-body-sm text-muted-foreground" role="alert">
                      That didn't go through. You can try again.
                    </p>
                  )}
                </>
              ) : (
                <Button
                  size="lg"
                  className="min-h-11"
                  disabled={activeQuests.length >= MAX_ACTIVE_QUESTS}
                  onClick={() => setShowCommitForm(true)}
                  title={activeQuests.length >= MAX_ACTIVE_QUESTS ? `You can have up to ${MAX_ACTIVE_QUESTS} active quests at a time` : undefined}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  New Commitment
                </Button>
              )}
              {activeQuests.length >= MAX_ACTIVE_QUESTS && (
                <p className="mt-2 text-body-sm text-muted-foreground">
                  You've reached the limit of {MAX_ACTIVE_QUESTS} active quests. Complete one to add another.
                </p>
              )}
            </div>

            {upcoming.length > 0 && serverLocal && (
              <div className="mt-10">
                <p className="text-label text-muted-foreground">Upcoming</p>
                <ul className="mt-3 space-y-2">
                  {upcoming.map((quest) => (
                    <li
                      key={quest.seriesId}
                      className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-body-sm"
                    >
                      <Badge variant="outline" className={PRIORITY_BADGE_CLASSES[quest.priority]}>
                        {quest.priority}
                      </Badge>
                      <span className="text-foreground">{quest.title}</span>
                      <span className="text-muted-foreground">
                        — resumes {nextEligibleDayLabel(quest.recurrenceDays ?? [], serverLocal.weekday)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
