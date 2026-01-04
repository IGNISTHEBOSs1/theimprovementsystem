import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_id: string;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!error && data) {
      setProfile(data as Profile);
    }
    return data as Profile | null;
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetch
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, username: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username
        }
      }
    });
    
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { data, error };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth`;
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    return { data, error };
  };
  const signOut = async () => {
    // Clear local storage on sign out
    localStorage.removeItem('the-system-game-state');
    localStorage.removeItem('the-system-achievements');
    localStorage.removeItem('pomodoro-state');
    localStorage.removeItem('pomodoro-stats');
    localStorage.removeItem('the-system-rewards-sold-out');
    localStorage.removeItem('the-system-gifts');
    
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const updateProfile = async (updates: Partial<Pick<Profile, 'username' | 'avatar_id' | 'date_of_birth'>>) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (!error && data) {
      setProfile(data as Profile);
    }
    
    return { data, error };
  };

  const deleteAccount = async () => {
    // Note: Full account deletion requires edge function with service role
    // For now, we sign out and the user can contact support
    await signOut();
    return { error: null };
  };

  const resetGameProgress = async () => {
    if (!user) return { error: new Error('Not authenticated') };
    
    // Clear local storage first
    localStorage.removeItem('the-system-game-state');
    localStorage.removeItem('the-system-achievements');
    localStorage.removeItem('pomodoro-state');
    localStorage.removeItem('pomodoro-stats');
    localStorage.removeItem('the-system-rewards-sold-out');
    localStorage.removeItem('the-system-gifts');
    
    // Reset database state with zero stats for fresh start
    const { error } = await supabase
      .from('game_state')
      .update({
        level: 1,
        rank: 'E-Rank Hunter',
        current_xp: 0,
        max_xp: 1000,
        credits: 0,
        total_quests_completed: 0,
        stats: { FIT: 0, SOC: 0, INT: 0, DIS: 0, FOC: 0, FIN: 0 },
        quests: [
          { id: 'default_1', title: '🏃 Morning Exercise', difficulty: 'Easy', xpReward: 25, creditReward: 5, timeFrame: 'Today', completed: false, failed: false, createdAt: new Date().toISOString() },
          { id: 'default_2', title: '📚 Read for 20 minutes', difficulty: 'Easy', xpReward: 20, creditReward: 5, timeFrame: 'Today', completed: false, failed: false, createdAt: new Date().toISOString() },
          { id: 'default_3', title: '💧 Drink 8 glasses of water', difficulty: 'Normal', xpReward: 15, creditReward: 3, timeFrame: 'Today', completed: false, failed: false, createdAt: new Date().toISOString() },
        ],
        habits: [],
        system_messages: [{ id: '1', type: 'achievement', message: '🎉 Progress reset! Your journey begins anew.', timestamp: new Date().toISOString() }],
        achievements: []
      })
      .eq('user_id', user.id);
    
    // Force page reload to reset all state
    if (!error) {
      window.location.reload();
    }
    
    return { error };
  };

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    deleteAccount,
    resetGameProgress,
    fetchProfile
  };
};
