import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

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
      className={`glass p-3 rounded-lg border transition-colors ${
        enabled 
          ? 'border-primary/30 hover:border-primary/60' 
          : 'border-muted/30 hover:border-muted/60'
      }`}
      title={enabled ? 'Sound On' : 'Sound Off'}
    >
      {enabled ? (
        <Volume2 className="w-5 h-5 text-primary" />
      ) : (
        <VolumeX className="w-5 h-5 text-muted-foreground" />
      )}
    </motion.button>
  );
};
