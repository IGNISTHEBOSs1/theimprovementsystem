import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAuth } from "@/hooks/useAuth";

// Known IANA zone names, when the browser supports Intl.supportedValuesOf
// (widely available, but not universal — see the guarded call below).
// Used only to validate what's typed, not to render a picker UI; this
// stays a plain text field, not a new dropdown component.
function getKnownTimezones(): string[] | null {
  try {
    // @ts-expect-error — supportedValuesOf is recent; not in older lib.dom typings
    if (typeof Intl.supportedValuesOf === "function") {
      // @ts-expect-error — see above
      return Intl.supportedValuesOf("timeZone");
    }
  } catch {
    // fall through
  }
  return null;
}

export default function Profile() {
  const navigate = useNavigate();
  const { profile, updateProfile, signOut, resetGameProgress, deleteAccount } = useAuth();
  const [goal, setGoal] = useState(profile?.primary_goal ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Founder Decision (Profile controls chunk): every recurrence/expiry
  // decision in the app depends on this value (see @/lib/serverTime),
  // but it was previously invisible and uneditable — detected once on
  // first login and never shown again, with no way to correct it if
  // detection was ever wrong (a different device, a VPN, a browser
  // override). Same save/error/success pattern as the goal field above,
  // for the same reason: this is a real, independent write.
  const [timezone, setTimezone] = useState(profile?.timezone ?? "");
  const [tzSaving, setTzSaving] = useState(false);
  const [tzError, setTzError] = useState<string | null>(null);
  const [tzSuccess, setTzSuccess] = useState(false);

  const [signingOut, setSigningOut] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  useEffect(() => {
    setGoal(profile?.primary_goal ?? "");
  }, [profile?.primary_goal]);

  useEffect(() => {
    setTimezone(profile?.timezone ?? "");
  }, [profile?.timezone]);

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
  };

  const handleTimezoneSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = timezone.trim();
    setTzError(null);
    setTzSuccess(false);

    if (!trimmed) {
      setTzError("A timezone is needed for your Quests to reset on the right day.");
      return;
    }
    const known = getKnownTimezones();
    // Only validate against the known list when the browser actually
    // provides one — refusing every entry because the check itself is
    // unavailable would be worse than not validating at all.
    if (known && !known.includes(trimmed)) {
      setTzError(`"${trimmed}" isn't a recognized timezone (e.g. "Asia/Kolkata", "America/New_York").`);
      return;
    }

    setTzSaving(true);
    const { error, profile: saved } = await updateProfile({ timezone: trimmed });
    setTzSaving(false);
    if (error || !saved) {
      setTimezone(profile?.timezone ?? "");
      setTzError("That didn't go through. You can try again.");
      return;
    }
    setTimezone(saved.timezone ?? "");
    setTzSuccess(true);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    // AuthProvider's own auth-state listener will clear user/profile and
    // ProtectedRoute will redirect — no navigate() needed for the normal
    // path, but signingOut prevents a double-click in the meantime.
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all Quest progress? Your goal and account stay — every Quest, active and historical, is cleared. This can't be undone.")) return;
    setResetError(false);
    setResetSuccess(false);
    setResetting(true);
    try {
      await resetGameProgress();
      setResetSuccess(true);
    } catch {
      setResetError(true);
    } finally {
      setResetting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your account? Your goal and all Quest history are permanently removed. This can't be undone.")) return;
    setDeleteError(false);
    setDeleting(true);
    try {
      await deleteAccount();
      navigate("/auth");
    } catch {
      setDeleteError(true);
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Your system"
        title="Your system."
        description="What TIS knows, and what you control."
      />
      <div className="mt-9 space-y-8">
        <section className="rounded-2xl border border-border bg-card p-6" aria-labelledby="primary-goal-heading">
          <h2 id="primary-goal-heading" className="text-label text-muted-foreground">Primary goal</h2>
          <p className="mt-1 text-body-sm text-muted-foreground">
            The one direction your commitments can be measured against. Optional — quests work fine without it.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input
              value={goal}
              onChange={(event) => {
                setGoal(event.target.value);
                setSaveSuccess(false);
              }}
              placeholder="What are you working toward?"
              aria-label="Primary goal"
              disabled={saving}
              className="min-h-11"
            />
            <Button type="submit" className="min-h-11 shrink-0" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </form>
          {saveError && (
            <p className="mt-3 text-body-sm text-muted-foreground" role="alert">
              That didn't go through. You can try again.
            </p>
          )}
          {saveSuccess && !saveError && (
            <p className="mt-3 text-body-sm text-muted-foreground" role="status">
              Saved.
            </p>
          )}

          <div className="mt-6">
            <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
              <Link to="/profile/history">
                Quest history
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6" aria-labelledby="timezone-heading">
          <h2 id="timezone-heading" className="text-label text-muted-foreground">Timezone</h2>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Used to decide which calendar day it is for your Quests — when a recurring Quest becomes active, and when a Quest counts as missed. Detected automatically; correct it if it's wrong.
          </p>
          <form onSubmit={handleTimezoneSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input
              value={timezone}
              onChange={(event) => {
                setTimezone(event.target.value);
                setTzSuccess(false);
                setTzError(null);
              }}
              placeholder="e.g. Asia/Kolkata"
              aria-label="Timezone"
              disabled={tzSaving}
              className="min-h-11"
            />
            <Button type="submit" className="min-h-11 shrink-0" disabled={tzSaving}>
              {tzSaving ? "Saving…" : "Save"}
            </Button>
          </form>
          {tzError && (
            <p className="mt-3 text-body-sm text-muted-foreground" role="alert">
              {tzError}
            </p>
          )}
          {tzSuccess && !tzError && (
            <p className="mt-3 text-body-sm text-muted-foreground" role="status">
              Saved.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6" aria-labelledby="session-heading">
          <h2 id="session-heading" className="text-label text-muted-foreground">Session</h2>
          <div className="mt-4">
            <Button variant="outline" className="min-h-11" onClick={() => void handleSignOut()} disabled={signingOut}>
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-destructive/30 bg-card p-6" aria-labelledby="danger-heading">
          <h2 id="danger-heading" className="text-label text-muted-foreground">Account data</h2>
          <div className="mt-4 space-y-5">
            <div>
              <p className="text-body-sm text-foreground">Reset all Quest progress</p>
              <p className="mt-1 text-body-sm text-muted-foreground">
                Clears every active and historical Quest. Your goal and account stay.
              </p>
              <Button
                variant="outline"
                className="mt-3 min-h-11 border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => void handleReset()}
                disabled={resetting}
              >
                {resetting ? "Resetting…" : "Reset progress"}
              </Button>
              {resetError && (
                <p className="mt-2 text-body-sm text-muted-foreground" role="alert">
                  That didn't go through. You can try again.
                </p>
              )}
              {resetSuccess && !resetError && (
                <p className="mt-2 text-body-sm text-muted-foreground" role="status">
                  Progress reset.
                </p>
              )}
            </div>

            <div>
              <p className="text-body-sm text-foreground">Delete account</p>
              <p className="mt-1 text-body-sm text-muted-foreground">
                Permanently removes your goal and all Quest history. Your login itself isn't removed by this — contact support if you also need that closed.
              </p>
              <Button
                variant="outline"
                className="mt-3 min-h-11 border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => void handleDelete()}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete account"}
              </Button>
              {deleteError && (
                <p className="mt-2 text-body-sm text-muted-foreground" role="alert">
                  That didn't go through. You can try again.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
