/**
 * ThemeProvider.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages theme (Monarch | Sage | Ocean | Ember | Legacy) and
 * mode (light | dark | system).
 *
 * Applies both by writing CSS custom properties to :root and setting
 * data-theme + data-mode on <html>. Does NOT touch Tailwind's dark class —
 * that is handled separately via the mode logic below.
 *
 * The existing data-accent system in index.css is preserved and untouched.
 * This provider adds a parallel data-theme attribute for the new theme set.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ThemeName = "Monarch" | "Sage" | "Ocean" | "Ember" | "Legacy";
export type ThemeMode = "light" | "dark" | "system";

export interface ThemeConfig {
  name: ThemeName;
  /** Description shown in the picker */
  description: string;
  /** Swatch color for UI */
  swatch: string;
  /** CSS custom property overrides applied when this theme is active.
   *  Written directly to :root — values use HSL without the hsl() wrapper
   *  to match the existing shadcn/ui convention in index.css. */
  vars: {
    dark: Record<string, string>;
    light: Record<string, string>;
  };
}

// ── Theme definitions ─────────────────────────────────────────────────────────

export const THEMES: Record<ThemeName, ThemeConfig> = {
  /**
   * Monarch — deep violet, the default Solo Leveling-inspired palette.
   * Matches the existing purple accent in index.css.
   */
  Monarch: {
    name: "Monarch",
    description: "Deep violet — the default hunter palette",
    swatch: "#7c3aed",
    vars: {
      dark: {
        "--background":          "0 0% 2%",
        "--foreground":          "0 0% 95%",
        "--card":                "0 0% 6.5%",
        "--card-elevated":       "0 0% 8%",
        "--primary":             "270 91% 55%",
        "--primary-foreground":  "0 0% 100%",
        "--primary-glow":        "270 91% 65%",
        "--secondary":           "217 91% 60%",
        "--accent":              "45 93% 47%",
        "--muted":               "0 0% 12%",
        "--muted-foreground":    "0 0% 60%",
        "--border":              "0 0% 15%",
        "--ring":                "270 91% 55%",
      },
      light: {
        "--background":          "270 20% 98%",
        "--foreground":          "270 10% 10%",
        "--card":                "0 0% 100%",
        "--card-elevated":       "270 15% 96%",
        "--primary":             "270 91% 50%",
        "--primary-foreground":  "0 0% 100%",
        "--primary-glow":        "270 91% 60%",
        "--secondary":           "217 91% 55%",
        "--accent":              "45 93% 42%",
        "--muted":               "270 15% 92%",
        "--muted-foreground":    "270 10% 45%",
        "--border":              "270 15% 85%",
        "--ring":                "270 91% 50%",
      },
    },
  },

  /**
   * Sage — muted greens and warm neutrals. Calm, focused, minimal.
   * For users who want progress without the dark aesthetic.
   */
  Sage: {
    name: "Sage",
    description: "Muted greens — calm and focused",
    swatch: "#4ade80",
    vars: {
      dark: {
        "--background":          "150 8% 5%",
        "--foreground":          "150 10% 92%",
        "--card":                "150 7% 9%",
        "--card-elevated":       "150 7% 11%",
        "--primary":             "142 60% 45%",
        "--primary-foreground":  "0 0% 100%",
        "--primary-glow":        "142 60% 55%",
        "--secondary":           "168 55% 40%",
        "--accent":              "84 60% 50%",
        "--muted":               "150 8% 14%",
        "--muted-foreground":    "150 8% 58%",
        "--border":              "150 8% 18%",
        "--ring":                "142 60% 45%",
      },
      light: {
        "--background":          "120 20% 98%",
        "--foreground":          "150 15% 12%",
        "--card":                "0 0% 100%",
        "--card-elevated":       "120 15% 95%",
        "--primary":             "142 55% 38%",
        "--primary-foreground":  "0 0% 100%",
        "--primary-glow":        "142 55% 48%",
        "--secondary":           "168 50% 35%",
        "--accent":              "84 55% 42%",
        "--muted":               "120 15% 90%",
        "--muted-foreground":    "150 12% 42%",
        "--border":              "120 15% 82%",
        "--ring":                "142 55% 38%",
      },
    },
  },

  /**
   * Ocean — deep blues and teals. Clear-headed, expansive.
   */
  Ocean: {
    name: "Ocean",
    description: "Deep blues — clear and expansive",
    swatch: "#0ea5e9",
    vars: {
      dark: {
        "--background":          "215 30% 4%",
        "--foreground":          "210 20% 93%",
        "--card":                "215 25% 8%",
        "--card-elevated":       "215 25% 10%",
        "--primary":             "199 89% 48%",
        "--primary-foreground":  "0 0% 100%",
        "--primary-glow":        "199 89% 58%",
        "--secondary":           "186 90% 40%",
        "--accent":              "172 66% 50%",
        "--muted":               "215 20% 14%",
        "--muted-foreground":    "215 15% 58%",
        "--border":              "215 20% 18%",
        "--ring":                "199 89% 48%",
      },
      light: {
        "--background":          "210 40% 98%",
        "--foreground":          "215 25% 10%",
        "--card":                "0 0% 100%",
        "--card-elevated":       "210 30% 95%",
        "--primary":             "199 85% 42%",
        "--primary-foreground":  "0 0% 100%",
        "--primary-glow":        "199 85% 52%",
        "--secondary":           "186 85% 36%",
        "--accent":              "172 60% 42%",
        "--muted":               "210 25% 90%",
        "--muted-foreground":    "215 18% 42%",
        "--border":              "210 25% 82%",
        "--ring":                "199 85% 42%",
      },
    },
  },

  /**
   * Ember — warm ambers and deep browns. Grounded, relentless.
   */
  Ember: {
    name: "Ember",
    description: "Warm ambers — grounded and relentless",
    swatch: "#f97316",
    vars: {
      dark: {
        "--background":          "20 15% 4%",
        "--foreground":          "30 20% 93%",
        "--card":                "20 12% 8%",
        "--card-elevated":       "20 12% 10%",
        "--primary":             "25 95% 55%",
        "--primary-foreground":  "0 0% 100%",
        "--primary-glow":        "25 95% 65%",
        "--secondary":           "15 90% 50%",
        "--accent":              "45 90% 55%",
        "--muted":               "20 10% 14%",
        "--muted-foreground":    "25 12% 58%",
        "--border":              "20 12% 18%",
        "--ring":                "25 95% 55%",
      },
      light: {
        "--background":          "30 30% 98%",
        "--foreground":          "20 20% 10%",
        "--card":                "0 0% 100%",
        "--card-elevated":       "30 20% 95%",
        "--primary":             "25 90% 48%",
        "--primary-foreground":  "0 0% 100%",
        "--primary-glow":        "25 90% 58%",
        "--secondary":           "15 85% 44%",
        "--accent":              "45 85% 48%",
        "--muted":               "30 20% 90%",
        "--muted-foreground":    "25 14% 42%",
        "--border":              "30 20% 82%",
        "--ring":                "25 90% 48%",
      },
    },
  },

  /**
   * Legacy — warm gold accent on deep neutral surface.
   * Dark: #171717 surface, #FAFAFA text, #D4AF37 gold accent.
   * For users who want zero gamification aesthetic with a timeless finish.
   */
  Legacy: {
    name: "Legacy",
    description: "Gold on charcoal — timeless and zero distraction",
    swatch: "#D4AF37",
    vars: {
      dark: {
        "--background":          "0 0% 9%",       /* #171717 */
        "--foreground":          "0 0% 98%",       /* #FAFAFA */
        "--card":                "0 0% 11%",
        "--card-elevated":       "0 0% 13%",
        "--primary":             "43 65% 51%",     /* #D4AF37 */
        "--primary-foreground":  "0 0% 9%",
        "--primary-glow":        "43 65% 61%",
        "--secondary":           "43 40% 45%",
        "--accent":              "43 65% 51%",
        "--muted":               "0 0% 16%",
        "--muted-foreground":    "0 0% 58%",
        "--border":              "0 0% 20%",
        "--ring":                "43 65% 51%",
      },
      light: {
        "--background":          "0 0% 99%",
        "--foreground":          "0 0% 8%",
        "--card":                "0 0% 100%",
        "--card-elevated":       "0 0% 96%",
        "--primary":             "43 65% 38%",     /* darker gold for light bg */
        "--primary-foreground":  "0 0% 100%",
        "--primary-glow":        "43 65% 48%",
        "--secondary":           "43 40% 35%",
        "--accent":              "43 65% 38%",
        "--muted":               "0 0% 92%",
        "--muted-foreground":    "0 0% 45%",
        "--border":              "0 0% 84%",
        "--ring":                "43 65% 38%",
      },
    },
  },
};

export const THEME_NAMES = Object.keys(THEMES) as ThemeName[];

// ── Context ───────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme: ThemeName;
  mode: ThemeMode;
  /** Resolved mode — never 'system', always 'light' or 'dark' */
  resolvedMode: "light" | "dark";
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used inside ThemeProvider");
  return ctx;
}

// ── Storage helpers ───────────────────────────────────────────────────────────

const STORAGE_KEY_THEME = "tis-theme";
const STORAGE_KEY_MODE  = "tis-mode";

function readStored<T>(key: string, fallback: T, valid: T[]): T {
  try {
    const v = localStorage.getItem(key) as T | null;
    return v && valid.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

// ── CSS variable application ──────────────────────────────────────────────────

function applyTheme(theme: ThemeName, resolvedMode: "light" | "dark") {
  const vars = THEMES[theme].vars[resolvedMode];
  const root = document.documentElement;

  // Write CSS variables
  for (const [prop, value] of Object.entries(vars)) {
    root.style.setProperty(prop, value);
  }

  // Set data attributes for CSS selectors
  root.setAttribute("data-theme", theme.toLowerCase());

  // Tailwind dark mode — add/remove the 'dark' class
  if (resolvedMode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

function resolveMode(mode: ThemeMode): "light" | "dark" {
  if (mode !== "system") return mode;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// ── Provider ──────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeName;
  defaultMode?: ThemeMode;
}

export function ThemeProvider({
  children,
  defaultTheme = "Monarch",
  defaultMode  = "dark",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeName>(() =>
    readStored(STORAGE_KEY_THEME, defaultTheme, THEME_NAMES)
  );

  const [mode, setModeState] = useState<ThemeMode>(() =>
    readStored(STORAGE_KEY_MODE, defaultMode, ["light", "dark", "system"] as ThemeMode[])
  );

  const resolvedMode = resolveMode(mode);

  // Apply on mount and whenever theme/mode changes
  useEffect(() => {
    applyTheme(theme, resolvedMode);
  }, [theme, resolvedMode]);

  // Listen for system preference changes when mode === 'system'
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(theme, resolveMode("system"));
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode, theme]);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    try { localStorage.setItem(STORAGE_KEY_THEME, next); } catch {}
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try { localStorage.setItem(STORAGE_KEY_MODE, next); } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, mode, resolvedMode, setTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
