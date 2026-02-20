export type PrayerTime = {
  id: string;
  name: string;
  time24: string;
};

export const PRAYER_TIMES: PrayerTime[] = [
  { id: 'tahajjud', name: 'Tahajjud', time24: '00:01' },
  { id: 'fajr', name: 'Fajr', time24: '04:45' },
  { id: 'sunrise', name: 'Sunrise', time24: '06:47' },
  { id: 'dhuhr', name: 'Dhuhr', time24: '12:50' },
  { id: 'asr', name: 'Asr', time24: '16:05' },
  { id: 'maghrib', name: 'Maghrib', time24: '17:55' },
  { id: 'isha', name: 'Isha', time24: '20:25' },
];

export const HOME_WIDGET_DATE = {
  islamic: 'Jumada al-Thani 10',
  gregorian: 'Monday, 1 December',
};

export const PRAYER_SCREEN_DATE = {
  islamic: '22, Jumada al-Thani 1447 AH',
  gregorian: 'Saturday, 13 December 2025',
};
