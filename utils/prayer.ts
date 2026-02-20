import type { PrayerTime } from '../data/prayers';

export const parseTime24ToDate = (time24: string, baseDate: Date) => {
  const [hours, minutes] = time24.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const toDisplayTime = (time24: string) => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const twelveHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${twelveHour}:${String(minutes).padStart(2, '0')} ${period}`;
};

export const getNextPrayer = (prayers: PrayerTime[], now = new Date()) => {
  const sorted = prayers
    .map((prayer) => ({
      prayer,
      date: parseTime24ToDate(prayer.time24, now),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const nextToday = sorted.find((item) => item.date.getTime() > now.getTime());
  if (nextToday) {
    return {
      nextPrayer: nextToday.prayer,
      countdownSeconds: Math.max(0, Math.floor((nextToday.date.getTime() - now.getTime()) / 1000)),
    };
  }

  const tomorrowFirst = new Date(sorted[0].date);
  tomorrowFirst.setDate(tomorrowFirst.getDate() + 1);

  return {
    nextPrayer: sorted[0].prayer,
    countdownSeconds: Math.max(0, Math.floor((tomorrowFirst.getTime() - now.getTime()) / 1000)),
  };
};

export const getCurrentPrayerId = (prayers: PrayerTime[], now = new Date()) => {
  const sorted = prayers
    .map((prayer) => ({
      prayer,
      date: parseTime24ToDate(prayer.time24, now),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  let current = sorted[0].prayer;
  for (const item of sorted) {
    if (item.date.getTime() <= now.getTime()) {
      current = item.prayer;
    }
  }

  return current.id;
};

export const formatCountdown = (seconds: number) => {
  const clamped = Math.max(0, seconds);
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const remainderSeconds = clamped % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainderSeconds).padStart(2, '0')}`;
};

export type TimeOfDayTheme = {
  heroBackground: string;
  heroBackgroundAlt: string;
  accentCircle: string;
  starColor: string;
  label: string;
};

export const getTimeOfDayTheme = (date: Date): TimeOfDayTheme => {
  const hour = date.getHours();

  if (hour >= 4 && hour < 6) {
    // Fajr / Dawn
    return {
      heroBackground: '#0B1D3A',
      heroBackgroundAlt: '#1A3A5C',
      accentCircle: '#2E5E8E',
      starColor: '#BFDFFF',
      label: 'dawn',
    };
  }
  if (hour >= 6 && hour < 10) {
    // Morning / Sunrise
    return {
      heroBackground: '#0E4D64',
      heroBackgroundAlt: '#1A7A8A',
      accentCircle: '#2A9D8F',
      starColor: '#D4F0FF',
      label: 'morning',
    };
  }
  if (hour >= 10 && hour < 15) {
    // Midday
    return {
      heroBackground: '#1565A0',
      heroBackgroundAlt: '#1E88C8',
      accentCircle: '#42A5D6',
      starColor: '#E3F2FD',
      label: 'midday',
    };
  }
  if (hour >= 15 && hour < 17) {
    // Afternoon
    return {
      heroBackground: '#7B5E3A',
      heroBackgroundAlt: '#9B7A4A',
      accentCircle: '#C4944A',
      starColor: '#FFF3D6',
      label: 'afternoon',
    };
  }
  if (hour >= 17 && hour < 19) {
    // Maghrib / Sunset
    return {
      heroBackground: '#6B2A3D',
      heroBackgroundAlt: '#96405A',
      accentCircle: '#C45B70',
      starColor: '#FFD6E0',
      label: 'sunset',
    };
  }
  // Night (19–4)
  return {
    heroBackground: '#0D3A66',
    heroBackgroundAlt: '#162D4A',
    accentCircle: '#3A8FC9',
    starColor: '#BFDFFF',
    label: 'night',
  };
};
