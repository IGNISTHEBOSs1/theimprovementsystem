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
    "I arise from nothing. I will become everything.",
    "The system chose you. Now you must choose to become worthy of it.",
    "Every hunter started as prey. The difference is who refused to stay that way.",
    "Pain is temporary. Rank is permanent.",
    "You were not given a weak body. You were given a weak mindset. Fix it.",
    "E-Rank today. S-Rank tomorrow. The path is yours alone.",
    "The gates don't open for the unprepared. Neither does your potential.",
    "Arise, Hunter. The dungeon awaits.",
    "Your past self set the bar. Your future self is watching.",
    "No one is coming to save you. Level up or stay behind.",
    "Comfort is the enemy of growth. Discomfort is the price of power.",
    "The only rank that matters is the one you're fighting to reach.",
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
    "Streak unbroken. Will unbroken. Identity unbroken.",
    "The hunter who trains every day becomes the one others fear.",
    "One day of missed training is forgiven. Two is a habit. Three is who you are.",
    "Your streak is the truest measure of who you really are.",
    "Miss once — it happens. Miss twice — it's a choice. Miss three times — it's your character.",
    "Champions don't skip days. Neither do hunters who want to survive.",
    "The fire of discipline burns hotter than the chaos of mediocrity.",
    "Your future self is built one completed habit at a time.",
    "A routine without discipline is just a wish.",
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
    "Every quest completed is a monster defeated.",
    "The weakest hunter who finishes their quests beats the strongest who doesn't start.",
    "You're not behind. You're just getting started.",
    "Difficulty: Hard. Reward: Becoming someone who can do Hard things.",
    "The quest doesn't get easier. You get stronger.",
    "Done is better than perfect. Perfect is better than abandoned.",
    "Finish today's quests. Your future self will thank you.",
    "Each completed quest writes a line in your legend.",
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
    return sectionQuotes[Math.floor(Math.random() * sectionQuotes.length)];
  };

  useEffect(() => { setQuote(getRandomQuote()); }, [section]);

  const refreshQuote = () => { setKey(p => p + 1); setQuote(getRandomQuote()); };

  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4 border border-primary/15 flex items-start gap-3 hover:border-primary/25 transition-all duration-250 top-light relative overflow-hidden"
    >
      <Quote className="w-4 h-4 text-primary/60 shrink-0 mt-0.5" />
      <p className="text-body-sm text-muted-foreground italic flex-1 leading-relaxed">"{quote}"</p>
      <button onClick={refreshQuote} className="text-muted-foreground hover:text-primary transition-colors shrink-0 touch-target flex-center" aria-label="New quote">
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};
