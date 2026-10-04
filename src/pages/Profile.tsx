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
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IdentityAvatar } from "@/components/system-bar/IdentityAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { deriveFollowThroughStats, deriveCurrentStreak } from "@/lib/trajectory";

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
      playError();
      return;
    }
    setGoal(saved.primary_goal ?? "");
    setTargetDate(saved.primary_goal_target_date ?? "");
    setSaveSuccess(true);
    playSuccess();
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
  const daysRemaining = profile?.primary_goal_target_date
    ? Math.max(
        0,
        Math.ceil(
          (new Date(
            profile.primary_goal_target_date.includes("T")
              ? profile.primary_goal_target_date
              : `${profile.primary_goal_target_date}T23:59:59`
          ).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-6 pb-24 sm:px-8 sm:py-10 space-y-6">
      {/* ── 1. Operator Identity & Command Header ── */}
      <header
        aria-label="Operator Profile Header"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 rounded-[28px] border border-white/10 bg-[#12141A] shadow-xl specular-top"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <IdentityAvatar
              username={profile?.username ?? ""}
              className="size-14 text-base font-bold border-2 border-white/10 shadow-sm"
            />
            <span
              className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-white border-2 border-[#12141A] shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              title="Operator Active"
              aria-label="Operator Active"
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans">
                {profile?.username || "Operator"}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border border-white/10 bg-[#181B24] text-foreground">
                Operator Cockpit
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
              <span>Timezone: {profile?.timezone || "UTC"}</span>
              <span>•</span>
              <span className="text-white font-medium">Trajectory Active</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="min-h-10 rounded-[14px] gap-2 border-white/10 bg-[#181B24] hover:bg-white/5 px-4 text-xs font-medium active:scale-[0.98]"
          >
            <Link to="/profile/settings">
              <SettingsIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
              <span>Settings</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* ── 2. The North Star Mission Spotlight ── */}
      <section
        className="rounded-[28px] border border-white/10 bg-[#12141A] p-6 sm:p-7 shadow-xl specular-top relative overflow-hidden"
        aria-labelledby="primary-goal-heading"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl border border-white/10 bg-[#181B24] flex items-center justify-center text-white shadow-xs">
              <Target className="size-4" aria-hidden="true" />
            </div>
            <span
              id="primary-goal-heading"
              className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              Primary Goal · North Star
            </span>
          </div>

          {profile?.primary_goal && !editingGoal && (
            <div className="flex items-center gap-2">
              <Link
                to="/journey"
                className="text-xs font-semibold text-white hover:text-zinc-300 hover:underline flex items-center gap-1 transition-colors"
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
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono tnum font-medium border border-white/10 bg-[#181B24] text-foreground">
                    <Calendar className="size-3 text-zinc-400" aria-hidden="true" />
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
                  className="h-8 rounded-full border border-white/10 bg-[#181B24] text-xs text-muted-foreground hover:text-foreground gap-1.5 px-3 active:scale-[0.98]"
                  onClick={startEditing}
                >
                  <Pencil className="size-3" aria-hidden="true" />
                  <span>Edit Goal</span>
                </Button>
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
                className="rounded-[16px] border-white/10 bg-[#181B24] hover:bg-white/5 min-h-11 text-xs font-medium gap-1.5 active:scale-[0.98]"
                onClick={startEditing}
              >
                <Target className="size-3.5 text-zinc-400" aria-hidden="true" />
                <span>Set Your Primary Goal</span>
              </Button>
            </div>
          )
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  placeholder="e.g. Master system architecture & ship production MVP"
                  aria-label="Primary goal"
                  disabled={saving}
                  autoFocus
                  className="min-h-11 rounded-[16px] bg-[#181B24] border-white/10 text-foreground"
                />
              </div>
              <div>
                <label
                  htmlFor="target-date-input"
                  className="text-xs font-medium text-foreground block mb-1.5"
                >
                  Target milestone date <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input
                  id="target-date-input"
                  type="date"
                  value={targetDate}
                  onChange={(event) => setTargetDate(event.target.value)}
                  aria-label="Goal target date"
                  disabled={saving}
                  className="min-h-11 rounded-[16px] bg-[#181B24] border-white/10 text-foreground w-full sm:w-64 font-mono tnum"
                />
              </div>
            </div>
            <div className="flex gap-2.5 pt-1">
              <Button type="submit" className="min-h-11 rounded-[16px] px-6 text-xs font-semibold bg-white text-black hover:bg-zinc-200 shadow-[0_0_14px_rgba(255,255,255,0.15)] active:scale-[0.98]" disabled={saving}>
                {saving ? "Saving…" : "Save Goal"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="min-h-11 rounded-[16px] text-xs text-muted-foreground hover:bg-white/5 active:scale-[0.98]"
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
          <p className="mt-3 text-xs text-white font-medium" role="status">
            ✓ Goal updated successfully.
          </p>
        )}
      </section>

      {/* ── 3. Unified Performance Telemetry Console ── */}
      <section
        aria-label="Standing and Momentum Telemetry"
        className="rounded-[28px] border border-white/10 bg-[#12141A] p-5 sm:p-6 shadow-xl specular-top"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Performance Telemetry
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            All-Time Records
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {/* Pillar 1: Reliability */}
          <div className="py-3 sm:py-0 sm:px-4 first:sm:pl-0">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider">
                Completion Rate
              </span>
              <CheckCircle2 className="size-4 text-white" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-mono tnum text-foreground">{completionRate}%</span>
              <span className="text-xs font-mono tnum text-muted-foreground">
                ({followThrough.completed}/{followThrough.total})
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Commitment follow-through</p>
          </div>

          {/* Pillar 2: Momentum Streak */}
          <div className="py-3 sm:py-0 sm:px-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider">
                Active Streak
              </span>
              <Flame className="size-4 text-white" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-mono tnum text-foreground">{currentStreak}</span>
              <span className="text-xs font-mono text-muted-foreground">
                {currentStreak === 1 ? "day" : "days"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Consecutive momentum days</p>
          </div>

          {/* Pillar 3: Volume */}
          <div className="py-3 sm:py-0 sm:px-4 last:sm:pr-0">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider">
                Quests Honored
              </span>
              <Compass className="size-4 text-white" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-mono tnum text-foreground">{followThrough.completed}</span>
              <span className="text-xs font-mono text-muted-foreground">honored</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Verified execution proof</p>
          </div>
        </div>
      </section>

      {/* ── 4. System & Audit Operations Hub ── */}
      <div className="space-y-3">
        <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
          Operations & Audit Ledger
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Quest History Entry */}
          <Link
            to="/profile/history"
            className="group flex items-center justify-between p-4 rounded-[20px] border border-white/10 bg-[#12141A] hover:bg-[#181B24] hover:border-white/20 transition-all shadow-md active:scale-[0.98]"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="size-10 rounded-xl border border-white/10 bg-[#181B24] flex items-center justify-center shrink-0 group-hover:border-white/20 transition-colors">
                <History
                  className="size-4 text-white transition-colors"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground group-hover:underline">
                    Quest History
                  </span>
                  <span className="text-[10px] font-mono tnum px-2 py-0.5 rounded-full border border-white/20 bg-white/10 text-white font-semibold">
                    {followThrough.completed} Done
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
            className="group flex items-center justify-between p-4 rounded-[20px] border border-white/10 bg-[#12141A] hover:bg-[#181B24] hover:border-white/20 transition-all shadow-md active:scale-[0.98]"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="size-10 rounded-xl border border-white/10 bg-[#181B24] flex items-center justify-center shrink-0 group-hover:border-white/20 transition-colors">
                <SettingsIcon
                  className="size-4 text-white transition-colors"
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
                  Theme mode, timezone calibration, and data controls.
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
