import { useState, useEffect } from 'react';

export type AccentTheme = 'purple' | 'blue' | 'green' | 'red';

interface ThemeState {
  accent: AccentTheme;
}

const THEME_KEY = 'system-theme';

const defaultTheme: ThemeState = {
  accent: 'purple',
};

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeState>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved ? JSON.parse(saved) : defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
    
    // Apply accent theme to document
    document.documentElement.setAttribute('data-accent', theme.accent);
  }, [theme]);

  const setAccent = (accent: AccentTheme) => {
    setTheme(prev => ({ ...prev, accent }));
  };

  return {
    accent: theme.accent,
    setAccent,
  };
};

export const accentThemes: { id: AccentTheme; name: string; color: string }[] = [
  { id: 'purple', name: 'Solo Purple', color: '#9333ea' },
  { id: 'blue', name: 'Cyberpunk Blue', color: '#06b6d4' },
  { id: 'green', name: 'Matrix Green', color: '#22c55e' },
  { id: 'red', name: 'Blood Red', color: '#ef4444' },
];
