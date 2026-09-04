import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X, Coins, Trophy, LogIn, Loader2, Bot } from 'lucide-react';
import { useGameState } from './useGameState';
import { useTheme } from '@/hooks/useTheme';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useAchievements } from './useAchievements';
import { useAuth } from '@/hooks/useAuth';
import { useCloudSync } from './useCloudSync';
import { useDailyLoginBonus } from '@/hooks/useDailyLoginBonus';
import { useAutoGenerateTasks } from './useAutoGenerateTasks';
import { PomodoroProvider } from '@/hooks/usePomodoroTimer';
import { PlayerCard } from '@/components/branding/PlayerCard';
import { RadarChartComponent } from '@/components/branding/RadarChart';
import { QuestCard } from '@/components/branding/QuestCard';
import { SystemLog } from '@/components/branding/SystemLog';
import { NavigationHub } from '@/components/branding/NavigationHub';
import { HabitHeatmap } from '@/components/branding/HabitHeatmap';
import { HabitManager } from '@/components/branding/HabitManager';
import { PomodoroTimerFull } from '@/components/branding/PomodoroTimerFull';
import { PomodoroMiniPlayer } from '@/components/branding/PomodoroMiniPlayer';
import { RewardCenter } from '@/components/branding/RewardCenter';
import { GateEncounter } from '@/components/branding/GateEncounter';
import { LevelUpNotification } from '@/components/branding/LevelUpNotification';
import { ThemeSwitcher } from '@/components/branding/ThemeSwitcher';
import { SoundToggle } from '@/components/branding/SoundToggle';
import { AchievementUnlockNotification } from '@/components/branding/AchievementUnlockNotification';
import { AchievementsPanel } from '@/components/branding/AchievementsPanel';
import { AccountDropdown } from '@/components/branding/AccountDropdown';
import { EditProfileModal } from '@/components/branding/EditProfileModal';
import { DailyLoginBonus } from '@/components/branding/DailyLoginBonus';
import { AIAssistant } from '@/components/branding/AIAssistant';
import { FloatingAIButton } from '@/components/branding/FloatingAIButton';
import { MotivationQuote } from '@/components/branding/MotivationQuote';
import { StreakFire } from '@/components/branding/StreakFire';
import { SystemGifts } from '@/components/branding/SystemGifts';
import { Leaderboard } from '@/components/branding/Leaderboard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { HunterProfile } from '@/components/branding/HunterProfile';
import { ShadowArmy } from '@/components/branding/ShadowArmy';
import { SystemLogo } from '@/components/branding/Logo';
import { sectionTransition } from '@/lib/animations';

// Loading skeleton that matches the real layout
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="sticky top-0 z-40 glass-strong border-b border-white/5 h-14" />
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  </div>
);

const Index = () => {
  const [activeSection, setActiveSection] = useState('awakening');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [earnedTitles, setEarnedTitles] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('system-earned-titles') || '[]'); } catch { return []; }
  });
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const { accent, setAccent } = useTheme();
  const { soundEnabled, toggleSound, playQuestComplete, playLevelUp, playError, playAchievement, playTap } = useSoundEffects();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const {
    gameState, setGameState, completeQuest, failQuest, toggleHabitDay, spendCredits,
    showLevelUp, addXp, addCredits, addHabit, deleteHabit, addQuest, deleteQuest,
    addSystemMessage, isTodayComplete, getCurrentStreak, grantXpMultiplier,
  } = useGameState();

  useCloudSync(gameState, setGameState);
  const { bonusData, showBonusModal, dismissBonus } = useDailyLoginBonus();
  const { generateDailyTasks, hasGeneratedToday } = useAutoGenerateTasks(gameState, addQuest);
  const { achievements, newlyUnlocked, dismissNotification, unlockedCount, totalCount } = useAchievements(gameState);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pomodoro-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isRunning && activeSection !== 'quests') setShowMiniPlayer(true);
        else if (activeSection === 'quests') setShowMiniPlayer(false);
      } else if (activeSection === 'quests') {
        setShowMiniPlayer(false);
      }
    } catch {}
  }, [activeSection]);

  useEffect(() => { if (showLevelUp) playLevelUp(); }, [showLevelUp, playLevelUp]);
  useEffect(() => { if (newlyUnlocked) playAchievement(); }, [newlyUnlocked, playAchievement]);

  const handleCompleteQuest = (questId: string) => { playQuestComplete(); completeQuest(questId); };
  const handleFailQuest = (questId: string) => { playError(); failQuest(questId); };
  const handleNavigate = (section: string) => { playTap(); setActiveSection(section); setMobileMenuOpen(false); };

  const handleClaimBonus = async () => {
    if (bonusData?.isNewDay) {
      addXp(bonusData.bonusXp);
      addCredits(bonusData.bonusCredits);
      playAchievement();
      if (!hasGeneratedToday) setTimeout(() => generateDailyTasks(), 1000);
    }
    dismissBonus();
  };

  if (authLoading) return <DashboardSkeleton />;

  const displayUsername = profile?.username || gameState.username;
  const todayQuests = gameState.quests.filter(q => {
    if (!q.scheduledFor) return true;
    return q.scheduledFor <= new Date().toISOString().split('T')[0];
  });
  const completedTodayQuests = todayQuests.filter(q => q.completed).length;

  return (
    <PomodoroProvider>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background */}
        <div className="orb-1" />
        <div className="vignette pointer-events-none" />
        <div className="orb-2" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

        {/* Global notifications */}
        <LevelUpNotification show={showLevelUp} level={gameState.level} />
        <AchievementUnlockNotification achievement={newlyUnlocked} onDismiss={dismissNotification} />

        <PomodoroMiniPlayer
          isVisible={showMiniPlayer}
          onClose={() => setShowMiniPlayer(false)}
          onExpand={() => { playTap(); setActiveSection('quests'); setShowMiniPlayer(false); }}
        />

        {profile && (
          <EditProfileModal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} profile={profile} />
        )}

        {bonusData && user && (
          <DailyLoginBonus
            isVisible={showBonusModal && bonusData.isNewDay}
            bonusData={bonusData}
            onClaim={handleClaimBonus}
            onDismiss={dismissBonus}
          />
        )}

        <AIAssistant
          isOpen={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
          gameState={gameState}
          onAddQuest={(quest) => addQuest(quest)}
          onAddHabit={(habit) => addHabit(habit)}
        />

        {/* ── HEADER ── */}
        <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
          <div className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">

            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer select-none flex-shrink-0" onClick={() => { playTap(); setActiveSection('awakening'); }}>
              <SystemLogo size={30} />
              <div className="hidden sm:block">
                <h1 className="font-display font-black text-base text-foreground tracking-widest leading-none">THE SYSTEM</h1>
                <p className="text-[9px] text-muted-foreground font-jp tracking-widest">システム</p>
              </div>
            </div>

            {/* Desktop stats + actions */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="font-display font-bold text-sm text-primary">Lv.{gameState.level}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
                <Coins className="w-3.5 h-3.5 text-accent" />
                <span className="font-display font-bold text-sm text-accent">{gameState.credits}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Trophy className="w-3.5 h-3.5 text-primary" />
                <span className="font-display font-bold text-sm text-primary">{unlockedCount}/{totalCount}</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <SoundToggle enabled={soundEnabled} onToggle={() => { playTap(); toggleSound(); }} />
              <ThemeSwitcher currentAccent={accent} onAccentChange={(a) => { playTap(); setAccent(a); }} />
              <Button
                variant="glass"
                size="icon"
                onClick={() => { playTap(); setShowAIAssistant(true); }}
                className="w-9 h-9 rounded-xl"
                aria-label="Open AI Assistant"
              >
                <Bot className="w-4 h-4 text-primary" />
              </Button>
              <div className="h-6 w-px bg-border" />
              {user && profile ? (
                <AccountDropdown profile={profile} onEditProfile={() => setShowEditProfile(true)} />
              ) : (
                <Button variant="ghost-primary" size="sm" onClick={() => { playTap(); navigate('/auth'); }}>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile: compact stats + hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-display font-bold text-primary">Lv.{gameState.level}</span>
                <span className="font-display font-bold text-accent">{gameState.credits}¢</span>
              </div>
              <button
                onClick={() => { playTap(); setMobileMenuOpen(!mobileMenuOpen); }}
                className="w-9 h-9 rounded-xl glass border border-white/10 flex-center touch-target"
                aria-label="Open menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile slide-down menu — z-[45] so AccountDropdown at z-[100] shows on top */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden fixed inset-0 top-14 z-[44] bg-black/40 backdrop-blur-[2px]"
                onClick={() => setMobileMenuOpen(false)}
              />
              {/* Panel */}
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="md:hidden fixed inset-x-0 top-14 z-[45]"
              >
                <div
                  className="mx-3 rounded-2xl overflow-visible border border-white/10 shadow-2xl shadow-black/60"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                  }}
                >
                  {/* Stats bar */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-white/6">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="font-display font-bold text-xs text-primary">Lv.{gameState.level}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20">
                      <Coins className="w-3 h-3 text-accent" />
                      <span className="font-display font-bold text-xs text-accent">{gameState.credits}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20">
                      <Trophy className="w-3 h-3 text-primary" />
                      <span className="font-display font-bold text-xs text-primary">{unlockedCount}/{totalCount}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <SoundToggle enabled={soundEnabled} onToggle={() => { playTap(); toggleSound(); }} />
                      <ThemeSwitcher currentAccent={accent} onAccentChange={(a) => { playTap(); setAccent(a); }} />
                    </div>
                  </div>

                  {/* Profile / Sign in — overflow-visible so dropdown pops above */}
                  <div className="p-3 overflow-visible">
                    {user && profile ? (
                      <div className="overflow-visible">
                        <AccountDropdown
                          profile={profile}
                          onEditProfile={() => { setShowEditProfile(true); setMobileMenuOpen(false); }}
                        />
                      </div>
                    ) : (
                      <Button variant="ghost-primary" className="w-full" onClick={() => { playTap(); navigate('/auth'); }}>
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </Button>
                    )}
                  </div>

                  {/* AI button row */}
                  <div className="px-3 pb-3">
                    <button
                      onClick={() => { playTap(); setShowAIAssistant(true); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex-center flex-shrink-0">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-display font-bold text-foreground">AI Assistant</p>
                        <p className="text-[10px] text-muted-foreground font-jp">システムアシスタント</p>
                      </div>
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── MAIN CONTENT ── */}
        <main className="container mx-auto px-4 md:px-6 py-6 pb-[88px] md:pb-8">

          {/* Navigation */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6" transition={{ duration: 0.4 }}>
            <NavigationHub activeSection={activeSection} onNavigate={handleNavigate} />
          </motion.div>

          {/* Section content with transitions */}
          <AnimatePresence mode="wait">

            {/* ── Dashboard ── */}
            {activeSection === 'awakening' && (
              <motion.div key="awakening" {...sectionTransition} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <StreakFire isActive={isTodayComplete()} streakCount={getCurrentStreak()} />
                    <SystemGifts
                      currentStreak={getCurrentStreak()} totalQuestsCompleted={gameState.totalQuestsCompleted} level={gameState.level}
                      onClaimGift={(xp, credits, multiplier, hours) => {
                        addXp(xp); addCredits(credits);
                        if (multiplier && hours) grantXpMultiplier(multiplier, hours);
                        playAchievement();
                      }}
                    />
                  </div>
                  <MotivationQuote section="awakening" />
                  <PlayerCard
                    username={displayUsername} level={gameState.level} rank={gameState.rank}
                    currentXp={gameState.currentXp} maxXp={gameState.maxXp}
                    avatarId={profile?.avatar_id} streak={getCurrentStreak()}
                    questsCompleted={gameState.totalQuestsCompleted}
                  />
                  <RadarChartComponent stats={gameState.stats} />
                  <AchievementsPanel achievements={achievements} unlockedCount={unlockedCount} totalCount={totalCount} />
                </div>
                <div className="lg:col-span-1">
                  <SystemLog messages={gameState.systemMessages} />
                </div>
              </motion.div>
            )}

            {/* ── Quests ── */}
            {activeSection === 'quests' && (
              <motion.div key="quests" {...sectionTransition} className="space-y-6">
                <MotivationQuote section="quests" />
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Daily Quests</h2>
                    <p className="text-body-sm text-muted-foreground font-jp">デイリークエスト</p>
                  </div>
                  <div className="text-right">
                    <p className="text-label text-muted-foreground">Today's Progress</p>
                    <p className="font-display text-2xl font-bold text-primary">{completedTodayQuests}/{todayQuests.length}</p>
                  </div>
                </div>

                {todayQuests.map((quest, index) => (
                  <QuestCard key={quest.id} quest={quest} onComplete={handleCompleteQuest} onFail={handleFailQuest} index={index} />
                ))}

                {gameState.quests.length === 0 && (
                  <div className="text-center py-16 glass rounded-2xl border border-white/10">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex-center mx-auto mb-4">
                      <span className="text-3xl">⚔️</span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-2">No Active Quests</h3>
                    <p className="text-body-sm text-muted-foreground mb-4">Add a quest to begin your journey.</p>
                    <Button variant="ghost-primary" size="sm" onClick={() => { playTap(); setShowAIAssistant(true); }}>
                      <Bot className="w-4 h-4" />
                      Ask AI to Generate Tasks
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1"><PomodoroTimerFull /></div>
                  <div className="lg:col-span-2">
                    <RewardCenter credits={gameState.credits} onSpend={spendCredits} totalQuestsCompleted={gameState.totalQuestsCompleted} level={gameState.level} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Habits ── */}
            {activeSection === 'habits' && (
              <motion.div key="habits" {...sectionTransition}>
                <MotivationQuote section="habits" />
                <div className="flex items-center justify-between mb-6 mt-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Habit Tracking</h2>
                    <p className="text-body-sm text-muted-foreground font-jp">習慣トラッキング</p>
                  </div>
                </div>
                <HabitManager habits={gameState.habits} onAddHabit={addHabit} onDeleteHabit={deleteHabit} />
                {gameState.habits.length === 0 ? (
                  <div className="text-center py-16 glass rounded-2xl border border-white/10 mt-6">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex-center mx-auto mb-4">
                      <span className="text-3xl">🔥</span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-2">No Habits Yet</h3>
                    <p className="text-body-sm text-muted-foreground mb-4">Build habits, earn streaks, grow stronger.</p>
                    <Button variant="ghost-primary" size="sm" onClick={() => { playTap(); setShowAIAssistant(true); }}>
                      <Bot className="w-4 h-4" />
                      Ask AI for Habit Ideas
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {gameState.habits.map((habit, index) => (
                      <HabitHeatmap key={habit.id} habit={habit} onToggleDay={toggleHabitDay} index={index} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Leaderboard ── */}
            {activeSection === 'leaderboards' && (
              <motion.div key="leaderboards" {...sectionTransition}>
                <Leaderboard currentUsername={displayUsername} currentLevel={gameState.level} />
              </motion.div>
            )}

            {/* ── Gates ── */}
            {activeSection === 'gates' && (
              <motion.div key="gates" {...sectionTransition}>
                <div className="mb-6">
                  <h2 className="font-display text-2xl font-bold text-foreground">Gates</h2>
                  <p className="text-body-sm text-muted-foreground font-jp">ゲート</p>
                </div>
                <div className="max-w-4xl mx-auto">
                  <GateEncounter
                    level={gameState.level}
                    totalQuestsCompleted={gameState.totalQuestsCompleted}
                    currentStreak={getCurrentStreak()}
                    onGateDefeated={(gateId, title, xp, credits) => {
                      addXp(xp); addCredits(credits);
                      setEarnedTitles(prev => {
                        if (prev.includes(title)) return prev;
                        const updated = [...prev, title];
                        localStorage.setItem('system-earned-titles', JSON.stringify(updated));
                        return updated;
                      });
                      addSystemMessage({ type: 'achievement', message: `🏆 Gate defeated! Title earned: "${title}" · +${xp} XP · +${credits} Credits` });
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* ── Profile ── */}
            {activeSection === 'profile' && (
              <motion.div key="profile" {...sectionTransition}>
                <div className="mb-6">
                  <h2 className="font-display text-2xl font-bold text-foreground">Hunter Profile</h2>
                  <p className="text-body-sm text-muted-foreground font-jp">ハンタープロフィール</p>
                </div>
                <div className="max-w-2xl mx-auto space-y-4">
                  {gameState && (
                    <>
                      <HunterProfile
                        gameState={gameState} achievements={achievements || []}
                        unlockedCount={unlockedCount || 0} avatarId={profile?.avatar_id}
                        bio={profile?.bio} streak={getCurrentStreak()} earnedTitles={earnedTitles}
                      />
                      <ShadowArmy level={gameState.level || 1} totalQuestsCompleted={gameState.totalQuestsCompleted || 0} currentStreak={getCurrentStreak()} />
                    </>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        <FloatingAIButton onClick={() => { playTap(); setShowAIAssistant(true); }} />

        <footer className="border-t border-white/5 py-5 mt-8 hidden md:block">
          <div className="container mx-auto px-4 text-center">
            <p className="text-label text-muted-foreground/40 font-jp">システムに選ばれし者よ、前へ進め</p>
          </div>
        </footer>
      </div>
    </PomodoroProvider>
  );
};

export default Index;
