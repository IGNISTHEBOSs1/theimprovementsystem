import { useState, useEffect } from 'react';

const TZ_KEY = 'the-system-timezone';

export const useTimezone = () => {
  const [timezone, setTimezone] = useState<string>(() => {
    return localStorage.getItem(TZ_KEY) || '';
  });
  const [showTimezonePrompt, setShowTimezonePrompt] = useState(false);

  useEffect(() => {
    if (!timezone) {
      // Auto-detect browser timezone
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        setTimezone(detected);
        localStorage.setItem(TZ_KEY, detected);
      } else {
        setShowTimezonePrompt(true);
      }
    }
  }, []);

  const confirmTimezone = (tz: string) => {
    setTimezone(tz);
    localStorage.setItem(TZ_KEY, tz);
    setShowTimezonePrompt(false);
  };

  // Get today's date string in user's timezone
  const getTodayString = () => {
    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    return new Date().toLocaleDateString('en-CA', { timeZone: tz });
  };

  // Get current hour in user's timezone
  const getCurrentHour = () => {
    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    return parseInt(new Date().toLocaleString('en-US', { timeZone: tz, hour: 'numeric', hour12: false }));
  };

  return {
    timezone,
    showTimezonePrompt,
    confirmTimezone,
    getTodayString,
    getCurrentHour,
  };
};
