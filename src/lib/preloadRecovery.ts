/**
 * Preload and Chunk Load Recovery System.
 *
 * Handles Vite chunk/asset preloading errors (vite:preloadError) and
 * dynamic import failures caused by new deployments or stale browser cache.
 */

const RELOAD_KEY = "tis_last_preload_reload";
const RELOAD_COUNT_KEY = "tis_preload_reload_count";
const COOLDOWN_MS = 15000; // 15 seconds cooldown
const MAX_RELOADS_PER_WINDOW = 3;

/**
 * Checks if an error represents a failed chunk, stylesheet, or dynamic script preload.
 */
export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  return (
    lower.includes("dynamically imported module") ||
    lower.includes("unable to preload css") ||
    lower.includes("failed to fetch dynamically imported module") ||
    lower.includes("importing a module script failed") ||
    lower.includes("error loading dynamically imported module") ||
    lower.includes("error loading module") ||
    lower.includes("failed to load module") ||
    lower.includes("failed to fetch") ||
    lower.includes("load failed") ||
    lower.includes("chunkloaderror") ||
    lower.includes("loading chunk")
  );
}

/**
 * Determines whether an automatic reload is safe (i.e. not in an infinite loop).
 */
export function shouldAutoReloadOnChunkError(): boolean {
  try {
    const rawTimestamp = sessionStorage.getItem(RELOAD_KEY);
    const rawCount = sessionStorage.getItem(RELOAD_COUNT_KEY);

    const now = Date.now();
    const lastReload = rawTimestamp ? parseInt(rawTimestamp, 10) : 0;
    const count = rawCount ? parseInt(rawCount, 10) : 0;

    // If cooldown has elapsed, reset count and allow reload
    if (now - lastReload > COOLDOWN_MS) {
      return true;
    }

    // Within cooldown window, allow up to MAX_RELOADS_PER_WINDOW
    return count < MAX_RELOADS_PER_WINDOW;
  } catch {
    // If sessionStorage is unavailable (e.g. strict privacy mode), allow one reload
    return true;
  }
}

/**
 * Executes a guarded reload to refresh the bundle manifest from Cloudflare Pages.
 */
export function triggerGuardedReload(): void {
  try {
    const now = Date.now();
    const rawTimestamp = sessionStorage.getItem(RELOAD_KEY);
    const rawCount = sessionStorage.getItem(RELOAD_COUNT_KEY);

    const lastReload = rawTimestamp ? parseInt(rawTimestamp, 10) : 0;
    const currentCount = rawCount ? parseInt(rawCount, 10) : 0;

    const nextCount = (now - lastReload > COOLDOWN_MS) ? 1 : currentCount + 1;

    sessionStorage.setItem(RELOAD_KEY, String(now));
    sessionStorage.setItem(RELOAD_COUNT_KEY, String(nextCount));
  } catch {
    // Best effort storage
  }

  // Force a page reload from the origin
  window.location.reload();
}

/**
 * Clears reload guard tracking (e.g. when user manually chooses to reset or return to dashboard).
 */
export function clearReloadGuard(): void {
  try {
    sessionStorage.removeItem(RELOAD_KEY);
    sessionStorage.removeItem(RELOAD_COUNT_KEY);
  } catch {
    // Best effort
  }
}

/**
 * Installs the global listener for Vite's preloadError event.
 * Must be invoked at application startup before any dynamic imports occur.
 */
export function initPreloadRecovery(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("vite:preloadError", (event: Event) => {
    // Prevent Vite's default behavior of re-throwing the unhandled error
    event.preventDefault();

    if (shouldAutoReloadOnChunkError()) {
      triggerGuardedReload();
    } else {
      console.warn(
        "[TIS Preload Recovery] Suppressed automatic reload to prevent loop. Chunk preload failure:",
        (event as CustomEvent)?.detail || event
      );
    }
  });
}
