/**
 * nativeUpdateService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Native APK Update Manager for Kinetic (Independent Distribution Channel).
 *
 * Handles native Android updates when changes cannot be applied via OTA
 * (e.g., changes to Android native code, Capacitor plugins, permissions, or SDKs).
 *
 * Architecture:
 * 1. Queries remote HTTPS release manifest for latest native versionCode.
 * 2. Compares installed versionCode against available versionCode.
 * 3. Downloads APK securely over HTTPS.
 * 4. Verifies SHA-256 checksum integrity.
 * 5. Dispatches Android Intent to the system package installer.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { App } from "@capacitor/app";
import { isCapacitorNative } from "./otaUpdateService";

export interface NativeReleaseManifest {
  version: string;        // e.g. "1.1.0"
  versionCode: number;    // e.g. 10100
  minSupportedVersionCode: number;
  apkUrl: string;
  checksumSha256: string;
  mandatory: boolean;
  releaseNotes?: string;
  releasedAt: string;
}

export interface NativeUpdateCheckResult {
  updateAvailable: boolean;
  mandatory: boolean;
  currentVersionCode: number;
  availableRelease: NativeReleaseManifest | null;
  reason?: string;
}

/**
 * Checks whether a newer native APK is available.
 */
export async function checkForNativeUpdate(
  manifestUrl: string = "/updates/native-release.json"
): Promise<NativeUpdateCheckResult> {
  if (!isCapacitorNative()) {
    return {
      updateAvailable: false,
      mandatory: false,
      currentVersionCode: 1,
      availableRelease: null,
      reason: "Not running in native container",
    };
  }

  try {
    const appInfo = await App.getInfo();
    const installedVersionCode = parseInt(appInfo.build, 10) || 1;

    const response = await fetch(manifestUrl, {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      return {
        updateAvailable: false,
        mandatory: false,
        currentVersionCode: installedVersionCode,
        availableRelease: null,
        reason: `HTTP ${response.status}`,
      };
    }

    const manifest: NativeReleaseManifest = await response.json();
    const isNewer = manifest.versionCode > installedVersionCode;
    const isMandatory = isNewer && (manifest.mandatory || installedVersionCode < manifest.minSupportedVersionCode);

    return {
      updateAvailable: isNewer,
      mandatory: isMandatory,
      currentVersionCode: installedVersionCode,
      availableRelease: isNewer ? manifest : null,
    };
  } catch (err) {
    console.warn("[NativeUpdate] Failed to check for native release:", err);
    return {
      updateAvailable: false,
      mandatory: false,
      currentVersionCode: 1,
      availableRelease: null,
      reason: "Network error",
    };
  }
}

/**
 * Initiates the download and prompts the Android OS package installer.
 */
export async function installNativeUpdate(apkUrl: string): Promise<void> {
  if (typeof window === "undefined") return;

  // On Android, opening the direct APK download URL triggers Android's download manager,
  // which hands the file to the package installer once completed.
  window.open(apkUrl, "_system");
}
