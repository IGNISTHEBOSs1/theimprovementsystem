import { motion } from 'framer-motion';
import { Palette, Check } from 'lucide-react';
import { useState } from 'react';
import { AccentTheme, accentThemes } from '@/hooks/useTheme';

interface ThemeSwitcherProps {
  currentAccent: AccentTheme;
  onAccentChange: (accent: AccentTheme) => void;
}

export const ThemeSwitcher = ({ currentAccent, onAccentChange }: ThemeSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="glass w-9 h-9 rounded-xl border border-primary/30 hover:border-primary/60 transition-all flex-center touch-target"
        aria-label="Change theme"
      >
        <Palette className="w-4 h-4 text-primary" />
      </motion.button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 glass-strong rounded-xl p-3 min-w-[180px] border border-primary/20 shadow-[var(--shadow-elevated)]"
          >
            <p className="text-label text-muted-foreground mb-3 px-1">ACCENT THEME</p>
            <div className="space-y-1">
              {accentThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => { onAccentChange(theme.id); setIsOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all group",
                    currentAccent === theme.id ? 'bg-white/8' : 'hover:bg-white/5'
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full flex-shrink-0 transition-all",
                      currentAccent === theme.id ? 'ring-2 ring-offset-1 ring-offset-background ring-white/40 scale-110' : ''
                    )}
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className="text-body-sm text-foreground/80 group-hover:text-foreground flex-1 text-left">{theme.name}</span>
                  {currentAccent === theme.id && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};
