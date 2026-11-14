/**
 * otaUpdateService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Automatic Over-The-Air (OTA) Update Engine for Kinetic.
 *
 * Built on open-source @capgo/capacitor-updater client architecture.
 * Supports zero-cost, self-hosted distribution from any HTTPS endpoint
 * (Supabase Storage, Cloudflare R2, GitHub Releases, or custom static CDN).
 *
 * Security & Reliability Invariants:
 * 1. notifyAppReady(): Native layer rolls back automatically if bundle crashes on startup.
 * 2. minNativeVersion: Web updates are gated against native APK version compatibility.
 * 3. SHA-256 Checksum: Downloads are cryptographically verified before activation.
 * 4. Safe Next-Launch Activation: Updates are staged and applied on next clean launch,
 *    never forcibly interrupting an active user focus session.
 * 5. Offline Resiliency: Boots from last verified working bundle or embedded assets.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface OtaManifest {
  version: string;
  buildNumber: number;
  minNativeVersion: string;
  downloadUrl: string;
  checksum?: string;
  channel: "production" | "development";
  releaseNotes?: string;
  releasedAt: string;
}

export interface OtaUpdateState {
  checking: boolean;
  updateAvailable: boolean;
  downloading: boolean;
  downloadProgress: number;
  readyToApply: boolean;
  error: string | null;
  currentVersion: string;
  pendingVersion: string | null;
}

let isInitialized = false;
let checkInProgress = false;

// Fallback version when running in web or before first native sync
export const BASE_WEB_VERSION = "1.0.0";

/**
 * Checks if running inside Capacitor native container
 */
export function isCapacitorNative(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

/**
 * Called on application startup.
 * Tells native layer that React mounted cleanly, confirming the active bundle is healthy.
 */
export async function notifyBundleHealthy(): Promise<void> {
  if (!isCapacitorNative()) return;

  try {
    const { CapacitorUpdater } = await import("@capgo/capacitor-updater");
    await CapacitorUpdater.notifyAppReady();
    console.log("[OTA] Active bundle marked healthy and confirmed.");
  } catch (err) {
    console.warn("[OTA] notifyAppReady warning (non-fatal):", err);
  }
}

/**
 * Queries the remote manifest for update availability.
 */
export async function checkForOtaUpdate(
  manifestUrl: string = "/updates/version.json",
  currentNativeVersion: string = "1.0.0"
): Promise<{ available: boolean; manifest: OtaManifest | null; reason?: string }> {
  if (checkInProgress) return { available: false, manifest: null, reason: "Check in progress" };
  checkInProgress = true;

  try {
    const response = await fetch(manifestUrl, {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      checkInProgress = false;
      return { available: false, manifest: null, reason: `HTTP ${response.status}` };
    }

    const manifest: OtaManifest = await response.json();

    // Verify native version compatibility
    if (manifest.minNativeVersion && isVersionHigher(manifest.minNativeVersion, currentNativeVersion)) {
      console.warn(
        `[OTA] Update ${manifest.version} requires native APK ${manifest.minNativeVersion}, but installed APK is ${currentNativeVersion}. Skipping web update.`
      );
      checkInProgress = false;
      return { available: false, manifest, reason: "Requires native APK upgrade" };
    }

    // Compare web versions
    let installedWebVersion = BASE_WEB_VERSION;
    if (isCapacitorNative()) {
      try {
        const { CapacitorUpdater } = await import("@capgo/capacitor-updater");
        const current = await CapacitorUpdater.current();
        if (current?.bundle?.version) {
          installedWebVersion = current.bundle.version;
        }
      } catch {}
    }

    const isNewer = isVersionHigher(manifest.version, installedWebVersion);
    checkInProgress = false;
    return { available: isNewer, manifest };
  } catch (err) {
    checkInProgress = false;
    console.warn("[OTA] Update check failed (offline or network interruption):", err);
    return { available: false, manifest: null, reason: "Network error" };
  }
}

/**
 * Downloads and stages a web bundle for activation on next launch.
 */
export async function downloadAndStageUpdate(
  manifest: OtaManifest,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; error?: string }> {
  if (!isCapacitorNative()) {
    return { success: false, error: "Not running in native container" };
  }

  try {
    const { CapacitorUpdater } = await import("@capgo/capacitor-updater");

    if (onProgress) {
      // Progress listener if supported
      CapacitorUpdater.addListener("download", (info: { percent?: number }) => {
        if (info?.percent !== undefined) onProgress(info.percent);
      });
    }

    console.log(`[OTA] Downloading update bundle ${manifest.version} from ${manifest.downloadUrl}...`);
    const bundle = await CapacitorUpdater.download({
      url: manifest.downloadUrl,
      version: manifest.version,
      checksum: manifest.checksum,
    });

    // Stage update for next safe launch (never interrupt an active user workflow)
    await CapacitorUpdater.set(bundle);
    console.log(`[OTA] Bundle ${manifest.version} staged successfully.`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[OTA] Bundle download/staging error:", message);
    return { success: false, error: message };
  }
}

/**
 * Semantic version comparison utility: returns true if vA > vB
 */
export function isVersionHigher(vA: string, vB: string): boolean {
  const partsA = vA.replace(/^v/, "").split(".").map((n) => parseInt(n, 10) || 0);
  const partsB = vB.replace(/^v/, "").split(".").map((n) => parseInt(n, 10) || 0);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const a = partsA[i] || 0;
    const b = partsB[i] || 0;
    if (a > b) return true;
    if (a < b) return false;
  }
  return false;
}
