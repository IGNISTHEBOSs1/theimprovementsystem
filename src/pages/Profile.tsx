import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Pencil, Settings as SettingsIcon, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { IdentityAvatar } from "@/components/system-bar/IdentityAvatar";
import { useAuth } from "@/hooks/useAuth";

// Founder Decision (Profile/Settings separation chunk): Profile's job is
// identity, primary goal, personal context, and Quest history — nothing
// about timezone, session, or account-data controls belongs here
// anymore (moved to Settings, reached via the link below). This keeps
// Profile answering "who am I / what am I working toward" and Settings
// answering "what does the system control.
//
// Founder Decision (Profile identity/anchor chunk): two real gaps found
// on audit, both fixed below — (1) this page showed no identity at all,
// not even a username, despite its own stated job being "who am I"; (2)
// the goal was always rendered as a live, permanently-open input field,
// with no distinct "this is your current goal" display state separate
// from editing — undersizing it relative to its stated importance and
// failing the "current / editing / saving / saved / error" state
// requirement, which only ever had editing/saving/saved/error, never a
// real "current" view. Timezone and account/data controls were
// confirmed already correctly present in Settings.tsx with full state
// handling — not duplicated here, since that would be a second
// timezone/account-control surface, explicitly not wanted.
export default function Profile() {
  const { profile, updateProfile } = useAuth();
  const [editingGoal, setEditingGoal] = useState(false);
  const [goal, setGoal] = useState(profile?.primary_goal ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setGoal(profile?.primary_goal ?? "");
  }, [profile?.primary_goal]);

  const startEditing = () => {
    setGoal(profile?.primary_goal ?? "");
    setSaveError(false);
    setSaveSuccess(false);
    setEditingGoal(true);
  };

  const cancelEditing = () => {
    setGoal(profile?.primary_goal ?? "");
    setSaveError(false);
    setEditingGoal(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaveError(false);
    setSaveSuccess(false);
    const trimmed = goal.trim();
    const { error, profile: saved } = await updateProfile({ primary_goal: trimmed || null });
    setSaving(false);
    if (error || !saved) {
      setGoal(profile?.primary_goal ?? "");
      setSaveError(true);
      return;
    }
    setGoal(saved.primary_goal ?? "");
    setSaveSuccess(true);
    setEditingGoal(false);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Your system"
        title="Your system."
        description="Who you are, and what you're working toward."
      />

      {/* Founder Decision (Profile identity/anchor chunk): identity —
          the page's own stated job, previously not shown anywhere on
          it. Reuses IdentityAvatar exactly as-is (no avatar image system
          exists — see that component's own docs — so this correctly
          shows initials, nothing invented). */}
      <div className="mt-8 flex items-center gap-4">
        <IdentityAvatar username={profile?.username ?? ""} className="h-12 w-12" />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-foreground">{profile?.username}</p>
          <p className="text-body-sm text-muted-foreground">This is how TIS knows you.</p>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {/* Founder Decision (Profile identity/anchor chunk): the goal is
            the most important thing on this page after identity, per
            the brief, so it gets the same restrained primary-tinted
            treatment PrimaryActionPanel already uses on Dashboard for
            "the one thing that matters" — reused, not invented. The
            "Quest history" / "Settings" links below stay plain ghost
            buttons, unchanged, so the contrast in visual weight is
            deliberate, not incidental. */}
        <section
          className="rounded-2xl border border-primary/30 bg-card p-6 shadow-[0_0_0_1px_hsl(var(--primary)/0.06),0_8px_28px_-14px_hsl(var(--primary)/0.35)]"
          aria-labelledby="primary-goal-heading"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-primary" aria-hidden="true" />
              <h2 id="primary-goal-heading" className="text-label text-primary">Your goal</h2>
            </div>
            {!editingGoal && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-9 text-muted-foreground hover:text-foreground"
                onClick={startEditing}
              >
                <Pencil className="size-3.5" aria-hidden="true" />
                {profile?.primary_goal ? "Edit" : "Set a goal"}
              </Button>
            )}
          </div>

          {!editingGoal ? (
            // Founder Decision (Profile identity/anchor chunk): the
            // "current value" state that was previously missing — the
            // goal read as a form field, never as an anchor. Now shown
            // as large, direct text when set, or an inviting (not
            // pushy) empty state when it isn't.
            profile?.primary_goal ? (
              <p className="mt-3 text-2xl font-semibold leading-tight text-foreground">
                {profile.primary_goal}
              </p>
            ) : (
              <p className="mt-3 text-body-md text-muted-foreground">
                No goal set yet. Optional — Quests work fine without one, but a goal lets TIS connect your commitments to a direction.
              </p>
            )
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Input
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="What are you working toward?"
                aria-label="Primary goal"
                disabled={saving}
                autoFocus
                className="min-h-11"
              />
              <div className="flex gap-2">
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
        </section>

        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/profile/history">
              Quest history
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/profile/settings">
              <SettingsIcon className="size-4" aria-hidden="true" />
              Settings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
