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

  const playLevelUp = useCallback(() => {
    if (!soundEnabled) return;
    
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Triumphant ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.25, now + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);
      
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.4);
    });

    // Add a shimmering high note at the end
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    
    shimmer.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);
    
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(2093, now + 0.5); // C7
    
    shimmerGain.gain.setValueAtTime(0, now + 0.5);
    shimmerGain.gain.linearRampToValueAtTime(0.2, now + 0.55);
    shimmerGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
    
    shimmer.start(now + 0.5);
    shimmer.stop(now + 1.2);
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

  const playAchievement = useCallback(() => {
    if (!soundEnabled) return;
    
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Magical achievement unlock sound - rising sparkle effect
    const notes = [698.46, 880, 1046.50, 1318.51, 1567.98]; // F5, A5, C6, E6, G6
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.35);
      
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.35);
    });

    // Add a sparkle/chime overlay
    const chime = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    
    chime.connect(chimeGain);
    chimeGain.connect(ctx.destination);
    
    chime.type = 'triangle';
    chime.frequency.setValueAtTime(2637, now + 0.4); // E7
    
    chimeGain.gain.setValueAtTime(0, now + 0.4);
    chimeGain.gain.linearRampToValueAtTime(0.15, now + 0.45);
    chimeGain.gain.exponentialRampToValueAtTime(0.01, now + 1);
    
    chime.start(now + 0.4);
    chime.stop(now + 1);
  }, [soundEnabled, getAudioContext]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev: boolean) => !prev);
  }, []);

  return {
    soundEnabled,
    toggleSound,
    playQuestComplete,
    playLevelUp,
    playClick,
    playError,
    playAchievement,
  };
};
