import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, RefreshCw } from 'lucide-react';

const quotes: Record<string, string[]> = {
  awakening: [
    "The only way to do great work is to love what you do. — Steve Jobs",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Don't stop when you're tired. Stop when you're done.",
    "Wake up with determination. Go to bed with satisfaction.",
    "The key to success is to focus on goals, not obstacles.",
  ],
  habits: [
    "We are what we repeatedly do. Excellence is not an act, but a habit. — Aristotle",
    "Small daily improvements are the key to staggering long-term results.",
    "Motivation gets you started. Habit keeps you going.",
    "The secret of your future is hidden in your daily routine.",
    "You'll never change your life until you change something you do daily.",
    "Consistency is what transforms average into excellence.",
    "Success is the sum of small efforts repeated day in and day out.",
    "First we make our habits, then our habits make us.",
    "Discipline is choosing between what you want now and what you want most.",
    "A habit cannot be tossed out the window; it must be coaxed down the stairs one step at a time.",
  ],
  quests: [
    "The journey of a thousand miles begins with a single step. — Lao Tzu",
    "Every accomplishment starts with the decision to try.",
    "It does not matter how slowly you go as long as you do not stop. — Confucius",
    "The only impossible journey is the one you never begin.",
    "Action is the foundational key to all success. — Pablo Picasso",
    "Don't wait for opportunity. Create it.",
    "A goal without a plan is just a wish.",
    "Focus on being productive instead of busy.",
    "Work hard in silence, let your success be your noise.",
    "The way to get started is to quit talking and begin doing. — Walt Disney",
  ],
};

interface MotivationQuoteProps {
  section: 'awakening' | 'habits' | 'quests';
}

export const MotivationQuote = ({ section }: MotivationQuoteProps) => {
  const [quote, setQuote] = useState('');
  const [key, setKey] = useState(0);

  const getRandomQuote = () => {
    const sectionQuotes = quotes[section] || quotes.awakening;
    const randomIndex = Math.floor(Math.random() * sectionQuotes.length);
    return sectionQuotes[randomIndex];
  };

  useEffect(() => {
    setQuote(getRandomQuote());
  }, [section]);

  const refreshQuote = () => {
    setKey(prev => prev + 1);
    setQuote(getRandomQuote());
  };

  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4 border border-white/10 flex items-start gap-3"
    >
      <Quote className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <p className="text-sm text-muted-foreground italic flex-1">
        "{quote}"
      </p>
      <button
        onClick={refreshQuote}
        className="text-muted-foreground hover:text-primary transition-colors shrink-0"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
