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
        className="glass p-3 rounded-lg border border-primary/30 hover:border-primary/60 transition-colors"
      >
        <Palette className="w-5 h-5 text-primary" />
      </motion.button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 z-50 glass-strong rounded-lg p-3 min-w-[200px] border border-primary/20"
          >
            <p className="text-xs text-muted-foreground mb-3 font-display tracking-wider">
              ACCENT THEME
            </p>
            <div className="space-y-2">
              {accentThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    onAccentChange(theme.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors group"
                >
                  <div 
                    className={`w-5 h-5 rounded-full transition-all ${currentAccent === theme.id ? 'ring-2 ring-offset-2 ring-offset-background' : ''}`}
                    style={{ 
                      backgroundColor: theme.color
                    }}
                  />
                  <span className="text-sm text-foreground/80 group-hover:text-foreground flex-1 text-left">
                    {theme.name}
                  </span>
                  {currentAccent === theme.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};
