import { useState, useEffect, useCallback, useRef } from 'react';

const SOUND_KEY = 'system-sound-enabled';

export const useSoundEffects = () => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(SOUND_KEY);
    return saved ? JSON.parse(saved) : true;
  });
  
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem(SOUND_KEY, JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTap = useCallback(() => {
    if (!soundEnabled) return;
    
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Soft tap sound - short and subtle
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.02);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    
    osc.start(now);
    osc.stop(now + 0.06);
  }, [soundEnabled, getAudioContext]);

  const playQuestComplete = useCallback(() => {
    if (!soundEnabled) return;
    
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Create a satisfying "ding" sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, now); // A5
    oscillator.frequency.exponentialRampToValueAtTime(1760, now + 0.1); // A6
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    oscillator.start(now);
    oscillator.stop(now + 0.3);

    // Add a second harmonic for richness
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, now); // E6
    osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.1);
    
    gain2.gain.setValueAtTime(0.15, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    
    osc2.start(now);
    osc2.stop(now + 0.25);
  }, [soundEnabled, getAudioContext]);

  const playClick = useCallback(() => {
    if (!soundEnabled) return;
    
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }, [soundEnabled, getAudioContext]);

  const playError = useCallback(() => {
    if (!soundEnabled) return;
    
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    osc.start(now);
    osc.stop(now + 0.2);
  }, [soundEnabled, getAudioContext]);

  // Founder Decision (RPG removal chunk): playAchievement removed — an
  // RPG achievement-unlock sound with zero live callers (achievements
  // were already archived from the app). playLevelUp removed for the
  // same reason, above.
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev: boolean) => !prev);
  }, []);

  return {
    soundEnabled,
    toggleSound,
    playQuestComplete,
    playClick,
    playTap,
    playError,
  };
};
