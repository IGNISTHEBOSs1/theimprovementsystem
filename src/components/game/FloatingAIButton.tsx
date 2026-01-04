import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingAIButtonProps {
  onClick: () => void;
}

export const FloatingAIButton = ({ onClick }: FloatingAIButtonProps) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
      className="fixed bottom-6 right-6 z-[60]"
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={onClick}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow p-0 relative overflow-hidden"
        >
          {/* Animated glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/50"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          {/* Icon */}
          <Bot className="w-6 h-6 text-white relative z-10" />
          
          {/* Sparkle indicator */}
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            <Sparkles className="w-2.5 h-2.5 text-white" />
          </motion.div>
        </Button>
      </motion.div>
    </motion.div>
  );
};
