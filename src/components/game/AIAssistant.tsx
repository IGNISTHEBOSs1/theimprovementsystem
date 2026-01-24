import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { GameState } from '@/hooks/useGameState';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

// Validation schemas for AI-generated data
const questSchema = z.object({
  title: z.string().min(1).max(100),
  difficulty: z.enum(['Easy', 'Normal', 'Hard', 'Urgent']).optional().default('Normal'),
  xpReward: z.number().int().min(0).max(500).optional().default(30),
  creditReward: z.number().int().min(0).max(200).optional().default(10),
  timeFrame: z.string().max(50).optional().default('Today'),
});

const habitSchema = z.object({
  name: z.string().min(1).max(100),
  winXp: z.number().int().min(1).max(100).optional().default(15),
  loseXp: z.number().int().min(1).max(100).optional().default(10),
});

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  gameState?: GameState;
  onAddQuest?: (quest: { title: string; difficulty: 'Easy' | 'Normal' | 'Hard' | 'Urgent'; xpReward: number; creditReward: number; timeFrame: string }) => void;
  onAddHabit?: (habit: { name: string; icon: string; winXp: number; loseXp: number }) => void;
}

const QUICK_PROMPTS = [
  { label: '📋 Create Daily Tasks', prompt: 'Create 5 realistic daily tasks for me based on my current progress' },
  { label: '🎯 New Habit', prompt: 'I want to start a new habit for better discipline. What do you suggest?' },
  { label: '💪 Workout Plan', prompt: 'Give me a quick 30-minute workout routine I can do today' },
  { label: '🔮 My Future Plans', prompt: 'Based on my progress and habits, what should be my future plans?' },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

// Parse AI response for action blocks with schema validation
const parseAIActions = (content: string) => {
  const questMatch = content.match(/```quest\s*([\s\S]*?)\s*```/);
  const habitMatch = content.match(/```habit\s*([\s\S]*?)\s*```/);
  
  let quest: z.infer<typeof questSchema> | null = null;
  let habit: z.infer<typeof habitSchema> | null = null;
  
  if (questMatch) {
    try {
      const parsed = JSON.parse(questMatch[1]);
      const result = questSchema.safeParse(parsed);
      if (result.success) {
        quest = result.data;
      } else {
        console.error('Invalid quest schema:', result.error.format());
      }
    } catch (e) {
      console.error('Failed to parse quest JSON:', e);
    }
  }
  
  if (habitMatch) {
    try {
      const parsed = JSON.parse(habitMatch[1]);
      const result = habitSchema.safeParse(parsed);
      if (result.success) {
        habit = result.data;
      } else {
        console.error('Invalid habit schema:', result.error.format());
      }
    } catch (e) {
      console.error('Failed to parse habit JSON:', e);
    }
  }
  
  return { quest, habit };
};

export const AIAssistant = ({ isOpen, onClose, gameState, onAddQuest, onAddHabit }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: messageText.trim() 
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      // Get the current user session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('You must be logged in to use the AI assistant');
      }

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          type: 'chat',
          gameContext: gameState ? {
            level: gameState.level,
            rank: gameState.rank,
            currentXp: gameState.currentXp,
            maxXp: gameState.maxXp,
            credits: gameState.credits,
            stats: gameState.stats,
            habits: gameState.habits,
            quests: gameState.quests,
          } : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      const assistantMsgId = (Date.now() + 1).toString();

      // Add empty assistant message
      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map(m => 
                  m.id === assistantMsgId 
                    ? { ...m, content: assistantContent } 
                    : m
                )
              );
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
      // Check for action blocks in the final content (validated by Zod schemas)
      const actions = parseAIActions(assistantContent);
      if (actions.quest && onAddQuest) {
        // Data is already validated and has defaults from Zod schema
        onAddQuest({
          title: actions.quest.title,
          difficulty: actions.quest.difficulty,
          xpReward: actions.quest.xpReward,
          creditReward: actions.quest.creditReward,
          timeFrame: actions.quest.timeFrame,
        });
        toast.success('Quest added!', { description: actions.quest.title });
      }
      if (actions.habit && onAddHabit) {
        // Data is already validated and has defaults from Zod schema
        const emoji = actions.habit.name.match(/^\p{Emoji}/u)?.[0] || '✨';
        const cleanName = actions.habit.name.replace(/^\p{Emoji}\s*/u, '');
        onAddHabit({
          name: `${emoji} ${cleanName}`,
          icon: emoji,
          winXp: actions.habit.winXp,
          loseXp: actions.habit.loseXp,
        });
        toast.success('Habit added!', { description: actions.habit.name });
      }
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `I apologize, but I encountered an issue: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again!`,
      };
      setMessages(prev => {
        const filtered = prev.filter(m => m.role !== 'assistant' || m.content.trim() !== '');
        return [...filtered, errorMsg];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full sm:max-w-2xl h-[85vh] sm:h-[600px] glass rounded-t-2xl sm:rounded-2xl border border-primary/30 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">System Assistant</h3>
                  <p className="text-xs text-muted-foreground">AI-powered improvement coach</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearChat}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <Sparkles className="w-12 h-12 text-primary mb-4" />
                  <h4 className="font-display text-lg font-bold mb-2">How can I help you level up?</h4>
                  <p className="text-sm text-muted-foreground mb-6">
                    Ask me to create tasks, habits, or get self-improvement advice!
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {QUICK_PROMPTS.map((qp) => (
                      <Button
                        key={qp.label}
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage(qp.prompt)}
                        className="text-xs"
                      >
                        {qp.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex",
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-3",
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-foreground'
                        )}
                      >
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-sm prose-invert max-w-none">
                            <ReactMarkdown
                              components={{
                                h1: ({ children }) => <h1 className="text-lg font-bold text-foreground mb-2">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base font-bold text-foreground mb-2">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-bold text-foreground mb-1">{children}</h3>,
                                strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
                                p: ({ children }) => <p className="text-sm mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc list-inside text-sm space-y-1 mb-2">{children}</ul>,
                                li: ({ children }) => <li className="text-sm">{children}</li>,
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted/50 rounded-2xl px-4 py-3">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about tasks, habits, workouts..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
