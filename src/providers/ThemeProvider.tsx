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

// ── Canonical Theme: Monochrome Palette ─────────────────────────────────────
export const THEMES: Record<ThemeName, ThemeConfig> = {
  Monarch: {
    name: "Monarch",
    description: "Monochrome Canvas — refined high-contrast graphite & porcelain palette",
    swatch: "#171717",
    vars: {
      dark: {
        "--background":          "0 0% 4%",
        "--foreground":          "0 0% 98%",
        "--card":                "0 0% 8%",
        "--card-elevated":       "0 0% 10%",
        "--popover":             "0 0% 8%",
        "--popover-foreground":  "0 0% 98%",
        "--primary":             "0 0% 98%",
        "--primary-foreground":  "0 0% 6%",
        "--primary-glow":        "0 0% 85%",
        "--secondary":           "0 0% 88%",
        "--secondary-foreground":"0 0% 6%",
        "--accent":              "0 0% 14%",
        "--accent-foreground":   "0 0% 98%",
        "--muted":               "0 0% 12%",
        "--muted-foreground":    "0 0% 64%",
        "--border":              "0 0% 16%",
        "--input":               "0 0% 18%",
        "--ring":                "0 0% 80%",
        "--destructive":         "0 0% 80%",
        "--destructive-foreground": "0 0% 0%",
        "--success":             "142 72% 50%",
        "--success-foreground":  "0 0% 10%",
        "--warning":             "0 0% 85%",
        "--warning-foreground":  "0 0% 0%",
      },
      light: {
        "--background":          "60 2% 98%",
        "--foreground":          "0 0% 9%",
        "--card":                "0 0% 100%",
        "--card-elevated":       "0 0% 100%",
        "--popover":             "0 0% 100%",
        "--popover-foreground":  "0 0% 9%",
        "--primary":             "0 0% 9%",
        "--primary-foreground":  "0 0% 100%",
        "--primary-glow":        "0 0% 25%",
        "--secondary":           "0 0% 20%",
        "--secondary-foreground":"0 0% 100%",
        "--accent":              "0 0% 93%",
        "--accent-foreground":   "0 0% 9%",
        "--muted":               "0 0% 93%",
        "--muted-foreground":    "0 0% 45%",
        "--border":              "0 0% 88%",
        "--input":               "0 0% 88%",
        "--ring":                "0 0% 20%",
        "--destructive":         "0 0% 20%",
        "--destructive-foreground": "0 0% 100%",
        "--success":             "142 76% 36%",
        "--success-foreground":  "0 0% 100%",
        "--warning":             "0 0% 25%",
        "--warning-foreground":  "0 0% 100%",
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

  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('mode') as ThemeMode | null;
      if (q && ["light", "dark", "system"].includes(q)) return q;
    }
    return readStored(STORAGE_KEY_MODE, defaultMode, ["light", "dark", "system"] as ThemeMode[]);
  });

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
