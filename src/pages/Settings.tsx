import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
          vaultStatus: "encrypted-offline-ready",
        },
      };

      const dataBlob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `kinetic-vault-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setExporting(false), 600);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="SYSTEM PREFERENCES"
        title="Settings & System Controls"
        description="Configure appearance, cadence engine, local security enclave, and account lifecycle."
      />

      <div className="mt-8 sm:mt-10 space-y-6 sm:space-y-8">
        {/* -- SECTION 1: APPEARANCE & DISPLAY MATRIX -- */}
        <section
          className="rounded-[28px] border border-white/10 bg-[#12141A] p-5 sm:p-7 shadow-xl specular-top transition-all"
          aria-labelledby="appearance-heading"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-[#181B24] border border-white/10 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="size-4" aria-hidden="true" />
              </div>
              <div>
                <h2 id="appearance-heading" className="text-sm font-semibold tracking-tight text-foreground">
                  Appearance Mode
                </h2>
                <p className="text-xs text-muted-foreground">
                  Select your visual contrast mode across all surfaces.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider border-white/10 bg-[#181B24] text-muted-foreground hidden sm:inline-flex">
              Display Matrix
            </Badge>
          </div>

          <div className="mt-5">
            <Tabs
              value={mode}
              onValueChange={(val) => {
                playToggle();
                setMode(val as ThemeMode);
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 w-full max-w-md h-12 p-1.5 rounded-[18px] bg-[#181B24] border border-white/10">
                <TabsTrigger
                  value="light"
                  className="flex items-center justify-center gap-2 h-9 rounded-[14px] text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-[#12141A] data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-white/10 data-[state=active]:shadow-md active:scale-[0.98]"
                >
                  <Sun className="size-4" aria-hidden="true" />
                  <span>Light</span>
                </TabsTrigger>
                <TabsTrigger
                  value="dark"
                  className="flex items-center justify-center gap-2 h-9 rounded-[14px] text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-[#12141A] data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-white/10 data-[state=active]:shadow-md active:scale-[0.98]"
                >
                  <Moon className="size-4" aria-hidden="true" />
                  <span>Dark</span>
                </TabsTrigger>
                <TabsTrigger
                  value="system"
                  className="flex items-center justify-center gap-2 h-9 rounded-[14px] text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-[#12141A] data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-white/10 data-[state=active]:shadow-md active:scale-[0.98]"
                >
                  <Monitor className="size-4" aria-hidden="true" />
                  <span>Auto</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mt-3.5 flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="size-1.5 rounded-full bg-white" />
              <span>
                Active:{" "}
                {mode === "light"
                  ? "Solar Light (Clean High Contrast)"
                  : mode === "dark"
                  ? "Obsidian Dark (Deep Matte Contrast)"
                  : "Auto Synchronized (Matches Device OS)"}
              </span>
            </div>
          </div>
        </section>

        {/* -- SECTION: TACTILE SOUND & ACOUSTIC FEEDBACK -- */}
        <section
          className="rounded-[28px] border border-white/10 bg-[#12141A] p-5 sm:p-7 shadow-xl specular-top transition-all"
          aria-labelledby="audio-heading"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-[#181B24] border border-white/10 flex items-center justify-center text-white shadow-xs">
                {soundEnabled ? (
                  <Volume2 className="size-4" aria-hidden="true" />
                ) : (
                  <VolumeX className="size-4 text-muted-foreground" aria-hidden="true" />
                )}
              </div>
              <div>
                <h2 id="audio-heading" className="text-sm font-semibold tracking-tight text-foreground">
                  Acoustic Feedback & Sound Design
                </h2>
                <p className="text-xs text-muted-foreground">
                  Satisfying mechanical micro-clicks, confirmation toggles, and harmonic completion blooms.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider border-white/10 bg-[#181B24] text-muted-foreground hidden sm:inline-flex">
              Audio Engine
            </Badge>
          </div>

          <div className="mt-4 p-4 rounded-[20px] bg-[#181B24] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  {soundEnabled ? "Sound Feedback Active" : "Sound Feedback Muted"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {soundEnabled
                    ? "Interactive audio enabled for buttons, switches, and trajectory completions."
                    : "All interface sounds are muted. Silent visual mode active."}
                </p>
              </label>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  playSuccess();
                }}
                disabled={!soundEnabled}
                className="h-9 px-3 rounded-[12px] border-white/10 bg-[#12141A] hover:bg-white/5 text-xs gap-1.5 active:scale-[0.98]"
              >
                <Sparkles className="size-3.5 text-white" />
                <span>Test Success Bloom</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  playButtonPress();
                }}
                disabled={!soundEnabled}
                className="h-9 px-3 rounded-[12px] border-white/10 bg-[#12141A] hover:bg-white/5 text-xs gap-1.5 active:scale-[0.98]"
              >
                <Sliders className="size-3.5 text-muted-foreground" />
                <span>Test Click</span>
              </Button>
            </div>
          </div>
        </section>

        {/* -- SECTION 2: TEMPORAL ENGINE & SYSTEM CADENCE -- */}
        <section
          className="rounded-[28px] border border-white/10 bg-[#12141A] p-5 sm:p-7 shadow-xl specular-top transition-all"
          aria-labelledby="timezone-heading"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-[#181B24] border border-white/10 flex items-center justify-center text-white shadow-xs">
                <Clock className="size-4" aria-hidden="true" />
              </div>
              <div>
                <h2 id="timezone-heading" className="text-sm font-semibold tracking-tight text-foreground">
                  Timezone & Cadence Engine
                </h2>
                <p className="text-xs text-muted-foreground">
                  Authoritative calendar day calculation for your daily primary focus and routine reset.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider border-white/10 bg-[#181B24] text-muted-foreground hidden sm:inline-flex">
              Temporal Engine
            </Badge>
          </div>

          {/* Device Sync Status Badge / 1-Click Action */}
          <div className="mt-4 p-3.5 rounded-[20px] bg-[#181B24] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`size-2 rounded-full ${
                  isTimezoneSynced ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "bg-amber-500"
                }`}
              />
              <span className="text-muted-foreground">
                Browser Detected Zone:{" "}
                <strong className="text-foreground font-mono font-medium">{detectedTz}</strong>
              </span>
            </div>

            {!isTimezoneSynced && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleSyncDetectedTimezone()}
                disabled={tzSaving}
                className="h-8 rounded-[12px] border-white/10 bg-[#12141A] hover:bg-white/5 text-xs gap-1.5 active:scale-[0.98]"
              >
                <RefreshCw className={`size-3 ${tzSaving ? "animate-spin" : ""}`} />
                <span>Sync to Browser Zone</span>
              </Button>
            )}
            {isTimezoneSynced && (
              <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="size-3 text-white" />
                Synchronized
              </span>
            )}
          </div>

          <form onSubmit={handleTimezoneSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Input
                value={timezone}
                onChange={(event) => {
                  setTimezone(event.target.value);
                  setTzSuccess(false);
                  setTzError(null);
                }}
                placeholder="e.g. Asia/Kolkata or America/New_York"
                aria-label="Timezone"
                disabled={tzSaving}
                className="min-h-11 font-mono text-xs sm:text-sm pl-3.5 bg-[#181B24] border-white/10 rounded-[16px] text-foreground"
              />
            </div>
            <Button
              type="submit"
              className="min-h-11 px-6 shrink-0 rounded-[16px] bg-white text-black hover:bg-zinc-200 font-semibold shadow-[0_0_14px_rgba(255,255,255,0.15)] active:scale-[0.98]"
              disabled={tzSaving}
            >
              {tzSaving ? "Saving…" : "Save Timezone"}
            </Button>
          </form>

          {tzError && (
            <div className="mt-3 p-3 rounded-[14px] bg-destructive/10 border border-destructive/30 text-xs text-destructive flex items-center gap-2" role="alert">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{tzError}</span>
            </div>
          )}
          {tzSuccess && !tzError && (
            <div className="mt-3 p-3 rounded-[14px] bg-white/10 border border-white/20 text-xs text-white flex items-center gap-2" role="status">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>Timezone successfully saved. Daily tasks will reset at midnight in this zone.</span>
            </div>
          )}
        </section>

        {/* -- SECTION 3: DATA SOVEREIGNTY & LOCAL ENCLAVE -- */}
        <section
          className="rounded-[28px] border border-white/10 bg-[#12141A] p-5 sm:p-7 shadow-xl specular-top transition-all"
          aria-labelledby="enclave-heading"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-[#181B24] border border-white/10 flex items-center justify-center text-white shadow-xs">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </div>
              <div>
                <h2 id="enclave-heading" className="text-sm font-semibold tracking-tight text-foreground">
                  Data Sovereignty & Offline Enclave
                </h2>
                <p className="text-xs text-muted-foreground">
                  Local-first architecture. Kinetic never monetizes, rents, or shares your personal progress.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider border-white/10 bg-[#181B24] text-muted-foreground hidden sm:inline-flex">
              Vault Enclave
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-[20px] bg-[#181B24] border border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground mb-1">
                <Lock className="size-3.5 text-white" />
                <span>Local-First Enclave</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Encrypted browser storage keeps your commitments private and responsive even with zero network connectivity.
              </p>
            </div>

            <div className="p-4 rounded-[20px] bg-[#181B24] border border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground mb-1">
                <Sliders className="size-3.5 text-white" />
                <span>Zero Third-Party Trackers</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                No third-party ad telemetry or behavioral pixel scripts. Only pure mathematical trajectory computation.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-foreground">Export Personal Trajectory Data</p>
              <p className="text-[11px] text-muted-foreground">
                Download a complete JSON snapshot of your profile, timezone, and commitment configurations.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportVault}
              disabled={exporting}
              className="min-h-11 px-5 rounded-[16px] border border-white/10 bg-[#181B24] hover:bg-white/5 text-xs font-medium gap-2 active:scale-[0.98] shrink-0"
            >
              <Download className="size-3.5" />
              <span>{exporting ? "Generating Snapshot…" : "Export Vault (JSON)"}</span>
            </Button>
          </div>
        </section>

        {/* -- SECTION 4: ACTIVE SESSION & IDENTITY -- */}
        <section
          className="rounded-[28px] border border-white/10 bg-[#12141A] p-5 sm:p-7 shadow-xl specular-top transition-all"
          aria-labelledby="session-heading"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-[#181B24] border border-white/10 flex items-center justify-center text-white shadow-xs">
                <User className="size-4" aria-hidden="true" />
              </div>
              <div>
                <h2 id="session-heading" className="text-sm font-semibold tracking-tight text-foreground">
                  Active Session
                </h2>
                <p className="text-xs text-muted-foreground">
                  Currently authenticated with the Kinetic trajectory network.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider border-white/10 bg-[#181B24] text-muted-foreground hidden sm:inline-flex">
              Session
            </Badge>
          </div>

          <div className="mt-4 p-4 rounded-[20px] bg-[#181B24] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-mono text-muted-foreground">
                Connected Identity
              </span>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {user?.email || profile?.username || "Authenticated User"}
              </p>
              {profile?.created_at && (
                <p className="text-[11px] font-mono tnum text-muted-foreground mt-0.5">
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </p>
              )}
            </div>

            <Button
              variant="outline"
              className="min-h-11 px-5 rounded-[16px] border border-white/10 bg-[#12141A] hover:bg-white/5 text-xs font-medium gap-2 active:scale-[0.98] shrink-0"
              onClick={() => void handleSignOut()}
              disabled={signingOut}
            >
              <LogOut className="size-3.5" />
              <span>{signingOut ? "Signing out…" : "Sign Out of Session"}</span>
            </Button>
          </div>
        </section>

        {/* -- SECTION 5: DANGER ZONE -- */}
        <section
          className="rounded-[28px] border border-rose-500/30 bg-[#12141A] p-5 sm:p-7 shadow-xl specular-top transition-all"
          aria-labelledby="danger-heading"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
                <AlertTriangle className="size-4" aria-hidden="true" />
              </div>
              <div>
                <h2 id="danger-heading" className="text-sm font-semibold tracking-tight text-rose-400">
                  Account Data & Danger Zone
                </h2>
                <p className="text-xs text-muted-foreground">
                  Irreversible operations that reset your trajectory or permanently remove your account.
                </p>
              </div>
            </div>
            <Badge variant="destructive" className="text-[10px] font-mono uppercase tracking-wider border-rose-500/30 bg-rose-500/10 text-rose-400 hidden sm:inline-flex">
              Destructive
            </Badge>
          </div>

          <div className="mt-5 space-y-5 divide-y divide-rose-500/15">
            <div className="pt-2 first:pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Reset All Trajectory Progress</p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-xl">
                    Clears every active and historical task, resetting your 90-day momentum vector. Your profile, username, and primary goal stay intact.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="min-h-11 px-5 rounded-[16px] shrink-0 border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-medium active:scale-[0.98]"
                  onClick={() => setResetDialogOpen(true)}
                  disabled={resetting}
                >
                  {resetting ? "Resetting…" : "Reset Trajectory"}
                </Button>
              </div>

              {resetError && (
                <p className="mt-2 text-xs text-destructive flex items-center gap-1.5" role="alert">
                  <AlertTriangle className="size-3.5" />
                  <span>Unable to reset progress. Please try again.</span>
                </p>
              )}
              {resetSuccess && !resetError && (
                <p className="mt-2 text-xs text-white flex items-center gap-1.5" role="status">
                  <CheckCircle2 className="size-3.5" />
                  <span>Trajectory progress reset successfully.</span>
                </p>
              )}
            </div>

            <div className="pt-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Delete Account Permanently</p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-xl">
                    Permanently removes your profile, primary goal, and all trajectory history from the servers. You will be signed out immediately.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="min-h-11 px-5 rounded-[16px] shrink-0 border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-medium active:scale-[0.98]"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Delete Account"}
                </Button>
              </div>

              {deleteError && (
                <p className="mt-2 text-xs text-destructive flex items-center gap-1.5" role="alert">
                  <AlertTriangle className="size-3.5" />
                  <span>Unable to delete account. Please contact support or try again.</span>
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Reset Progress Alert Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent className="max-w-md rounded-[28px] bg-[#12141A] border border-white/10 text-foreground specular-top">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="size-5" aria-hidden="true" />
              <AlertDialogTitle>Reset all trajectory progress?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground">
              Your primary goal and login account remain intact. Every active and historical task record will be permanently cleared. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="min-h-11 rounded-[16px] border-white/10 bg-[#181B24] hover:bg-white/5 text-xs sm:text-sm text-foreground active:scale-[0.98]">
              Keep my progress
            </AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11 rounded-[16px] bg-rose-600 text-white hover:bg-rose-500 text-xs sm:text-sm active:scale-[0.98]"
              onClick={() => void executeReset()}
            >
              Reset trajectory
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md rounded-[28px] bg-[#12141A] border border-white/10 text-foreground specular-top">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="size-5" aria-hidden="true" />
              <AlertDialogTitle>Permanently delete account?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground">
              This will permanently remove your goal, profile, and all trajectory history. You will be signed out immediately. This cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="min-h-11 rounded-[16px] border-white/10 bg-[#181B24] hover:bg-white/5 text-xs sm:text-sm text-foreground active:scale-[0.98]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11 rounded-[16px] bg-rose-600 text-white hover:bg-rose-500 text-xs sm:text-sm active:scale-[0.98]"
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
