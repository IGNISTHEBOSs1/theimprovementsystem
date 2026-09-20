import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Monitor, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { useThemeContext, type ThemeMode } from "@/providers/ThemeProvider";

// Founder Decision (Profile/Settings separation chunk): timezone,
// session, and account-data controls moved here verbatim from Profile —
// same logic, same validation, same confirmations, same security
// behavior. Profile's job is identity/goal/history; this page's job is
// system-level control over the account itself. Nothing here is new
// functionality, only a different page for functionality that already
// existed.

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

export default function Settings() {
  const navigate = useNavigate();
  const { profile, updateProfile, signOut, resetGameProgress, deleteAccount } = useAuth();
  const { mode, setMode } = useThemeContext();
  // Founder Decision (Reliability chunk): resetGameProgress writes
  // quests: [] directly to game_state — but the shared Quest state this
  // app actually renders from lives in DashboardDataProvider's React
  // state (mounted once in AppLayout, read via useDashboardDataContext),
  // not re-fetched here. Without this, a successful reset left the
  // Dashboard/Quests/Journey pages showing the pre-reset Quest data
  // until an unrelated action or a full page reload happened to trigger
  // useDashboardData's load() again — DB state and displayed state
  // silently diverging despite the write having actually succeeded.
  const { reload } = useDashboardDataContext();

  // Founder Decision (Profile controls chunk): every recurrence/expiry
  // decision in the app depends on this value (see @/lib/serverTime),
  // but it was previously invisible and uneditable — detected once on
  // first login and never shown again, with no way to correct it if
  // detection was ever wrong (a different device, a VPN, a browser
  // override).
  const [timezone, setTimezone] = useState(profile?.timezone ?? "");
  const [tzSaving, setTzSaving] = useState(false);
  const [tzError, setTzError] = useState<string | null>(null);
  const [tzSuccess, setTzSuccess] = useState(false);

  const [signingOut, setSigningOut] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setTimezone(profile?.timezone ?? "");
  }, [profile?.timezone]);

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
  };

  const executeReset = async () => {
    setResetDialogOpen(false);
    setResetError(false);
    setResetSuccess(false);
    setResetting(true);
    try {
      await resetGameProgress();
      await reload();
      setResetSuccess(true);
    } catch {
      setResetError(true);
    } finally {
      setResetting(false);
    }
  };

  const executeDelete = async () => {
    setDeleteDialogOpen(false);
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
    <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="Settings"
        title="System and account controls."
        description="Timezone, session, and what you control about your account."
      />
      <div className="mt-9 space-y-8">
        {/* This section didn't exist anywhere in the app — every theme
            file already had complete light AND dark values, and the
            provider already had working system-preference detection
            (see ThemeProvider.tsx's resolveMode + matchMedia listener),
            but nothing anywhere ever called setMode. Light mode wasn't
            broken, it was unreachable — there was no control for it.
            Default is now "system" (see App.tsx) so new sessions match
            the OS automatically; this lets anyone override that. */}
        <section className="rounded-2xl border border-border bg-card p-6" aria-labelledby="appearance-heading">
          <h2 id="appearance-heading" className="text-label text-muted-foreground">Appearance</h2>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Auto matches your device's light/dark setting automatically.
          </p>
          <div className="mt-4 inline-flex rounded-xl border border-border bg-muted/30 p-1" role="radiogroup" aria-label="Appearance mode">
            {([
              { value: "light", label: "Light", Icon: Sun },
              { value: "dark", label: "Dark", Icon: Moon },
              { value: "system", label: "Auto", Icon: Monitor },
            ] as { value: ThemeMode; label: string; Icon: typeof Sun }[]).map(({ value, label, Icon }) => {
              const active = mode === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setMode(value)}
                  className={
                    "flex min-h-11 items-center gap-2 rounded-lg px-4 text-body-sm font-medium transition-colors " +
                    (active
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </button>
              );
            })}
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
                onClick={() => setResetDialogOpen(true)}
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
                onClick={() => setDeleteDialogOpen(true)}
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

      {/* Reset Progress Alert Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
              <AlertDialogTitle>Reset all Quest progress?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Your primary goal and login account remain intact. Every active and historical Quest record will be permanently cleared. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="min-h-11">Keep my progress</AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void executeReset()}
            >
              Reset everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
              <AlertDialogTitle>Permanently delete account?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              This will permanently remove your goal, profile, and all Quest history. You will be signed out immediately. This cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="min-h-11">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void executeDelete()}
            >
              Delete account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
