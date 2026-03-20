import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Menu, X, Coins, Trophy, LogIn, Loader2, Bot } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { useTheme } from '@/hooks/useTheme';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useAchievements } from '@/hooks/useAchievements';
import { useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import { useDailyLoginBonus } from '@/hooks/useDailyLoginBonus';
import { useAutoGenerateTasks } from '@/hooks/useAutoGenerateTasks';
import { PomodoroProvider } from '@/hooks/usePomodoroTimer';
import { PlayerCard } from '@/components/game/PlayerCard';
import { RadarChartComponent } from '@/components/game/RadarChart';
import { QuestCard } from '@/components/game/QuestCard';
import { SystemLog } from '@/components/game/SystemLog';
import { NavigationHub } from '@/components/game/NavigationHub';
import { HabitHeatmap } from '@/components/game/HabitHeatmap';
import { HabitManager } from '@/components/game/HabitManager';
import { PomodoroTimerFull } from '@/components/game/PomodoroTimerFull';
import { PomodoroMiniPlayer } from '@/components/game/PomodoroMiniPlayer';
import { RewardCenter } from '@/components/game/RewardCenter';
import { GateEncounter } from '@/components/game/GateEncounter';
import { LevelUpNotification } from '@/components/game/LevelUpNotification';
import { ThemeSwitcher } from '@/components/game/ThemeSwitcher';
import { SoundToggle } from '@/components/game/SoundToggle';
import { AchievementUnlockNotification } from '@/components/game/AchievementUnlockNotification';
import { AchievementsPanel } from '@/components/game/AchievementsPanel';
import { AccountDropdown } from '@/components/game/AccountDropdown';
import { EditProfileModal } from '@/components/game/EditProfileModal';
import { DailyLoginBonus } from '@/components/game/DailyLoginBonus';
import { AIAssistant } from '@/components/game/AIAssistant';
import { FloatingAIButton } from '@/components/game/FloatingAIButton';
import { MotivationQuote } from '@/components/game/MotivationQuote';
import { StreakFire } from '@/components/game/StreakFire';
import { SystemGifts } from '@/components/game/SystemGifts';
import { Leaderboard } from '@/components/game/Leaderboard';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activeSection, setActiveSection] = useState('awakening');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const { accent, setAccent } = useTheme();
  const { soundEnabled, toggleSound, playQuestComplete, playLevelUp, playError, playAchievement, playTap } = useSoundEffects();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const {
    gameState,
    setGameState,
    completeQuest,
    failQuest,
    toggleHabitDay,
    spendCredits,
    showLevelUp,
    addXp,
    addCredits,
    addHabit,
    deleteHabit,
    addQuest,
    isTodayComplete,
    getCurrentStreak,
  } = useGameState();

  // Cloud sync for logged-in users
  useCloudSync(gameState, setGameState);

  // Daily login bonus
  const { bonusData, showBonusModal, dismissBonus } = useDailyLoginBonus();

  // Auto-generate daily tasks
  const { generateDailyTasks, hasGeneratedToday } = useAutoGenerateTasks(gameState, addQuest);

  const {
    achievements, 
    newlyUnlocked, 
    dismissNotification, 
    unlockedCount, 
    totalCount 
  } = useAchievements(gameState);

  // Show mini-player when not on quests section and timer was used
  useEffect(() => {
    const wasTimerActive = localStorage.getItem('pomodoro-state');
    if (wasTimerActive && activeSection !== 'quests') {
      const parsed = JSON.parse(wasTimerActive);
      if (parsed.timeLeft < parsed.totalTime || parsed.isRunning) {
        setShowMiniPlayer(true);
      }
    } else if (activeSection === 'quests') {
      setShowMiniPlayer(false);
    }
  }, [activeSection]);

  // Play level up sound when level increases
  useEffect(() => {
    if (showLevelUp) {
      playLevelUp();
    }
  }, [showLevelUp, playLevelUp]);

  // Play achievement unlock sound
  useEffect(() => {
    if (newlyUnlocked) {
      playAchievement();
    }
  }, [newlyUnlocked, playAchievement]);

  const handleCompleteQuest = (questId: string) => {
    playQuestComplete();
    completeQuest(questId);
  };

  const handleFailQuest = (questId: string) => {
    playError();
    failQuest(questId);
  };

  const handlePomodoroComplete = () => {
    playQuestComplete();
    addXp(50);
  };

  const handleClickableClick = () => {
    playTap();
  };

  // Navigation with sound
  const handleNavigate = (section: string) => {
    playTap();
    setActiveSection(section);
  };

  // Claim daily login bonus and auto-generate tasks
  const handleClaimBonus = async () => {
    if (bonusData?.isNewDay) {
      addXp(bonusData.bonusXp);
      addCredits(bonusData.bonusCredits);
      playAchievement();
      
      // Auto-generate daily tasks when claiming new day bonus
      if (!hasGeneratedToday) {
        setTimeout(() => {
          generateDailyTasks();
        }, 1000); // Delay to let UI settle
      }
    }
    dismissBonus();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayUsername = profile?.username || gameState.username;

  return (
    <PomodoroProvider onComplete={handlePomodoroComplete}>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background effects */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.015%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] pointer-events-none" />

        {/* Level Up Notification */}
        <LevelUpNotification show={showLevelUp} level={gameState.level} />
        
        {/* Achievement Unlock Notification */}
        <AchievementUnlockNotification 
          achievement={newlyUnlocked} 
          onDismiss={dismissNotification} 
        />

        {/* Pomodoro Mini Player */}
        <PomodoroMiniPlayer 
          isVisible={showMiniPlayer} 
          onClose={() => setShowMiniPlayer(false)}
          onExpand={() => {
            playTap();
            setActiveSection('quests');
            setShowMiniPlayer(false);
          }}
        />

        {/* Edit Profile Modal */}
        {profile && (
          <EditProfileModal 
            isOpen={showEditProfile} 
            onClose={() => setShowEditProfile(false)} 
            profile={profile} 
          />
        )}

        {/* Daily Login Bonus Modal */}
        {bonusData && user && (
          <DailyLoginBonus
            isVisible={showBonusModal && bonusData.isNewDay}
            bonusData={bonusData}
            onClaim={handleClaimBonus}
            onDismiss={dismissBonus}
          />
        )}

        {/* AI Assistant */}
        <AIAssistant 
          isOpen={showAIAssistant} 
          onClose={() => setShowAIAssistant(false)}
          gameState={gameState}
          onAddQuest={(quest) => addQuest(quest)}
          onAddHabit={(habit) => addHabit(habit)}
        />

        {/* Header */}
        <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3" onClick={handleClickableClick}>
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
              <div className="flex items-center gap-2" onClick={handleClickableClick}>
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Level</p>
                  <p className="font-display font-bold text-primary">{gameState.level}</p>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={handleClickableClick}>
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Coins className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Credits</p>
                  <p className="font-display font-bold text-accent">{gameState.credits}</p>
                </div>
              </div>
              <div className="h-8 w-px bg-border" />
              <SoundToggle enabled={soundEnabled} onToggle={() => { playTap(); toggleSound(); }} />
              <ThemeSwitcher currentAccent={accent} onAccentChange={(a) => { playTap(); setAccent(a); }} />
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20" onClick={handleClickableClick}>
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">{unlockedCount}/{totalCount}</span>
              </div>
              
              {/* AI Assistant Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  playTap();
                  setShowAIAssistant(true);
                }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 border border-primary/20"
              >
                <Bot className="w-5 h-5 text-primary" />
              </Button>
              
              <div className="h-8 w-px bg-border" />
              
              {/* Account Section */}
              {user && profile ? (
                <AccountDropdown 
                  profile={profile} 
                  onEditProfile={() => setShowEditProfile(true)} 
                />
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    playTap();
                    navigate('/auth');
                  }}
                  className="bg-primary/10 border-primary/30 hover:bg-primary/20"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => {
                playTap();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="md:hidden w-10 h-10 rounded-lg bg-muted flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass-strong border-b border-white/5"
            >
              <div className="container mx-auto px-4 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="font-display font-bold text-primary">Lv.{gameState.level}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-accent" />
                      <span className="font-display font-bold text-accent">{gameState.credits}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span className="font-display font-bold text-primary">{unlockedCount}/{totalCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        playTap();
                        setShowAIAssistant(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20"
                    >
                      <Bot className="w-4 h-4 text-primary" />
                    </Button>
                    <SoundToggle enabled={soundEnabled} onToggle={() => { playTap(); toggleSound(); }} />
                    <ThemeSwitcher currentAccent={accent} onAccentChange={(a) => { playTap(); setAccent(a); }} />
                  </div>
                </div>
                {user && profile ? (
                  <AccountDropdown 
                    profile={profile} 
                    onEditProfile={() => setShowEditProfile(true)} 
                  />
                ) : (
                  <Button
                    variant="outline"
                    className="w-full bg-primary/10 border-primary/30"
                    onClick={() => {
                      playTap();
                      navigate('/auth');
                    }}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Navigation Hub */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <NavigationHub activeSection={activeSection} onNavigate={handleNavigate} />
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
                  {/* Streak Fire & System Gifts Row */}
                  <div className="flex flex-wrap items-center gap-4">
                    <StreakFire 
                      isActive={isTodayComplete()} 
                      streakCount={getCurrentStreak()} 
                    />
                    <SystemGifts 
                      currentStreak={getCurrentStreak()} 
                      onClaimGift={(xp, credits) => {
                        addXp(xp);
                        addCredits(credits);
                        playAchievement();
                      }} 
                    />
                  </div>
                  
                  {/* Motivation Quote */}
                  <MotivationQuote section="awakening" />
                  
                  <PlayerCard
                    username={displayUsername}
                    level={gameState.level}
                    rank={gameState.rank}
                    currentXp={gameState.currentXp}
                    maxXp={gameState.maxXp}
                    avatarId={profile?.avatar_id}
                    streak={getCurrentStreak()}
                    questsCompleted={gameState.totalQuestsCompleted}
                  />
                  <RadarChartComponent stats={gameState.stats} />
                  <AchievementsPanel 
                    achievements={achievements} 
                    unlockedCount={unlockedCount} 
                    totalCount={totalCount} 
                  />
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
                className="space-y-6"
              >
                {/* Quests Section */}
                <div className="space-y-4">
                  {/* Motivation Quote */}
                  <MotivationQuote section="quests" />
                  
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

                  {gameState.quests.filter(q => {
                    if (!q.scheduledFor) return true;
                    const today = new Date().toISOString().split('T')[0];
                    return q.scheduledFor <= today;
                  }).map((quest, index) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      onComplete={handleCompleteQuest}
                      onFail={handleFailQuest}
                      index={index}
                    />
                  ))}
                  
                  {gameState.quests.length === 0 && (
                    <div className="text-center py-12 glass rounded-2xl border border-white/10">
                      <p className="text-muted-foreground mb-2">No quests yet!</p>
                      <p className="text-sm text-muted-foreground">Ask the AI assistant to generate daily tasks for you.</p>
                    </div>
                  )}
                </div>

                {/* Timer & Rewards - Full Width */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <PomodoroTimerFull />
                  </div>
                  <div className="lg:col-span-2">
                    <RewardCenter credits={gameState.credits} onSpend={spendCredits} />
                  </div>
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
                {/* Motivation Quote */}
                <MotivationQuote section="habits" />
                
                <div className="flex items-center justify-between mb-6 mt-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Habit Tracking</h2>
                    <p className="text-muted-foreground font-jp">習慣トラッキング</p>
                  </div>
                </div>

                {/* Habit Manager */}
                <HabitManager
                  habits={gameState.habits}
                  onAddHabit={addHabit}
                  onDeleteHabit={deleteHabit}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {gameState.habits.map((habit, index) => (
                    <HabitHeatmap
                      key={habit.id}
                      habit={habit}
                      onToggleDay={toggleHabitDay}
                      index={index}
                    />
                  ))}
                </div>

                {gameState.habits.length === 0 && (
                  <div className="text-center py-12 glass rounded-2xl border border-white/10">
                    <p className="text-muted-foreground mb-2">No habits yet!</p>
                    <p className="text-sm text-muted-foreground">Ask the AI assistant to help you create habits, or click "New Habit" above.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeSection === 'leaderboards' && (
              <motion.div
                key="leaderboards"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Leaderboard 
                  currentUsername={displayUsername}
                  currentLevel={gameState.level}
                />
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

                <div className="max-w-4xl mx-auto">
                  <GateEncounter />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Floating AI Button - Always visible bottom right */}
        <FloatingAIButton onClick={() => {
          playTap();
          setShowAIAssistant(true);
        }} />

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p className="font-jp">システムに選ばれし者よ、前へ進め</p>
            <p className="mt-1">Hunter, you have been chosen. Move forward.</p>
          </div>
        </footer>
      </div>
    </PomodoroProvider>
  );
};

export default Index;
