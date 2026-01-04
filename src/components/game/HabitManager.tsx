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
  const [winXp, setWinXp] = useState(20);
  const [loseXp, setLoseXp] = useState(15);

  const resetForm = () => {
    setName('');
    setIcon('🎯');
    setWinXp(20);
    setLoseXp(15);
  };

  const handleAddHabit = () => {
    if (!name.trim()) return;
    
    onAddHabit({
      name: name.trim(),
      icon,
      winXp,
      loseXp,
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
              Add a new habit to track. Be consistent for XP gains!
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="win-xp">Win XP</Label>
                <Input
                  id="win-xp"
                  type="number"
                  min={5}
                  max={50}
                  value={winXp}
                  onChange={(e) => setWinXp(Number(e.target.value))}
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">XP gained on completion</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lose-xp">Lose XP</Label>
                <Input
                  id="lose-xp"
                  type="number"
                  min={5}
                  max={50}
                  value={loseXp}
                  onChange={(e) => setLoseXp(Number(e.target.value))}
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">XP lost on miss</p>
              </div>
            </div>
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
