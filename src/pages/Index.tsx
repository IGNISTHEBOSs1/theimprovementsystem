import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Menu, X, Coins } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { useTheme } from '@/hooks/useTheme';
import { PlayerCard } from '@/components/game/PlayerCard';
import { RadarChartComponent } from '@/components/game/RadarChart';
import { QuestCard } from '@/components/game/QuestCard';
import { SystemLog } from '@/components/game/SystemLog';
import { NavigationHub } from '@/components/game/NavigationHub';
import { HabitHeatmap } from '@/components/game/HabitHeatmap';
import { PomodoroTimer } from '@/components/game/PomodoroTimer';
import { RewardCenter } from '@/components/game/RewardCenter';
import { GateEncounter } from '@/components/game/GateEncounter';
import { LevelUpNotification } from '@/components/game/LevelUpNotification';
import { ThemeSwitcher } from '@/components/game/ThemeSwitcher';

const Index = () => {
  const [activeSection, setActiveSection] = useState('awakening');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { accent, setAccent } = useTheme();
  
  const {
    gameState,
    completeQuest,
    failQuest,
    toggleHabitDay,
    spendCredits,
    showLevelUp,
    addXp,
  } = useGameState();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.015%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] pointer-events-none" />

      {/* Level Up Notification */}
      <LevelUpNotification show={showLevelUp} level={gameState.level} />

      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">THE SYSTEM</h1>
              <p className="text-xs text-muted-foreground font-jp">システム</p>
            </div>
          </div>

          {/* Desktop Stats */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Level</p>
                <p className="font-display font-bold text-primary">{gameState.level}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <Coins className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Credits</p>
                <p className="font-display font-bold text-accent">{gameState.credits}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <ThemeSwitcher currentAccent={accent} onAccentChange={setAccent} />
            <div className="h-8 w-px bg-border" />
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{gameState.username}</p>
              <p className="text-xs text-primary font-display">{gameState.rank}</p>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-lg bg-muted flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Navigation Hub */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <NavigationHub activeSection={activeSection} onNavigate={setActiveSection} />
        </motion.div>

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          {activeSection === 'awakening' && (
            <motion.div
              key="awakening"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column - Player Info */}
              <div className="lg:col-span-2 space-y-6">
                <PlayerCard
                  username={gameState.username}
                  level={gameState.level}
                  rank={gameState.rank}
                  currentXp={gameState.currentXp}
                  maxXp={gameState.maxXp}
                />
                <RadarChartComponent stats={gameState.stats} />
              </div>

              {/* Right Column - System Log */}
              <div className="lg:col-span-1">
                <SystemLog messages={gameState.systemMessages} />
              </div>
            </motion.div>
          )}

          {activeSection === 'quests' && (
            <motion.div
              key="quests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column - Quests */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Daily Quests</h2>
                    <p className="text-muted-foreground font-jp">デイリークエスト</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Completed</p>
                    <p className="font-display text-2xl font-bold text-primary">{gameState.totalQuestsCompleted}</p>
                  </div>
                </div>

                {gameState.quests.map((quest, index) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={completeQuest}
                    onFail={failQuest}
                    index={index}
                  />
                ))}
              </div>

              {/* Right Column - Timer & Rewards */}
              <div className="space-y-6">
                <PomodoroTimer onComplete={() => addXp(50)} />
                <RewardCenter credits={gameState.credits} onSpend={spendCredits} />
              </div>
            </motion.div>
          )}

          {activeSection === 'habits' && (
            <motion.div
              key="habits"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-foreground">Habit Tracking</h2>
                <p className="text-muted-foreground font-jp">習慣トラッキング</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gameState.habits.map((habit, index) => (
                  <HabitHeatmap
                    key={habit.id}
                    habit={habit}
                    onToggleDay={toggleHabitDay}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'gates' && (
            <motion.div
              key="gates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-foreground">Gates</h2>
                <p className="text-muted-foreground font-jp">ゲート</p>
              </div>

              <div className="max-w-2xl mx-auto">
                <GateEncounter />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-jp">システムに選ばれし者よ、前へ進め</p>
          <p className="mt-1">Hunter, you have been chosen. Move forward.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
