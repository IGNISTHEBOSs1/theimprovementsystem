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
    description: "Atmospheric Slate & Limestone Canvas — deep obsidian contrast with emerald trajectory",
    swatch: "#090D16",
    vars: {
      dark: {
        "--background":          "222 47% 6%",
        "--foreground":          "210 40% 98%",
        "--card":                "222 38% 10%",
        "--card-elevated":       "222 35% 13%",
        "--popover":             "222 38% 10%",
        "--popover-foreground":  "210 40% 98%",
        "--primary":             "210 40% 98%",
        "--primary-foreground":  "222 47% 6%",
        "--primary-glow":        "210 40% 85%",
        "--secondary":           "222 25% 18%",
        "--secondary-foreground":"210 40% 98%",
        "--accent":              "222 30% 14%",
        "--accent-foreground":   "210 40% 98%",
        "--muted":               "222 25% 12%",
        "--muted-foreground":    "215 20% 65%",
        "--border":              "222 25% 16%",
        "--input":               "222 28% 14%",
        "--ring":                "160 84% 39%",
        "--destructive":         "0 84% 60%",
        "--destructive-foreground": "0 0% 100%",
        "--success":             "160 84% 39%",
        "--success-foreground":  "222 47% 6%",
        "--warning":             "38 92% 50%",
        "--warning-foreground":  "222 47% 6%",
      },
      light: {
        "--background":          "40 20% 97%",
        "--foreground":          "222 25% 10%",
        "--card":                "0 0% 100%",
        "--card-elevated":       "0 0% 100%",
        "--popover":             "0 0% 100%",
        "--popover-foreground":  "222 25% 10%",
        "--primary":             "222 25% 10%",
        "--primary-foreground":  "0 0% 100%",
        "--primary-glow":        "222 25% 25%",
        "--secondary":           "40 12% 91%",
        "--secondary-foreground":"222 25% 10%",
        "--accent":              "40 14% 93%",
        "--accent-foreground":   "222 25% 10%",
        "--muted":               "40 12% 92%",
        "--muted-foreground":    "215 16% 40%",
        "--border":              "40 10% 86%",
        "--input":               "40 10% 86%",
        "--ring":                "160 84% 33%",
        "--destructive":         "0 84% 55%",
        "--destructive-foreground": "0 0% 100%",
        "--success":             "160 84% 33%",
        "--success-foreground":  "0 0% 100%",
        "--warning":             "38 92% 44%",
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

const STORAGE_KEY_THEME = "kinetic-theme";
const STORAGE_KEY_MODE  = "kinetic-mode";

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

  // Update theme-color meta tag for seamless mobile status bar and navigation bar
  const themeColor = resolvedMode === "dark" ? "#090D16" : "#F7F5F0";
  const themeMetas = document.querySelectorAll('meta[name="theme-color"]');
  themeMetas.forEach((meta) => meta.setAttribute("content", themeColor));
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
