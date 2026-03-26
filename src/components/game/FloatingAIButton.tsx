import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FloatingAIButtonProps {
  onClick: () => void;
}

export const FloatingAIButton = ({ onClick }: FloatingAIButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={onClick}
            className="fixed bottom-[76px] md:bottom-6 right-4 md:right-6 z-[60] w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 flex-center relative overflow-hidden animate-glow-pulse"
            aria-label="Open AI Assistant"
          >
            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-primary/50"
              animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <Bot className="w-6 h-6 text-white relative z-10" />
            {/* Sparkle badge */}
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex-center border border-black/20"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-[8px]">✦</span>
            </motion.div>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="left">AI Assistant</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
