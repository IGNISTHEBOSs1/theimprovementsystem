# Kinetic — Android Distribution, OTA Updates & Maintenance Guide

## 1. Architecture Overview
Kinetic uses a dual-layer architecture:
- **Core Application**: React 18 + Vite 5 + TypeScript + Tailwind CSS, encapsulated in a native Android shell via **Capacitor 6**.
- **Application ID**: `com.kinetic.app`
- **Application Name**: `Kinetic`
- **Primary Backend**: Supabase (Authentication, database, server-authoritative time sync, real-time trajectory).
- **Two Update Layers**:
  1. **Web Over-The-Air (OTA) Updates**: Handled by `@capgo/capacitor-updater` with self-hosted direct HTTPS distribution. Automatically verifies bundle integrity, health-checks via `notifyAppReady()`, and rolls back if a startup crash occurs.
  2. **Native Android APK Updates**: For native changes (plugins, permissions, Android SDKs), an in-app check compares `versionCode` against `/updates/native-release.json`, downloads the APK via HTTPS, and launches the Android system package installer with user consent.

---

## 2. Repeatable Android APK Build Instructions

### Prerequisites
- Node.js >= 18 (Tested on v24.14.0)
- Java Development Kit (JDK) 17 or 21
- Android SDK (API Level 34)

### Step A: Build Web Assets & Sync to Android
From the project root:
```bash
# 1. Build optimized React assets to dist/
npm run build

# 2. Sync web assets, plugins, and configuration to android/
npx cap sync android
```
*(Or run the combined script: `npm run cap:build`)*

### Step B: Generate Debug APK (Installable Directly on Android)
Navigate to the `android/` directory and execute Gradle:
```bash
# On Windows PowerShell:
cd android
.\gradlew.bat assembleDebug

# Output location:
# android/app/build/outputs/apk/debug/app-debug.apk
```
This debug APK can be transferred and installed immediately on any Android phone (enable "Install unknown apps" in Android settings).

### Step C: Generate Signed Release APK
To sign a release APK without exposing keys in Git:
1. Generate your release keystore (once):
```bash
keytool -genkey -v -keystore kinetic-release.keystore -alias kinetic -keyalg RSA -keysize 2048 -validity 10000
```
2. Set the environment variables in your local session (or CI pipeline):
```powershell
$env:KINETIC_KEYSTORE_PATH = "C:\path\to\kinetic-release.keystore"
$env:KINETIC_KEYSTORE_PASSWORD = "YourKeystorePassword"
$env:KINETIC_KEY_ALIAS = "kinetic"
$env:KINETIC_KEY_PASSWORD = "YourKeyPassword"
```
3. Build the release APK:
```bash
cd android
.\gradlew.bat assembleRelease

# Output location:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 3. How to Publish Future OTA Updates (Zero APK Reinstalls)

For regular UI updates, bug fixes, or feature additions that do **not** add new native Android plugins or permissions:

1. Update version number in `package.json` and `public/updates/version.json`.
2. Build the web bundle:
```bash
npm run build
```
3. Package the `dist/` directory into a zip archive:
```powershell
Compress-Archive -Path dist\* -DestinationPath dist-1.0.1.zip -Force
```
4. Compute the SHA-256 checksum:
```powershell
Get-FileHash dist-1.0.1.zip -Algorithm SHA256
```
5. Upload `dist-1.0.1.zip` to your Supabase Storage bucket, GitHub Release asset, or Cloudflare R2 bucket.
6. Update `public/updates/version.json` with the new version, download URL, and checksum:
```json
{
  "version": "1.0.1",
  "buildNumber": 10001,
  "minNativeVersion": "1.0.0",
  "downloadUrl": "https://your-storage-bucket.com/dist-1.0.1.zip",
  "checksum": "YOUR_SHA256_HASH",
  "channel": "production",
  "releaseNotes": "Performance improvements and guidance patterns update.",
  "releasedAt": "2026-11-20T00:00:00Z"
}
```
7. When users open Kinetic, the app checks the manifest in the background, downloads the bundle, and stages it. On the next app launch, the updated bundle activates seamlessly. If the bundle ever crashes or errors out, the native engine automatically rolls back to the previous bundle.

---

## 4. How to Publish Native APK Updates

When you change native Android code, add Capacitor plugins, or update permissions:

1. Increment `versionCode` (e.g. from `10000` to `10001`) and `versionName` in `android/app/build.gradle`.
2. Build the signed release APK (`.\gradlew.bat assembleRelease`).
3. Upload `app-release.apk` to your hosting or GitHub Releases.
4. Update `public/updates/native-release.json`:
```json
{
  "version": "1.1.0",
  "versionCode": 10001,
  "minSupportedVersionCode": 10000,
  "apkUrl": "https://github.com/IGNISTHEBOSs1/theimprovementsystem/releases/download/v1.1.0/kinetic-release.apk",
  "checksumSha256": "YOUR_APK_SHA256_HASH",
  "mandatory": false,
  "releaseNotes": "Native performance upgrades and enhanced hardware taptics.",
  "releasedAt": "2026-12-01T00:00:00Z"
}
```
5. Users opening the Settings screen or launching the app will see the update notification and can trigger the installation with one tap.

---

## 5. Security Invariants & Keystore Safety

- **Rule 1 (Secrets)**: The signing keystore, keystore password, and key alias are strictly excluded from git.
- **Backup Recommendation**:
  1. Store the `.keystore` file in a secure password manager (1Password, Bitwarden, or encrypted hardware storage).
  2. If the release keystore is lost, Android will **refuse** to install in-place updates over existing versions (the user would be forced to uninstall and lose local data).
  3. Never place the `.keystore` inside `public/` or commit it to GitHub.
