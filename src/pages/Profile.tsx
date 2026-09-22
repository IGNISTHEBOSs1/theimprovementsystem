import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Pencil,
  Settings as SettingsIcon,
  Target,
  CheckCircle2,
  Flame,
  Compass,
  History,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IdentityAvatar } from "@/components/system-bar/IdentityAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { deriveFollowThroughStats, deriveCurrentStreak } from "@/lib/trajectory";

export default function Profile() {
  const { profile, updateProfile } = useAuth();
  const { state, todayStr } = useDashboardDataContext();
  const [editingGoal, setEditingGoal] = useState(false);
  const [goal, setGoal] = useState(profile?.primary_goal ?? "");
  const [targetDate, setTargetDate] = useState(profile?.primary_goal_target_date ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setGoal(profile?.primary_goal ?? "");
    setTargetDate(profile?.primary_goal_target_date ?? "");
  }, [profile?.primary_goal, profile?.primary_goal_target_date]);

  const startEditing = () => {
    setGoal(profile?.primary_goal ?? "");
    setTargetDate(profile?.primary_goal_target_date ?? "");
    setSaveError(false);
    setSaveSuccess(false);
    setEditingGoal(true);
  };

  const cancelEditing = () => {
    setGoal(profile?.primary_goal ?? "");
    setTargetDate(profile?.primary_goal_target_date ?? "");
    setSaveError(false);
    setEditingGoal(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaveError(false);
    setSaveSuccess(false);
    const trimmedGoal = goal.trim();
    const trimmedDate = targetDate.trim();
    const { error, profile: saved } = await updateProfile({
      primary_goal: trimmedGoal || null,
      primary_goal_target_date: trimmedDate || null,
    });
    setSaving(false);
    if (error || !saved) {
      setGoal(profile?.primary_goal ?? "");
      setTargetDate(profile?.primary_goal_target_date ?? "");
      setSaveError(true);
      return;
    }
    setGoal(saved.primary_goal ?? "");
    setTargetDate(saved.primary_goal_target_date ?? "");
    setSaveSuccess(true);
    setEditingGoal(false);
  };

  const safeQuests = Array.isArray(state?.quests) ? state.quests.filter(Boolean) : [];
  const followThrough = deriveFollowThroughStats(safeQuests);
  const completionRate =
    followThrough.total > 0
      ? Math.round((followThrough.completed / followThrough.total) * 100)
      : 0;

  const currentStreak = todayStr
    ? deriveCurrentStreak(safeQuests, todayStr, profile?.timezone || "UTC")
    : 0;

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-6 pb-6 sm:px-8 sm:py-10 space-y-6">
      {/* ── 1. Primary Goal Section (Important Comes First) ── */}
      <section
        className="rounded-2xl border border-border/80 bg-card p-6 shadow-[var(--shadow-card)]"
        aria-labelledby="primary-goal-heading"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-foreground" aria-hidden="true" />
            <h1
              id="primary-goal-heading"
              className="text-label text-foreground uppercase tracking-wider font-semibold"
            >
              Primary Goal
            </h1>
          </div>
          {profile?.primary_goal && !editingGoal && (
            <Link
              to="/journey"
              className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <span>Track on Path</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>

        {!editingGoal ? (
          profile?.primary_goal ? (
            <div className="mt-4">
              <p className="text-xl sm:text-2xl font-semibold leading-tight text-foreground">
                {profile.primary_goal}
              </p>
              {profile.primary_goal_target_date && (
                <p className="mt-2 text-body-sm text-muted-foreground flex items-center gap-1.5">
                  <span>Target Date:</span>
                  <span className="font-medium text-foreground">
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
                </p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-body-md text-muted-foreground">
              No goal set yet. Optional — Quests work fine without one, but a goal lets TIS connect
              your commitments to a direction.
            </p>
          )
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="goal-input"
                  className="text-body-sm font-medium text-foreground block mb-1.5"
                >
                  Goal
                </label>
                <Input
                  id="goal-input"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  placeholder="What are you working toward?"
                  aria-label="Primary goal"
                  disabled={saving}
                  autoFocus
                  className="min-h-11"
                />
              </div>
              <div>
                <label
                  htmlFor="target-date-input"
                  className="text-body-sm font-medium text-foreground block mb-1.5"
                >
                  Target date <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input
                  id="target-date-input"
                  type="date"
                  value={targetDate}
                  onChange={(event) => setTargetDate(event.target.value)}
                  aria-label="Goal target date"
                  disabled={saving}
                  className="min-h-11 w-full sm:w-64"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" className="min-h-11 shrink-0" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="min-h-11 shrink-0 text-muted-foreground"
                onClick={cancelEditing}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {saveError && (
          <p className="mt-3 text-body-sm text-muted-foreground" role="alert">
            That didn't go through. You can try again.
          </p>
        )}
        {saveSuccess && !saveError && !editingGoal && (
          <p className="mt-3 text-body-sm text-muted-foreground" role="status">
            Saved.
          </p>
        )}

        {!editingGoal && (
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-10 text-muted-foreground hover:text-foreground"
              onClick={startEditing}
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              {profile?.primary_goal ? "Edit Goal" : "Set Goal"}
            </Button>
          </div>
        )}
      </section>

      {/* ── 2. Standing & Performance Metrics (Bento Grid) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Metric 1: Follow-through rate */}
        <div className="p-4 rounded-xl border border-border/80 bg-card/60 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Completion Rate
            </span>
            <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-foreground">{completionRate}%</span>
            <span className="text-xs text-muted-foreground">
              ({followThrough.completed}/{followThrough.total})
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">All-time commitment reliability</p>
        </div>

        {/* Metric 2: Active streak */}
        <div className="p-4 rounded-xl border border-border/80 bg-card/60 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Streak</span>
            <Flame className="size-4 text-foreground" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-foreground">{currentStreak}</span>
            <span className="text-xs text-muted-foreground">
              {currentStreak === 1 ? "day" : "days"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Consecutive days in momentum</p>
        </div>

        {/* Metric 3: Quests honored */}
        <div className="p-4 rounded-xl border border-border/80 bg-card/60 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Quests Honored
            </span>
            <Compass className="size-4 text-foreground" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-foreground">
              {followThrough.completed}
            </span>
            <span className="text-xs text-muted-foreground">completed</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Tangible proof of execution</p>
        </div>
      </div>

      {/* ── 3. Personal Identity Cockpit Header ── */}
      <section
        aria-label="User identity"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-border/80 bg-card/60 shadow-[var(--shadow-card)]"
      >
        <div className="flex items-center gap-4">
          <IdentityAvatar
            username={profile?.username ?? ""}
            className="h-14 w-14 text-base font-bold border-2 border-border shadow-xs"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {profile?.username || "Operator"}
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border border-border bg-muted/60 text-muted-foreground">
                Operator Cockpit
              </span>
            </div>
            <p className="text-body-sm text-muted-foreground mt-0.5">
              Personal identity, trajectory momentum, and system settings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="min-h-10 gap-2 border-border/80 hover:bg-muted/50"
          >
            <Link to="/profile/settings">
              <SettingsIcon className="size-4 text-muted-foreground" aria-hidden="true" />
              <span>Settings</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* ── 4. Navigation Hub (Quest History & System Settings) ── */}
      <div className="space-y-3">
        <p className="text-caption text-muted-foreground uppercase tracking-wider font-semibold px-1">
          System & History
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Quest History Card */}
          <Link
            to="/profile/history"
            className="group flex items-center justify-between p-4 rounded-xl border border-border/80 bg-card/60 hover:bg-muted/40 hover:border-border transition-all shadow-xs"
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
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-medium">
                    {followThrough.completed} Done
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  Audit log of all completed and past quests.
                </p>
              </div>
            </div>
            <ChevronRight
              className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
              aria-hidden="true"
            />
          </Link>

          {/* System Settings Card */}
          <Link
            to="/profile/settings"
            className="group flex items-center justify-between p-4 rounded-xl border border-border/80 bg-card/60 hover:bg-muted/40 hover:border-border transition-all shadow-xs"
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
                  Theme, timezone, session, and data controls.
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
