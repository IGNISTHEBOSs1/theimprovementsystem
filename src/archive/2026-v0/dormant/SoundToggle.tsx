import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SoundToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export const SoundToggle = ({ enabled, onToggle }: SoundToggleProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className={cn(
        "glass w-9 h-9 rounded-xl border flex-center transition-all touch-target",
        enabled
          ? 'border-primary/30 hover:border-primary/60'
          : 'border-muted/30 hover:border-muted/60'
      )}
      aria-label={enabled ? 'Mute sound' : 'Enable sound'}
    >
      {enabled ? (
        <Volume2 className="w-4 h-4 text-primary" />
      ) : (
        <VolumeX className="w-4 h-4 text-muted-foreground" />
      )}
    </motion.button>
  );
};
