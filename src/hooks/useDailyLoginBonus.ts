import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LoginBonusData {
  currentStreak: number;
  longestStreak: number;
  totalLogins: number;
  lastLoginDate: string;
  bonusXp: number;
  bonusCredits: number;
  isNewDay: boolean;
}

const STREAK_BONUSES = [
  { days: 1, xp: 25, credits: 10 },
  { days: 2, xp: 35, credits: 15 },
  { days: 3, xp: 50, credits: 20 },
  { days: 4, xp: 65, credits: 25 },
  { days: 5, xp: 80, credits: 30 },
  { days: 6, xp: 100, credits: 40 },
  { days: 7, xp: 150, credits: 50 }, // Weekly bonus!
];

export const useDailyLoginBonus = () => {
  const { user } = useAuth();
  const [bonusData, setBonusData] = useState<LoginBonusData | null>(null);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const getBonus = (streak: number) => {
    const index = Math.min(streak - 1, STREAK_BONUSES.length - 1);
    return STREAK_BONUSES[Math.max(0, index)];
  };

  const checkDailyLogin = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get current login bonus data
      const { data, error } = await supabase
        .from('daily_login_bonus')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Failed to fetch login bonus:', error);
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      
      if (!data) {
        // First time user - create record (handled by trigger but just in case)
        const bonus = getBonus(1);
        setBonusData({
          currentStreak: 1,
          longestStreak: 1,
          totalLogins: 1,
          lastLoginDate: today,
          bonusXp: bonus.xp,
          bonusCredits: bonus.credits,
          isNewDay: true,
        });
        setShowBonusModal(true);
        setLoading(false);
        return;
      }

      const lastLogin = new Date(data.last_login_date);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Already logged in today
        const bonus = getBonus(data.current_streak);
        setBonusData({
          currentStreak: data.current_streak,
          longestStreak: data.longest_streak,
          totalLogins: data.total_logins,
          lastLoginDate: data.last_login_date,
          bonusXp: bonus.xp,
          bonusCredits: bonus.credits,
          isNewDay: false,
        });
        setLoading(false);
        return;
      }

      // New day login!
      let newStreak = diffDays === 1 ? data.current_streak + 1 : 1;
      const newLongest = Math.max(data.longest_streak, newStreak);
      const bonus = getBonus(newStreak);

      // Update the database
      const { error: updateError } = await supabase
        .from('daily_login_bonus')
        .update({
          last_login_date: today,
          current_streak: newStreak,
          longest_streak: newLongest,
          total_logins: data.total_logins + 1,
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to update login bonus:', updateError);
      }

      setBonusData({
        currentStreak: newStreak,
        longestStreak: newLongest,
        totalLogins: data.total_logins + 1,
        lastLoginDate: today,
        bonusXp: bonus.xp,
        bonusCredits: bonus.credits,
        isNewDay: true,
      });
      setShowBonusModal(true);
    } catch (error) {
      console.error('Login bonus check error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkDailyLogin();
  }, [checkDailyLogin]);

  const dismissBonus = useCallback(() => {
    setShowBonusModal(false);
  }, []);

  return {
    bonusData,
    showBonusModal,
    dismissBonus,
    loading,
    streakBonuses: STREAK_BONUSES,
  };
};
