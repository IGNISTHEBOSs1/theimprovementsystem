import { useEffect } from "react";

// Founder Decision (Mobile usability diagnostic chunk): dev-only,
// console-only instrumentation to catch a specific reported contradiction
// — a narrow viewport rendering the desktop nav rail instead of the
// mobile dock, in a real deployed build where the compiled CSS itself
// was already verified correct. Gated entirely on import.meta.env.DEV,
// which Vite resolves at build time — in a production build the `if`
// below is statically false, so this module's effect body is dead-code
// eliminated, not merely hidden behind a runtime flag. It never renders
// anything (always returns null) and never sets any class, state, or
// style; it only reads window.innerWidth/innerHeight and matchMedia, and
// only calls console.log/console.error. It cannot change layout
// behavior, by construction, not just by convention.
//
// "Which nav mode is active" is derived from matchMedia("(min-width:
// 768px)") — the exact 768px breakpoint Tailwind's `md:` prefix compiles
// to (confirmed against tailwind.config.ts: no `theme.screens` override
// exists, only the unrelated `container.screens` max-width setting) —
// not a guessed or hardcoded reimplementation of the breakpoint. If
// matchMedia disagrees with what window.innerWidth would suggest, that
// disagreement IS the diagnostic signal; this code doesn't try to
// resolve or correct it, only surface it.
const MD_BREAKPOINT_QUERY = "(min-width: 768px)";

export function ViewportNavDiagnostic() {
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const mql = window.matchMedia(MD_BREAKPOINT_QUERY);

    const report = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const desktopRailActive = mql.matches;
      const navMode = desktopRailActive ? "desktop" : "mobile";

      // eslint-disable-next-line no-console
      console.log(
        `[nav-diagnostic] ${width}x${height} — nav mode: ${navMode} (matchMedia "${MD_BREAKPOINT_QUERY}" = ${desktopRailActive})`,
      );

      // The specific contradiction under investigation: a phone-width
      // viewport with the desktop rail nonetheless active. 768px itself
      // is intentionally excluded — right at the boundary isn't a
      // contradiction, it's just which side of it the browser rounds to.
      if (width < 768 && desktopRailActive) {
        // eslint-disable-next-line no-console
        console.error(
          `[nav-diagnostic] MISMATCH: viewport is ${width}px wide (phone-width) but the desktop nav rail is active ` +
          `(matchMedia("${MD_BREAKPOINT_QUERY}").matches = true despite window.innerWidth = ${width}). ` +
          `This means the browser's CSS layout viewport does not match window.innerWidth here — check for ` +
          `"Request desktop site", a page-zoom setting, or an iframe/embedding context with a different layout viewport ` +
          `than the physical screen.`,
        );
      }
    };

    report();
    mql.addEventListener("change", report);
    window.addEventListener("resize", report);
    return () => {
      mql.removeEventListener("change", report);
      window.removeEventListener("resize", report);
    };
  }, []);

  return null;
}
