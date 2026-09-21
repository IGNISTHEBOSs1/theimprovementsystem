import React, { ComponentType, lazy } from "react";
import { isChunkLoadError, shouldAutoReloadOnChunkError, triggerGuardedReload } from "./preloadRecovery";

/**
 * Wraps a dynamic module import with retry logic and automated recovery
 * for stale chunk 404s after new deployments.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 2,
  delayMs = 600
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await componentImport();
      } catch (err) {
        lastError = err;

        // If this is a chunk load error (e.g. 404 on a hashed chunk from a prior deployment)
        if (isChunkLoadError(err)) {
          if (shouldAutoReloadOnChunkError()) {
            triggerGuardedReload();
            // Return an unresolved promise to keep React suspended with spinner
            // while the browser navigates/reloads, avoiding an error screen flash
            return new Promise<{ default: T }>(() => {});
          }
          // If reload limit exceeded, break early and surface error to boundary
          break;
        }

        // For non-chunk network glitches, wait briefly before retrying
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
        }
      }
    }

    throw lastError;
  });
}
