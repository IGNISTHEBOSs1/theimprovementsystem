import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Habit } from '@/hooks/useGameState';
import { DIFFICULTIES, DIFFICULTY_META, getDifficultyRewards, type Difficulty } from '@/lib/difficulty';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

const EMOJI_OPTIONS = ['🌿', '💪', '🧊', '📵', '📚', '🧘', '💧', '🏃', '😴', '🍎', '✍️', '🎯'];

interface HabitManagerProps {
  habits: Habit[];
  onAddHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completedDays'>) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const HabitManager = ({ habits, onAddHabit, onDeleteHabit }: HabitManagerProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [difficulty, setDifficulty] = useState<Difficulty>('Moderate');

  const resetForm = () => {
    setName('');
    setIcon('🎯');
    setDifficulty('Moderate');
  };

  const handleAddHabit = () => {
    if (!name.trim()) return;
    onAddHabit({ name: name.trim(), icon, difficulty });
    resetForm();
    setIsAddOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      onDeleteHabit(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const habitToDelete = habits.find(h => h.id === deleteConfirmId);
  const selectedRewards = getDifficultyRewards(difficulty);
  const selectedMeta = DIFFICULTY_META[difficulty];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Habit
        </Button>
      </div>

      {/* Add Habit Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="glass border-primary/30">
          <DialogHeader>
            <DialogTitle className="font-display">Create New Habit</DialogTitle>
            <DialogDescription>
              Choose a difficulty to set your XP rewards.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="habit-name">Habit Name</Label>
              <Input
                id="habit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning Meditation"
                className="bg-muted/50"
                onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
              />
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={cn(
                      'w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all',
                      icon === emoji
                        ? 'bg-primary text-primary-foreground scale-110'
                        : 'bg-muted/50 hover:bg-muted'
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty selector */}
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <div className="grid grid-cols-5 gap-1.5">
                {DIFFICULTIES.map((d) => {
                  const meta = DIFFICULTY_META[d];
                  const isSelected = difficulty === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        'py-2 px-1 rounded-lg border text-center transition-all',
                        isSelected
                          ? `${meta.bg} border-current scale-105`
                          : 'bg-muted/30 border-white/10 text-muted-foreground hover:bg-muted/50'
                      )}
                    >
                      <p className={cn('text-xs font-bold', isSelected ? meta.color : '')}>{d}</p>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">{selectedMeta.description}</p>
            </div>

            {/* Reward preview */}
            <div className="p-3 rounded-lg bg-primary/8 border border-primary/15">
              <p className="text-xs text-muted-foreground mb-2 font-display uppercase tracking-wider">Rewards</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className={cn('text-lg font-display font-bold', selectedMeta.color)}>
                    +{selectedRewards.xp}
                  </p>
                  <p className="text-[10px] text-muted-foreground">XP on win</p>
                </div>
                <div>
                  <p className="text-lg font-display font-bold text-accent">
                    +{selectedRewards.credits}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Credits</p>
                </div>
                <div>
                  <p className="text-lg font-display font-bold text-red-400">
                    -{selectedRewards.loseXp}
                  </p>
                  <p className="text-[10px] text-muted-foreground">XP on miss</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { resetForm(); setIsAddOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleAddHabit} disabled={!name.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Habit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent className="glass border-destructive/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Habit?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{habitToDelete?.name}"? This will remove all
              tracking history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Habit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete buttons on each habit */}
      {habits.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {habits.map((habit) => (
            <Button
              key={habit.id}
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirmId(habit.id)}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              {habit.icon} {habit.name}
            </Button>
          ))}
        </div>
      )}
    </>
  );
};
