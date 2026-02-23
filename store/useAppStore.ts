import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Bookmark = {
  id: string;
  surahNumber?: number;
  surahName: string;
  page: number;
  createdAt: string;
};

export type ReaderPosition = {
  page: number;
  surahNumber?: number;
  surahName?: string;
};

export type QuranScript = 'uthmani' | 'indopak' | 'imlaei';

export type Settings = {
  location: string;
  reciter: string;
  quranScript: QuranScript;
  prayerAlertsEnabled: boolean;
  vibrationEnabled: boolean;
  adhanPreviewEnabled: boolean;
  /** Selected muezzin / adhan style ID (e.g. 'makkah') */
  selectedAdhan: string;
  /** Per-prayer adhan sound toggle */
  adhanEnabledPrayers: Record<string, boolean>;
  gender: 'male' | 'female';
};

type MiniPlayerState = {
  isPlaying: boolean;
  title: string;
  subtitle: string;
  page: number;
};

type AppState = {
  settings: Settings;
  bookmarks: Bookmark[];
  lastReading: ReaderPosition;
  miniPlayer: MiniPlayerState;
  setLocation: (location: string) => void;
  setReciter: (reciter: string) => void;
  setQuranScript: (script: QuranScript) => void;
  updatePrayerSetting: (key: 'prayerAlertsEnabled' | 'vibrationEnabled' | 'adhanPreviewEnabled', value: boolean) => void;
  setSelectedAdhan: (id: string) => void;
  toggleAdhanForPrayer: (prayerId: string) => void;
  setLastReading: (payload: ReaderPosition) => void;
  addBookmark: (payload: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (id: string) => void;
  playTrack: (payload: { title: string; subtitle: string; page: number }) => void;
  togglePlayPause: () => void;
  stopTrack: () => void;
};

const defaultSettings: Settings = {
  location: 'Mudgal, India',
  reciter: 'Abdur-Rahman As-Sudais',
  quranScript: 'uthmani',
  prayerAlertsEnabled: true,
  vibrationEnabled: true,
  adhanPreviewEnabled: true,
  selectedAdhan: 'makkah',
  adhanEnabledPrayers: {
    fajr: true,
    sunrise: false,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  gender: 'male',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      bookmarks: [],
      lastReading: {
        page: 1,
        surahNumber: 1,
        surahName: 'Al-Fatihah',
      },
      miniPlayer: {
        isPlaying: false,
        title: 'No track selected',
        subtitle: defaultSettings.reciter,
        page: 1,
      },
      setLocation: (location) =>
        set((state) => ({
          settings: {
            ...state.settings,
            location,
          },
        })),
      setReciter: (reciter) =>
        set((state) => ({
          settings: {
            ...state.settings,
            reciter,
          },
          miniPlayer: {
            ...state.miniPlayer,
            subtitle: reciter,
          },
        })),
      setQuranScript: (script) =>
        set((state) => ({
          settings: {
            ...state.settings,
            quranScript: script,
          },
        })),
      updatePrayerSetting: (key, value) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [key]: value,
          },
        })),
      setSelectedAdhan: (id) =>
        set((state) => ({
          settings: {
            ...state.settings,
            selectedAdhan: id,
          },
        })),
      toggleAdhanForPrayer: (prayerId) =>
        set((state) => ({
          settings: {
            ...state.settings,
            adhanEnabledPrayers: {
              ...state.settings.adhanEnabledPrayers,
              [prayerId]: !state.settings.adhanEnabledPrayers[prayerId],
            },
          },
        })),
      setLastReading: (payload) => set(() => ({ lastReading: payload })),
      addBookmark: (payload) =>
        set((state) => {
          const exists = state.bookmarks.some(
            (bookmark) => bookmark.page === payload.page && bookmark.surahName === payload.surahName,
          );

          if (exists) {
            return state;
          }

          const newBookmark: Bookmark = {
            ...payload,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            createdAt: new Date().toISOString(),
          };

          return {
            bookmarks: [newBookmark, ...state.bookmarks],
          };
        }),
      removeBookmark: (id) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((bookmark) => bookmark.id !== id),
        })),
      playTrack: ({ title, subtitle, page }) =>
        set(() => ({
          miniPlayer: {
            isPlaying: true,
            title,
            subtitle,
            page,
          },
        })),
      togglePlayPause: () =>
        set((state) => ({
          miniPlayer: {
            ...state.miniPlayer,
            isPlaying: !state.miniPlayer.isPlaying,
          },
        })),
      stopTrack: () =>
        set((state) => ({
          miniPlayer: {
            ...state.miniPlayer,
            isPlaying: false,
          },
        })),
    }),
    {
      name: 'al-quran-prototype-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        bookmarks: state.bookmarks,
        lastReading: state.lastReading,
      }),
    },
  ),
);
