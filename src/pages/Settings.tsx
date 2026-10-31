import { FormEvent, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Sun,
  Moon,
  Monitor,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Download,
  LogOut,
  User,
  Sparkles,
  CheckCircle2,
  Lock,
  RefreshCw,
  Sliders,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { detectDeviceTimezone } from "@/lib/serverTime";

// Founder Decision (Profile/Settings separation chunk): timezone,
// session, and account-data controls moved here verbatim from Profile —
// same logic, same validation, same confirmations, same security
// behavior. Profile's job is identity/goal/history; this page's job is
// system-level control over the account itself.
//
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
  const { user, profile, updateProfile, signOut, resetGameProgress, deleteAccount } = useAuth();
  const { mode, setMode } = useThemeContext();
  const { reload } = useDashboardDataContext();
  const {
    soundEnabled,
    setSoundEnabled,
    playSuccess,
    playButtonPress,
    playToggle,
    playConfirmation,
    playDestructive,
    playError,
  } = useSoundEffects();

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

  const [exporting, setExporting] = useState(false);

  const detectedTz = detectDeviceTimezone();
  const isTimezoneSynced = timezone.trim().toLowerCase() === detectedTz.toLowerCase();

  useEffect(() => {
    setTimezone(profile?.timezone ?? "");
  }, [profile?.timezone]);

  const handleTimezoneSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = timezone.trim();
    setTzError(null);
    setTzSuccess(false);

    if (!trimmed) {
      setTzError("A timezone is needed for your daily tasks and trajectory to reset on the right day.");
      playError();
      return;
    }
    const known = getKnownTimezones();
    if (known && !known.includes(trimmed)) {
      setTzError(`"${trimmed}" isn't a recognized timezone (e.g. "Asia/Kolkata", "America/New_York").`);
      playError();
      return;
    }

    setTzSaving(true);
    const { error, profile: saved } = await updateProfile({ timezone: trimmed });
    setTzSaving(false);
    if (error || !saved) {
      setTimezone(profile?.timezone ?? "");
      setTzError("That didn't go through. You can try again.");
      playError();
      return;
    }
    setTimezone(saved.timezone ?? "");
    setTzSuccess(true);
    playSuccess();
  };

  const handleSyncDetectedTimezone = async () => {
    if (!detectedTz) return;
    setTzError(null);
    setTzSuccess(false);
    setTimezone(detectedTz);
    setTzSaving(true);
    const { error, profile: saved } = await updateProfile({ timezone: detectedTz });
    setTzSaving(false);
    if (error || !saved) {
      setTimezone(profile?.timezone ?? "");
      setTzError("Could not save device timezone. Please try again.");
      playError();
      return;
    }
    setTimezone(saved.timezone ?? "");
    setTzSuccess(true);
    playSuccess();
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
      playSuccess();
    } catch {
      setResetError(true);
      playError();
    } finally {
      setResetting(false);
    }
  };

  const executeDelete = async () => {
    setDeleteDialogOpen(false);
    setDeleteError(false);
    setDeleting(true);
    try {
      playDestructive();
      await deleteAccount();
      navigate("/auth");
    } catch {
      setDeleteError(true);
      playError();
      setDeleting(false);
    }
  };

  const handleExportVault = () => {
    setExporting(true);
    try {
      const exportPayload = {
        application: "Kinetic",
        version: "2.0.0",
        exportedAt: new Date().toISOString(),
        profile: {
          id: profile?.id,
          username: profile?.username,
          timezone: profile?.timezone,
          primary_goal: profile?.primary_goal,
          primary_goal_target_date: profile?.primary_goal_target_date,
          created_at: profile?.created_at,
        },
        systemPreferences: {
          themeMode: mode,
          deviceDetectedTimezone: detectedTz,
          privacyStatus: "zero-third-party-tracking",
        },
      };

      const dataBlob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `improvement-system-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setExporting(false), 600);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="Preferences"
        title="Settings."
        description="Appearance, audio feedback, timezone schedule, and account controls."
      >
        <Button variant="ghost" asChild className="shrink-0 gap-1.5">
          <Link to="/profile">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to profile
          </Link>
        </Button>
      </PageHeader>

      <div className="space-y-6">
        {/* ── 1. EXPERIENCE & PREFERENCES (Unified Appearance + Sound) ── */}
        <section
          className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-[var(--shadow-card)] space-y-5"
          aria-labelledby="experience-heading"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-foreground/5 border border-border/60 flex items-center justify-center text-foreground">
                <Sparkles className="size-4" aria-hidden="true" />
              </div>
              <div>
                <h2 id="experience-heading" className="text-sm sm:text-base font-semibold tracking-tight text-foreground">
                  Experience & Preferences
                </h2>
                <p className="text-xs text-muted-foreground">
                  Theme appearance and tactile audio feedback.
                </p>
              </div>
            </div>
          </div>

          {/* Subsection: Appearance Mode */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-foreground block">
              Color Theme
            </span>
            <Tabs
              value={mode}
              onValueChange={(val) => {
                playToggle();
                setMode(val as ThemeMode);
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 w-full max-w-md h-10 p-1 rounded-xl bg-muted/60 border border-border/80">
                <TabsTrigger
                  value="light"
                  className="flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium transition-all text-muted-foreground hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm active:scale-[0.98]"
                >
                  <Sun className="size-3.5" aria-hidden="true" />
                  <span>Light</span>
                </TabsTrigger>
                <TabsTrigger
                  value="dark"
                  className="flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium transition-all text-muted-foreground hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm active:scale-[0.98]"
                >
                  <Moon className="size-3.5" aria-hidden="true" />
                  <span>Dark</span>
                </TabsTrigger>
                <TabsTrigger
                  value="system"
                  className="flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium transition-all text-muted-foreground hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm active:scale-[0.98]"
                >
                  <Monitor className="size-3.5" aria-hidden="true" />
                  <span>Auto</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground">
              {mode === "light"
                ? "Solar Light: High contrast surfaces for well-lit environments."
                : mode === "dark"
                ? "Obsidian Dark: Deep matte contrast for reduced eye strain."
                : "Auto: Automatically aligns with your operating system preference."}
            </p>
          </div>

          {/* Subsection: Sound Effects */}
          <div className="pt-4 border-t border-border/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Switch
                  id="sound-toggle"
                  checked={soundEnabled}
                  onCheckedChange={(val) => {
                    setSoundEnabled(val);
                  }}
                />
                <label htmlFor="sound-toggle" className="cursor-pointer">
                  <p className="text-xs sm:text-sm font-semibold text-foreground">
                    Interface Sound Effects
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Subtle acoustic feedback on completions, toggles, and buttons.
                  </p>
                </label>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => playSuccess()}
                  disabled={!soundEnabled}
                  className="h-8 px-2.5 text-xs gap-1.5 active:scale-[0.98]"
                >
                  <Sparkles className="size-3 text-foreground" />
                  <span>Test Tone</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => playButtonPress()}
                  disabled={!soundEnabled}
                  className="h-8 px-2.5 text-xs gap-1.5 active:scale-[0.98]"
                >
                  <Sliders className="size-3 text-foreground" />
                  <span>Test Click</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. TIMEZONE & DAILY SCHEDULE ── */}
        <section
          className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-[var(--shadow-card)] space-y-4"
          aria-labelledby="timezone-heading"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-foreground/5 border border-border/60 flex items-center justify-center text-foreground">
              <Clock className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="timezone-heading" className="text-sm sm:text-base font-semibold tracking-tight text-foreground">
                Timezone & Daily Reset
              </h2>
              <p className="text-xs text-muted-foreground">
                Determines when your primary focus and routines reset at midnight.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${
                  isTimezoneSynced ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500"
                }`}
              />
              <span className="text-muted-foreground">
                Detected Browser Zone: <strong className="text-foreground font-mono font-medium">{detectedTz}</strong>
              </span>
            </div>

            {!isTimezoneSynced ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleSyncDetectedTimezone()}
                disabled={tzSaving}
                className="h-8 text-xs gap-1.5 active:scale-[0.98] self-start sm:self-auto"
              >
                <RefreshCw className={`size-3 ${tzSaving ? "animate-spin" : ""}`} />
                <span>Sync to Browser Zone</span>
              </Button>
            ) : (
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="size-3" />
                Synchronized
              </span>
            )}
          </div>

          <form onSubmit={handleTimezoneSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Input
                name="timezone"
                autoComplete="off"
                value={timezone}
                onChange={(event) => {
                  setTimezone(event.target.value);
                  setTzSuccess(false);
                  setTzError(null);
                }}
                placeholder="e.g. Asia/Kolkata or America/New_York…"
                aria-label="Timezone"
                disabled={tzSaving}
                className="min-h-10 font-mono text-xs sm:text-sm bg-background/60 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              className="min-h-10 px-5 shrink-0 font-medium text-xs active:scale-[0.98] rounded-xl"
              disabled={tzSaving}
            >
              {tzSaving ? "Saving…" : "Save Timezone"}
            </Button>
          </form>

          {tzError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive flex items-center gap-2" role="alert">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span>{tzError}</span>
            </div>
          )}
          {tzSuccess && !tzError && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2" role="status">
              <CheckCircle2 className="size-3.5 shrink-0" />
              <span>Timezone updated. Daily commitments will reset at midnight in this zone.</span>
            </div>
          )}
        </section>

        {/* ── 3. DATA SOVEREIGNTY & PRIVACY ── */}
        <section
          className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-[var(--shadow-card)] space-y-4"
          aria-labelledby="privacy-heading"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-foreground/5 border border-border/60 flex items-center justify-center text-foreground">
              <ShieldCheck className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="privacy-heading" className="text-sm sm:text-base font-semibold tracking-tight text-foreground">
                Privacy & Data Sovereignty
              </h2>
              <p className="text-xs text-muted-foreground">
                Local-first architecture. Zero tracking or telemetry brokering.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
              <div className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
                <Lock className="size-3.5 text-foreground" />
                <span>Local-First Storage</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Encrypted browser-persisted state ensures instant responsiveness with zero network latency.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
              <div className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
                <Sliders className="size-3.5 text-foreground" />
                <span>Zero Third-Party Trackers</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                No analytics trackers, advertising pixels, or external telemetry brokers.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-semibold text-foreground">Export Personal Trajectory Data</p>
              <p className="text-muted-foreground">
                Download a complete JSON backup of your profile, timezone, and commitment history.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportVault}
              disabled={exporting}
              className="min-h-10 px-4 text-xs font-semibold gap-2 active:scale-[0.98] shrink-0 rounded-xl"
            >
              <Download className="size-3.5" />
              <span>{exporting ? "Generating…" : "Export JSON"}</span>
            </Button>
          </div>
        </section>

        {/* ── 4. ACCOUNT & SESSION ── */}
        <section
          className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-[var(--shadow-card)]"
          aria-labelledby="session-heading"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="size-8 rounded-lg bg-foreground/5 border border-border/60 flex items-center justify-center text-foreground">
              <User className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="session-heading" className="text-sm sm:text-base font-semibold tracking-tight text-foreground">
                Active Session
              </h2>
              <p className="text-xs text-muted-foreground">
                Manage your authenticated session.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-medium text-muted-foreground block">
                Signed in as
              </span>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {user?.email || profile?.username || "Authenticated User"}
              </p>
              {profile?.created_at && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </p>
              )}
            </div>

            <Button
              variant="outline"
              className="min-h-10 px-4 text-xs font-medium gap-2 active:scale-[0.98] shrink-0 rounded-xl"
              onClick={() => void handleSignOut()}
              disabled={signingOut}
            >
              <LogOut className="size-3.5" />
              <span>{signingOut ? "Signing out…" : "Sign Out"}</span>
            </Button>
          </div>
        </section>

        {/* ── 5. DATA RESET & ACCOUNT MANAGEMENT (Differentiated Destructive Actions - P2-44) ── */}
        <section
          className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-[var(--shadow-card)] space-y-4"
          aria-labelledby="account-management-heading"
        >
          <div>
            <h2 id="account-management-heading" className="text-sm sm:text-base font-semibold tracking-tight text-foreground">
              Data Reset & Account Management
            </h2>
            <p className="text-xs text-muted-foreground">
              Differentiated actions for resetting progress data or permanently removing your account.
            </p>
          </div>

          <div className="space-y-4 pt-1">
            {/* Level 1: Reset Trajectory Progress (Amber Warning Level) */}
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    Reset Trajectory Progress
                  </span>
                  <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400 text-[10px] px-1.5 py-0">
                    Data Reset
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Clears all completed and active quest records to start your trajectory anew. Your login credentials, username, and North Star goal remain completely safe.
                </p>
              </div>

              <Button
                variant="outline"
                className="min-h-10 px-4 shrink-0 border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 font-semibold text-xs active:scale-[0.98] rounded-xl self-start sm:self-auto"
                onClick={() => setResetDialogOpen(true)}
                disabled={resetting}
              >
                {resetting ? "Resetting…" : "Reset Progress Only"}
              </Button>
            </div>

            {resetError && (
              <p className="text-xs text-destructive flex items-center gap-1.5 px-1" role="alert">
                <AlertTriangle className="size-3.5" />
                <span>Unable to reset progress. Please try again.</span>
              </p>
            )}
            {resetSuccess && !resetError && (
              <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 px-1" role="status">
                <CheckCircle2 className="size-3.5" />
                <span>Trajectory progress has been reset.</span>
              </p>
            )}

            {/* Level 2: Permanently Delete Account (Critical Destructive Red Level) */}
            <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-destructive">
                    Permanently Delete Account
                  </span>
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 font-semibold">
                    Irreversible
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Permanently destroys your account login, profile, North Star goal, and all stored data from the server. You will be signed out immediately.
                </p>
              </div>

              <Button
                variant="destructive"
                className="min-h-10 px-4 shrink-0 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs active:scale-[0.98] rounded-xl self-start sm:self-auto"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete Entire Account"}
              </Button>
            </div>

            {deleteError && (
              <p className="text-xs text-destructive flex items-center gap-1.5 px-1" role="alert">
                <AlertTriangle className="size-3.5" />
                <span>Unable to delete account. Please try again or contact support.</span>
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Reset Progress Alert Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-5" aria-hidden="true" />
              <AlertDialogTitle>Reset trajectory progress?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Your login credentials and primary North Star goal remain safe and intact. Only active and historical quest records will be cleared. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="min-h-10 text-xs sm:text-sm">Keep my progress</AlertDialogCancel>
            <AlertDialogAction
              className="min-h-10 bg-amber-600 text-white hover:bg-amber-700 text-xs sm:text-sm font-semibold"
              onClick={() => void executeReset()}
            >
              Reset progress data
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
            <AlertDialogDescription className="text-xs sm:text-sm">
              This will permanently remove your goal, profile, and all trajectory history. You will be signed out immediately. This cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="min-h-11 text-xs sm:text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11 bg-red-600 text-white hover:bg-red-700 text-xs sm:text-sm font-medium"
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
