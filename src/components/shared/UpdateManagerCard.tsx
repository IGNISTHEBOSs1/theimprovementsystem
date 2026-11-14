import { useState } from "react";
import { RefreshCw, Download, CheckCircle2, AlertCircle, Smartphone, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  checkForOtaUpdate,
  downloadAndStageUpdate,
  isCapacitorNative,
  BASE_WEB_VERSION,
  type OtaManifest,
} from "@/services/otaUpdateService";
import {
  checkForNativeUpdate,
  installNativeUpdate,
  type NativeReleaseManifest,
} from "@/services/nativeUpdateService";
import { soundEngine } from "@/hooks/useSoundEffects";
import { triggerHaptic } from "@/lib/haptics";

export function UpdateManagerCard() {
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [otaAvailable, setOtaAvailable] = useState<OtaManifest | null>(null);
  const [nativeAvailable, setNativeAvailable] = useState<NativeReleaseManifest | null>(null);
  const [stagingOta, setStagingOta] = useState(false);
  const [stagedSuccess, setStagedSuccess] = useState(false);
  const isNative = isCapacitorNative();

  const handleCheck = async () => {
    setChecking(true);
    setStatusMessage(null);
    setOtaAvailable(null);
    setNativeAvailable(null);
    setStagedSuccess(false);
    triggerHaptic("selection");
    soundEngine.playTap();

    try {
      // 1. Check for native APK update first
      const nativeResult = await checkForNativeUpdate();
      if (nativeResult.updateAvailable && nativeResult.availableRelease) {
        setNativeAvailable(nativeResult.availableRelease);
        setStatusMessage(`New Native APK v${nativeResult.availableRelease.version} is available.`);
        setChecking(false);
        return;
      }

      // 2. Check for web OTA update
      const otaResult = await checkForOtaUpdate();
      if (otaResult.available && otaResult.manifest) {
        setOtaAvailable(otaResult.manifest);
        setStatusMessage(`Web update v${otaResult.manifest.version} is available.`);
      } else {
        setStatusMessage("Kinetic is up to date.");
      }
    } catch {
      setStatusMessage("Unable to reach update service. Check network connection.");
    } finally {
      setChecking(false);
    }
  };

  const handleStageOta = async () => {
    if (!otaAvailable) return;
    setStagingOta(true);
    triggerHaptic("selection");
    soundEngine.playConfirmation();

    const result = await downloadAndStageUpdate(otaAvailable);
    setStagingOta(false);

    if (result.success) {
      setStagedSuccess(true);
      triggerHaptic("success");
      soundEngine.playSuccess();
      setStatusMessage(
        `Version ${otaAvailable.version} is staged. It will apply on your next launch, or you can reload now.`
      );
    } else {
      setStatusMessage(`Update download failed: ${result.error ?? "Unknown error"}`);
    }
  };

  const handleInstallApk = async () => {
    if (!nativeAvailable) return;
    triggerHaptic("selection");
    soundEngine.playConfirmation();
    await installNativeUpdate(nativeAvailable.apkUrl);
  };

  const handleReloadNow = () => {
    window.location.reload();
  };

  return (
    <section
      aria-label="Application & Updates"
      className="milled-slab rounded-2xl p-5 sm:p-6 shadow-[var(--shadow-card)] space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold font-sans text-foreground">
              Application & System Updates
            </h2>
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-mono">
              v{BASE_WEB_VERSION}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automatic background updates for web features and independent APK releases for native upgrades.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          {isNative ? (
            <>
              <Smartphone className="size-3.5 text-emerald-500" aria-hidden="true" />
              <span>Android Native</span>
            </>
          ) : (
            <>
              <Globe className="size-3.5 text-primary" aria-hidden="true" />
              <span>Web Canvas</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="space-y-1">
          <p className="text-xs text-foreground font-medium">
            {statusMessage ?? "Check for web improvements or native APK updates."}
          </p>
          <p className="text-[11px] text-muted-foreground">
            OTA updates are verified cryptographically and staged without interrupting active sessions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Default Check Button */}
          {!otaAvailable && !nativeAvailable && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={checking}
              onClick={() => void handleCheck()}
              className="h-10 min-w-[44px] rounded-xl text-xs font-semibold gap-2 border-border/80 active:scale-[0.98]"
            >
              <RefreshCw className={`size-3.5 ${checking ? "animate-spin" : ""}`} aria-hidden="true" />
              <span>{checking ? "Checking…" : "Check for updates"}</span>
            </Button>
          )}

          {/* Action: Staging OTA */}
          {otaAvailable && !stagedSuccess && (
            <Button
              type="button"
              size="sm"
              disabled={stagingOta}
              onClick={() => void handleStageOta()}
              className="h-10 min-w-[44px] rounded-xl text-xs font-semibold gap-2 bg-primary text-primary-foreground active:scale-[0.98]"
            >
              <Download className={`size-3.5 ${stagingOta ? "animate-bounce" : ""}`} aria-hidden="true" />
              <span>{stagingOta ? "Downloading update…" : `Download v${otaAvailable.version}`}</span>
            </Button>
          )}

          {/* Action: Staged Success -> Reload */}
          {stagedSuccess && (
            <Button
              type="button"
              size="sm"
              onClick={handleReloadNow}
              className="h-10 min-w-[44px] rounded-xl text-xs font-semibold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]"
            >
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              <span>Apply & Reload Now</span>
            </Button>
          )}

          {/* Action: Native APK Update */}
          {nativeAvailable && (
            <Button
              type="button"
              size="sm"
              onClick={() => void handleInstallApk()}
              className="h-10 min-w-[44px] rounded-xl text-xs font-semibold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]"
            >
              <Download className="size-3.5" aria-hidden="true" />
              <span>Install APK v{nativeAvailable.version}</span>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
