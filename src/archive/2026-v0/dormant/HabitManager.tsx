import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Habit } from '@/hooks/useGameState';
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

const EMOJI_OPTIONS = ['🌿', '💪', '🧊', '📵', '📚', '🧘', '💧', '🏃', '😴', '🍎', '✍️', '🎯'];

// System-determined XP values based on habit difficulty estimation
const getSystemXpValues = (habitName: string) => {
  const name = habitName.toLowerCase();
  // Higher XP for more challenging habits
  if (name.includes('workout') || name.includes('exercise') || name.includes('gym') || name.includes('run')) {
    return { winXp: 30, loseXp: 25 };
  }
  if (name.includes('study') || name.includes('read') || name.includes('learn') || name.includes('code')) {
    return { winXp: 25, loseXp: 20 };
  }
  if (name.includes('meditation') || name.includes('mindful') || name.includes('yoga')) {
    return { winXp: 20, loseXp: 15 };
  }
  if (name.includes('water') || name.includes('sleep') || name.includes('wake')) {
    return { winXp: 15, loseXp: 10 };
  }
  // Default balanced values
  return { winXp: 20, loseXp: 15 };
};

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

  const resetForm = () => {
    setName('');
    setIcon('🎯');
  };

  const handleAddHabit = () => {
    if (!name.trim()) return;
    
    // System determines XP values based on habit type
    const xpValues = getSystemXpValues(name);
    
    onAddHabit({
      name: name.trim(),
      icon,
      winXp: xpValues.winXp,
      loseXp: xpValues.loseXp,
    });
    
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
              Add a new habit to track. The System will determine appropriate XP rewards.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="habit-name">Habit Name</Label>
              <Input
                id="habit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning Meditation"
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Choose Icon</Label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                      icon === emoji
                        ? 'bg-primary text-primary-foreground scale-110'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* XP Preview (System-determined) */}
            {name.trim() && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-2">System-determined XP values:</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">+{getSystemXpValues(name).winXp}</span>
                    <span className="text-xs text-muted-foreground">on completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">-{getSystemXpValues(name).loseXp}</span>
                    <span className="text-xs text-muted-foreground">on miss</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddHabit} disabled={!name.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Habit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent className="glass border-destructive/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Habit?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{habitToDelete?.name}"? This will remove all
              tracking history for this habit. This action cannot be undone.
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
