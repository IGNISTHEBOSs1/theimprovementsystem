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

export type ThemeName = "Monarch";
export type ThemeMode = "light" | "dark" | "system";

export interface ThemeConfig {
  name: ThemeName;
  description: string;
  swatch: string;
  vars: {
    dark: Record<string, string>;
    light: Record<string, string>;
  };
}

// ── Canonical Theme: Monarch Iris & Obsidian Zinc (Option A) ─────────────────
export const THEMES: Record<ThemeName, ThemeConfig> = {
  Monarch: {
    name: "Monarch",
    description: "Iris & Obsidian Zinc — refined high-agency palette",
    swatch: "#7c66dc",
    vars: {
      dark: {
        "--background":          "240 10% 3.5%", // #09090b deep obsidian zinc
        "--foreground":          "0 0% 98%",
        "--card":                "240 7% 7.5%",  // #121215 refined surface
        "--card-elevated":       "240 6% 10%",   // #19191e elevated surface
        "--popover":             "240 7% 7.5%",
        "--popover-foreground":  "0 0% 98%",
        "--primary":             "252 65% 62%",  // Radix Iris/Violet 9 (#7c66dc)
        "--primary-foreground":  "0 0% 100%",
        "--primary-glow":        "252 70% 70%",
        "--secondary":           "217 91% 60%",
        "--secondary-foreground":"0 0% 100%",
        "--accent":              "45 93% 47%",
        "--accent-foreground":   "0 0% 5%",
        "--muted":               "240 6% 13%",
        "--muted-foreground":    "240 5% 65%",
        "--border":              "240 6% 15%",   // subtle hairline divider
        "--input":               "240 6% 18%",
        "--ring":                "252 65% 62%",
        "--destructive":         "0 84% 60%",
        "--destructive-foreground": "0 0% 100%",
        "--success":             "142 71% 45%",
        "--success-foreground":  "0 0% 100%",
        "--warning":             "38 92% 50%",
        "--warning-foreground":  "0 0% 8%",
      },
      light: {
        "--background":          "240 15% 98.5%", // #fafafa warm porcelain
        "--foreground":          "240 10% 8%",    // #141416 sharp, crisp contrast
        "--card":                "0 0% 100%",     // pure white card
        "--card-elevated":       "0 0% 100%",
        "--popover":             "0 0% 100%",
        "--popover-foreground":  "240 10% 8%",
        "--primary":             "252 65% 54%",   // rich iris violet (5.5:1 on white)
        "--primary-foreground":  "0 0% 100%",
        "--primary-glow":        "252 65% 62%",
        "--secondary":           "217 91% 50%",
        "--secondary-foreground":"0 0% 100%",
        "--accent":              "45 93% 42%",
        "--accent-foreground":   "0 0% 5%",
        "--muted":               "240 10% 94%",
        "--muted-foreground":    "240 5% 45%",   // 4.6:1 WCAG AA text contrast
        "--border":              "240 6% 90%",   // soft subtle hairline, not harsh 58%
        "--input":               "240 6% 85%",   // clear input outline
        "--ring":                "252 65% 54%",
        "--destructive":         "0 84% 60%",
        "--destructive-foreground": "0 0% 100%",
        "--success":             "142 71% 40%",
        "--success-foreground":  "0 0% 100%",
        "--warning":             "38 92% 45%",
        "--warning-foreground":  "0 0% 8%",
      },
    },
  },
};

export const THEME_NAMES: ThemeName[] = ["Monarch"];

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
    try {
      localStorage.setItem(STORAGE_KEY_THEME, next);
    } catch {
      // localStorage may be disabled in private browsing
    }
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY_MODE, next);
    } catch {
      // localStorage may be disabled in private browsing
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, mode, resolvedMode, setTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
