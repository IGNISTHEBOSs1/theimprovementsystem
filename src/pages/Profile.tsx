import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Pencil,
  Settings as SettingsIcon,
  Target,
  CheckCircle2,
  History,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { IdentityAvatar } from "@/components/system-bar/IdentityAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import {
  deriveFollowThroughStats,
  deriveFollowThroughRate,
  deriveGoalStats,
  deriveGoalPace,
  isLinkedToActiveGoal,
} from "@/lib/trajectory";

export default function Profile() {
  const { profile, updateProfile } = useAuth();
  const { state, todayStr } = useDashboardDataContext();
  const { playTap, playSuccess, playError } = useSoundEffects();
  const [editingGoal, setEditingGoal] = useState(false);
  const [goal, setGoal] = useState(profile?.primary_goal ?? "");
  const [targetDate, setTargetDate] = useState(profile?.primary_goal_target_date ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  // Fix 5: count of quests that would be detached on a goal rename — drives warning
  const [goalRenameWarning, setGoalRenameWarning] = useState<number | null>(null);

  useEffect(() => {
    setGoal(profile?.primary_goal ?? "");
    setTargetDate(profile?.primary_goal_target_date ?? "");
  }, [profile?.primary_goal, profile?.primary_goal_target_date]);

  const startEditing = () => {
    playTap();
    setGoal(profile?.primary_goal ?? "");
    setTargetDate(profile?.primary_goal_target_date ?? "");
    setSaveError(false);
    setSaveSuccess(false);
    setEditingGoal(true);
  };

  const cancelEditing = () => {
    playTap();
    setGoal(profile?.primary_goal ?? "");
    setTargetDate(profile?.primary_goal_target_date ?? "");
    setSaveError(false);
    setGoalRenameWarning(null);
    setEditingGoal(false);
  };

  const safeQuests = Array.isArray(state?.quests) ? state.quests.filter(Boolean) : [];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaveError(false);
    setSaveSuccess(false);

    const trimmedGoal = goal.trim();
    const trimmedDate = targetDate.trim();
    const existingGoal = profile?.primary_goal ?? "";
    const isRename =
      trimmedGoal.length > 0 &&
      existingGoal.length > 0 &&
      trimmedGoal.toLowerCase() !== existingGoal.toLowerCase();

    // Fix 5: Before saving a rename, count linked quests that will be silently
    // detached from trajectory. First submit shows the warning; second confirms.
    if (isRename && goalRenameWarning === null) {
      const detachedCount = safeQuests.filter(
        (q) => isLinkedToActiveGoal(q, existingGoal)
      ).length;
      if (detachedCount > 0) {
        setGoalRenameWarning(detachedCount);
        return;
      }
    }

    setGoalRenameWarning(null);
    setSaving(true);

    const { error, profile: saved } = await updateProfile({
      primary_goal: trimmedGoal || null,
      primary_goal_target_date: trimmedDate || null,
    });
    setSaving(false);
    if (error || !saved) {
      setGoal(profile?.primary_goal ?? "");
      setTargetDate(profile?.primary_goal_target_date ?? "");
      setSaveError(true);
      playError();
      return;
    }
    setGoal(saved.primary_goal ?? "");
    setTargetDate(saved.primary_goal_target_date ?? "");
    setSaveSuccess(true);
    playSuccess();
    setEditingGoal(false);
  };

  const setDaysFromToday = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setTargetDate(d.toISOString().split("T")[0]);
    playTap();
  };

  const followThrough = deriveFollowThroughStats(safeQuests);
  const overallFollowThroughRate = deriveFollowThroughRate(safeQuests);
  const goalStats = deriveGoalStats(safeQuests, profile?.primary_goal);
  const goalCompletionRate =
    goalStats.linked > 0
      ? Math.round((goalStats.completed / goalStats.linked) * 100)
      : 0;

  // Fix 9: Replace independent Date.now() calculation with deriveGoalPace.
  // Previously Profile and Journey could show different daysRemaining values for
  // the same user when horizonExtensionDays > 0 — the buffer-slip extension was
  // applied in Journey but not in Profile. Single source of truth now.
  const profilePace = profile?.primary_goal
    ? deriveGoalPace(safeQuests, profile.primary_goal_target_date ?? null, undefined, profile.primary_goal)
    : null;
  const daysRemaining = profilePace?.daysRemaining ?? null;

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-6 pb-28 sm:px-8 sm:py-10 space-y-6">
      <PageHeader
        eyebrow="Profile"
        title="Operator profile."
        description="Identity, North Star horizon, and historical audit ledger."
      />

      {/* ── 1. Operator Identity & Command Header ── */}
      <section
        aria-label="Operator Profile Card"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card shadow-[var(--shadow-card)]"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <IdentityAvatar
              username={profile?.username ?? ""}
              className="size-14 text-base font-bold border-2 border-border shadow-xs"
            />
            <span
              className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-500 border-2 border-background"
              title="Operator Active"
              aria-label="Operator Active"
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {profile?.username || "Operator"}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
              <span>Timezone: {profile?.timezone || "UTC"}</span>
              <span>•</span>
              <span className="text-emerald-500 font-medium">Trajectory Active</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="min-h-10 rounded-xl gap-2 border-border/80 hover:bg-muted/50 px-4 text-xs font-medium"
          >
            <Link to="/profile/settings">
              <SettingsIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
              <span>Settings</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* ── 2. The North Star Mission Spotlight ── */}
      <section
        className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-6 sm:p-7 shadow-[var(--shadow-card)] relative overflow-hidden"
        aria-labelledby="primary-goal-heading"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 flex items-center gap-2">
            <div className="size-7 rounded-lg border border-border/80 bg-background flex items-center justify-center text-primary shadow-xs shrink-0">
              <Target className="size-3.5" aria-hidden="true" />
            </div>
            <span
              id="primary-goal-heading"
              className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground block truncate"
            >
              Primary Goal · North Star
            </span>
          </div>

          {profile?.primary_goal && !editingGoal && (
            <div className="shrink-0 whitespace-nowrap text-xs flex items-center gap-2">
              <Link
                to="/journey"
                className="font-semibold text-primary hover:underline flex items-center gap-1 transition-colors"
              >
                <span>Track on Path</span>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>

        {!editingGoal ? (
          profile?.primary_goal ? (
            <div className="mt-4 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                {profile.primary_goal}
              </h2>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {profile.primary_goal_target_date && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border border-border/80 bg-background/80 text-foreground">
                    <Calendar className="size-3 text-muted-foreground" aria-hidden="true" />
                    <span>
                      Target:{" "}
                      {new Date(
                        profile.primary_goal_target_date.includes("T")
                          ? profile.primary_goal_target_date
                          : `${profile.primary_goal_target_date}T12:00:00`
                      ).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {daysRemaining !== null && (
                      <span className="text-muted-foreground">
                        ({daysRemaining === 0 ? "Today" : `${daysRemaining}d left`})
                      </span>
                    )}
                  </span>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-full text-xs text-muted-foreground hover:text-foreground gap-1.5 px-3"
                  onClick={startEditing}
                >
                  <Pencil className="size-3" aria-hidden="true" />
                  <span>Edit Goal</span>
                </Button>
              </div>

              {/* Goal Evidence */}
              <div className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" aria-hidden="true" />
                  <span>
                    <strong className="text-foreground font-semibold font-mono">{goalStats.completed}</strong> verified {goalStats.completed === 1 ? "anchor" : "anchors"} completed toward this goal
                    {goalStats.linked > 0 && (
                      <span className="font-mono text-muted-foreground ml-1">
                        ({goalCompletionRate}% goal commitment rate · {goalStats.completed}/{goalStats.linked})
                      </span>
                    )}
                  </span>
                </div>
                <Link
                  to="/profile/history"
                  className="font-medium text-xs text-primary hover:underline flex items-center gap-1 transition-colors"
                >
                  <span>View audit log</span>
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                No North Star goal set yet. Setting a primary milestone links your daily commitments to a long-term trajectory.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl min-h-10 text-xs font-medium gap-1.5"
                onClick={startEditing}
              >
                <Target className="size-3.5 text-primary" aria-hidden="true" />
                <span>Set Your Primary Goal</span>
              </Button>
            </div>
          )
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-5 space-y-4"
            onKeyDown={(e) => {
              if (e.key === "Escape" && !saving) {
                e.preventDefault();
                cancelEditing();
              }
            }}
          >
            <div className="space-y-3.5">
              <div>
                <label
                  htmlFor="goal-input"
                  className="text-xs font-medium text-foreground block mb-1.5"
                >
                  What is your primary focus or milestone?
                </label>
                <Input
                  id="goal-input"
                  name="goal"
                  autoComplete="off"
                  value={goal}
                  onChange={(event) => {
                    setGoal(event.target.value);
                    if (goalRenameWarning !== null) setGoalRenameWarning(null);
                  }}
                  placeholder="e.g. Master system architecture & ship production MVP"
                  aria-label="Primary goal"
                  disabled={saving}
                  autoFocus
                  className="min-h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="target-date-input"
                  className="text-xs font-medium text-foreground block"
                >
                  Target milestone date <span className="text-muted-foreground font-normal">(optional)</span>
                </label>

                {/* 1-Tap Horizon Presets */}
                <div className="flex flex-wrap gap-2 pt-0.5 pb-1">
                  <button
                    type="button"
                    onClick={() => setDaysFromToday(90)}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 hover:bg-primary/15 px-3 py-1 font-mono text-xs text-primary transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span>★ Lock 90-Day Horizon (Recommended)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDaysFromToday(60)}
                    disabled={saving}
                    className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/40 hover:bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground hover:text-foreground transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span>60-Day Sprint</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDaysFromToday(30)}
                    disabled={saving}
                    className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/40 hover:bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground hover:text-foreground transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span>30-Day Calibration</span>
                  </button>
                </div>

                <Input
                  id="target-date-input"
                  name="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(event) => setTargetDate(event.target.value)}
                  aria-label="Goal target date"
                  disabled={saving}
                  className="min-h-11 rounded-xl w-full sm:w-64 font-mono text-xs"
                />
              </div>
            </div>
            {/* Fix 5: Rename detachment warning — shown on first Save when the
                new name would silently drop linked quests from trajectory.
                Second Save click confirms and proceeds. */}
            {goalRenameWarning !== null && goalRenameWarning > 0 && (
              <div
                className="rounded-xl border border-amber-500/30 bg-amber-500/[0.08] px-3.5 py-2.5 text-xs text-amber-700 dark:text-amber-400"
                role="alert"
              >
                <span className="font-semibold">Heads up:</span> Renaming your goal will detach{" "}
                <span className="font-mono font-bold">{goalRenameWarning}</span> linked quest
                {goalRenameWarning === 1 ? "" : "s"} from your trajectory — those anchors will
                no longer count toward your progress. Click Save again to confirm, or Cancel to
                keep the current name.
              </div>
            )}

            <div className="flex gap-2.5 pt-1">
              <Button type="submit" className="min-h-10 rounded-xl px-5 text-xs font-semibold" disabled={saving}>
                {saving ? "Saving…" : goalRenameWarning !== null ? "Confirm Rename" : "Save Goal"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="min-h-10 rounded-xl text-xs text-muted-foreground"
                onClick={cancelEditing}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {saveError && (
          <p className="mt-3 text-xs text-destructive" role="alert">
            Unable to update goal. Please try again.
          </p>
        )}
        {saveSuccess && !saveError && !editingGoal && (
          <p className="mt-3 text-xs text-emerald-500 font-medium" role="status">
            ✓ Goal updated successfully.
          </p>
        )}
      </section>

      {/* ── 3. Operations & Audit Ledger ── */}
      <div className="space-y-3">
        <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
          Operations & Audit Ledger
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Quest History Entry */}
          <Link
            to="/profile/history"
            className="group flex items-center justify-between p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card hover:bg-muted/40 transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="size-10 rounded-xl border border-border bg-background flex items-center justify-center shrink-0 group-hover:border-foreground/40 transition-colors">
                <History
                  className="size-4 text-muted-foreground group-hover:text-foreground transition-colors"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground group-hover:underline">
                    Quest History
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-semibold">
                    {overallFollowThroughRate !== null ? `${overallFollowThroughRate}% Follow-Through · ` : ""}{followThrough.completed} Done
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  Chronological audit log of all completed quests.
                </p>
              </div>
            </div>
            <ChevronRight
              className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
              aria-hidden="true"
            />
          </Link>

          {/* System Settings Entry */}
          <Link
            to="/profile/settings"
            className="group flex items-center justify-between p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card hover:bg-muted/40 transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="size-10 rounded-xl border border-border bg-background flex items-center justify-center shrink-0 group-hover:border-foreground/40 transition-colors">
                <SettingsIcon
                  className="size-4 text-muted-foreground group-hover:text-foreground transition-colors"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground group-hover:underline">
                    System Settings
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  Theme mode, audio feedback, timezone calibration, and data privacy.
                </p>
              </div>
            </div>
            <ChevronRight
              className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
