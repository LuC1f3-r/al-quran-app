export type Surah = {
  number: number;
  englishName: string;
  arabicName: string;
  startPage: number;
};

const FIRST_NINE: Array<{ english: string; arabic: string }> = [
  { english: 'Al-Fatihah', arabic: 'سُورَةُ ٱلْفَاتِحَة' },
  { english: 'Al-Baqarah', arabic: 'سُورَةُ ٱلْبَقَرَة' },
  { english: 'Aal-E-Imran', arabic: 'سُورَةُ آلِ عِمْرَان' },
  { english: 'An-Nisa', arabic: 'سُورَةُ ٱلنِّسَاءِ' },
  { english: "Al-Ma'idah", arabic: 'سُورَةُ ٱلْمَائِدَة' },
  { english: "Al-An'am", arabic: 'سُورَةُ ٱلْأَنْعَام' },
  { english: "Al-A'raf", arabic: 'سُورَةُ ٱلْأَعْرَاف' },
  { english: 'Al-Anfal', arabic: 'سُورَةُ ٱلْأَنْفَال' },
  { english: 'At-Tawbah', arabic: 'سُورَةُ ٱلتَّوْبَة' },
];

const START_PAGE_OVERRIDES: Record<number, number> = {
  1: 1,
  2: 2,
  3: 50,
  4: 77,
  5: 106,
  6: 128,
  7: 151,
  8: 177,
  9: 187,
};

const getApproxStartPage = (surahNumber: number) => {
  const ratio = (surahNumber - 1) / 113;
  return Math.max(1, Math.min(604, Math.round(1 + ratio * 603)));
};

export const SURAHS: Surah[] = Array.from({ length: 114 }, (_, index) => {
  const number = index + 1;
  const seeded = FIRST_NINE[index];

  return {
    number,
    englishName: seeded?.english ?? `Surah ${number}`,
    arabicName: seeded?.arabic ?? `سورة ${number}`,
    startPage: START_PAGE_OVERRIDES[number] ?? getApproxStartPage(number),
  };
});
