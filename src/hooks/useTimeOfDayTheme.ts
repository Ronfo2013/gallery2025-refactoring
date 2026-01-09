import { useEffect, useState } from 'react';

type ThemeVariant = 'day' | 'night';

const getTimeOfDayVariant = (): ThemeVariant => {
  const hour = new Date().getHours();
  // 7-18 = giorno, resto notte
  return hour >= 7 && hour < 18 ? 'day' : 'night';
};

export const useTimeOfDayTheme = () => {
  const [variant, setVariant] = useState<ThemeVariant>(getTimeOfDayVariant());

  useEffect(() => {
    const update = () => setVariant(getTimeOfDayVariant());
    // Aggiorna ogni 15 minuti
    const id = setInterval(update, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const isDay = variant === 'day';
  const isNight = variant === 'night';

  return { variant, isDay, isNight };
};

