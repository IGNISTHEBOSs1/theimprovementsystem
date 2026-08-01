import { Profiler, ReactNode, ProfilerOnRenderCallback } from 'react';
import { logWarning, PERF_THRESHOLDS_MS } from '@/lib/devDiagnostics';

interface Props {
  id: string;
  children: ReactNode;
}

/**
 * Wraps a subtree in React's built-in <Profiler>, warning when a commit's
 * actual render duration exceeds the render threshold. This is how
 * render-time diagnostics are covered without hand-instrumenting every
 * individual component — React already measures this internally via
 * the Profiler API; we're just reading it out and warning on it.
 *
 * In production this renders children directly with no Profiler wrapper
 * at all (not just a disabled one) — zero overhead.
 */
export function RenderProfiler({ id, children }: Props) {
  if (!import.meta.env.DEV) {
    return <>{children}</>;
  }

  const onRender: ProfilerOnRenderCallback = (profilerId, phase, actualDuration) => {
    if (actualDuration > PERF_THRESHOLDS_MS.render) {
      logWarning(`Render of "${profilerId}" (${phase}) took ${actualDuration.toFixed(1)}ms`, {
        threshold: PERF_THRESHOLDS_MS.render,
        phase,
      });
    }
  };

  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
}
