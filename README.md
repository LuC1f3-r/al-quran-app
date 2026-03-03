# Al Quran Prototype

> A beautiful, feature-rich Quran companion app built with React Native & Expo.

**Version**: 0.1.0 · **Platform**: Android & iOS · **SDK**: Expo 54

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native `0.81.5` via **Expo SDK 54** |
| Routing | `expo-router` v6 (file-based) |
| State | **Zustand** v5 + `AsyncStorage` persistence |
| Styling | React Native `StyleSheet` |
| Language | TypeScript `5.9` |
| Audio | `expo-av` (Quran recitation + Adhan) |
| PDF Viewer | `react-native-webview` + pdf.js |
| Location | `expo-location` (GPS + reverse geocode) |
| Sensors | `expo-sensors` (Magnetometer for Qibla) |
| Notifications | `expo-notifications` (disabled in Expo Go) |
| Fonts | Custom Arabic fonts (Uthmani, Indo-Pak) |

---

## Project Structure

```
quran-app/
├── app/                    # Screens (expo-router file-based routing)
│   ├── _layout.tsx         # Root layout (fonts, splash, auth gating)
│   ├── index.tsx           # Home screen
│   ├── reader.tsx          # Ayah-by-ayah Quran reader
│   ├── quran-page.tsx      # Full-page PDF Mushaf viewer
│   ├── surah-index.tsx     # Surah listing (114 surahs)
│   ├── juzz-index.tsx      # Juzz listing (30 juzz)
│   ├── go-to-page.tsx      # Jump to specific page (1–604)
│   ├── bookmarks.tsx       # Saved bookmarks
│   ├── prayer-times.tsx    # Prayer times with weekly calendar
│   ├── qibla-compass.tsx   # Live Qibla compass
│   ├── now-playing.tsx     # Full-screen audio player
│   ├── profile.tsx         # Settings & preferences
│   └── onboarding/         # First-time user flow
│       ├── welcome.tsx
│       ├── login.tsx
│       └── signup.tsx
├── components/             # Reusable UI components
│   ├── MiniPlayer.tsx      # Persistent bottom audio bar
│   ├── SplashScreen.tsx    # Animated Bismillah intro
│   ├── TopHeader.tsx       # Reusable screen header
│   ├── PillButton.tsx      # Pill-shaped button
│   └── PrayerSettingsModal.tsx
├── services/               # API & audio services
│   ├── quranApi.ts         # Quran.com API v4 wrapper
│   ├── prayerApi.ts        # Aladhan prayer times API
│   ├── audioPlayer.ts      # Quran recitation audio player
│   ├── adhanPlayer.ts      # Adhan audio player
│   └── notifications.ts   # Prayer notification scheduler
├── store/                  # Zustand state management
│   ├── useAppStore.ts      # Settings, bookmarks, mini player
│   └── useAuthStore.ts     # Auth state & onboarding
├── utils/                  # Helper functions
│   ├── prayer.ts           # Prayer time calculations
│   ├── qibla.ts            # Qibla bearing calculation
│   ├── quranFont.ts        # Script → font family mapper
│   ├── prayerAssets.ts     # Prayer-time GIF selector
│   └── adhanAssets.ts      # Adhan audio asset map
├── data/                   # Static data
│   ├── surahs.ts           # 114 surah metadata
│   ├── juzz.ts             # 30 juzz metadata
│   ├── prayers.ts          # Fallback prayer times
│   └── ayahs.ts            # Ayah count per surah
├── hooks/
│   └── useApiData.ts       # Generic async data fetcher
├── constants/
│   └── theme.ts            # Colors, spacing, radii
└── assets/
    ├── quran/              # PDF Mushafs
    ├── audio/              # Adhan MP3s
    ├── fonts/              # Arabic TTFs
    ├── img/                # UI images
    └── prayer-gifs/        # Prayer-time animations
```

---

## Features

### 🕌 Quran Reading
- **Ayah-by-ayah reader** with Arabic text + English translation (Dr. Mustafa Khattab)
- **Full-page PDF Mushaf** viewer (Uthmani & Indo-Pak scripts)
- **3 script options**: Uthmani, Indo-Pak, Simple (Imlaei)
- **Surah Index** — all 114 surahs with metadata
- **Juzz Index** — 30 juzz with quarter/half/three-quarter start points
- **Go To Page** — jump to any page (1–604)
- **Bookmarks** — save and resume reading positions
- **Last Read** — auto-saves reading position

### 🔊 Audio Recitation
- **4 reciters**: Abdur-Rahman As-Sudais, Mishary Rashid Alafasy, Saad Al-Ghamdi, Abdul Basit
- Per-ayah and full-surah sequential playback
- **Mini Player** — persistent bottom bar across all screens
- **Full-screen Now Playing** — progress bar, speed control (1×–2×)
- Audio streamed from EveryAyah.com CDN

### 🕐 Prayer Times
- **GPS-based** live prayer times via Aladhan API
- **Weekly calendar strip** — scroll through days
- **Next prayer countdown** on home screen
- **Hijri date** display
- **5 adhan sounds**: Makkah, Medinah, Egypt, Turkey, Al-Aqsa
- Per-prayer adhan toggle and preview
- **Prayer notifications** (in development builds)

### 🧭 Qibla Compass
- Live compass using device magnetometer
- Animated rotating dial with cardinal directions
- Qibla bearing calculation from GPS to Kaaba
- "Aligned" detection (±5°) with visual feedback
- Distance to Kaaba display

### 👤 Profile & Settings
- User profile with gender-based avatar
- Quran script selection with Arabic previews
- Reciter selection
- Prayer alert & vibration toggles
- Share, rate, and contact links

### ✨ Onboarding
- Animated Bismillah splash screen (word-by-word reveal)
- Welcome → Signup/Login flow
- Google, Apple, and Email auth options
- Skip onboarding option

---

## External APIs

| API | Base URL | Usage |
|---|---|---|
| Quran.com v4 | `api.quran.com/api/v4` | Chapters, verses, translations |
| Aladhan | `api.aladhan.com/v1` | Prayer times, Hijri dates |
| EveryAyah.com | `everyayah.com/data/` | Ayah audio MP3 streaming |

---

## State Management

### App Store (persisted)
- `settings` — location, reciter, script, prayer alerts, adhan preferences, gender
- `bookmarks` — saved reading positions
- `lastReading` — resume point (page, surah)
- `miniPlayer` — current playback state

### Auth Store (persisted)
- `isAuthenticated` — login status
- `hasCompletedOnboarding` — controls splash → onboarding redirect
- `user` — profile data (name, email, DOB, auth method)

---

## Design System

| Token | Values |
|---|---|
| **Primary Green** | `#2E7D32` / `#43A047` |
| **Gold** | `#C9A227` |
| **Background** | `#F6F7F9` |
| **Spacing** | xs=8, sm=12, md=16, lg=20, xl=24 |
| **Border Radii** | md=14, lg=18, xl=24, pill=999 |
| **Fonts** | UthmanicHafs, UthmaniScript, IndoPakScript |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (Expo Go)
npx expo start

# Start with tunnel (for remote devices)
npx expo start --tunnel

# Clear cache and start
npx expo start --clear

# Fix package version mismatches
npx expo install --fix
```

## Build

```bash
# EAS Build (production)
eas build --platform android
eas build --platform ios
```

**Android package**: `com.prototype.alquran`

---

## Known Issues

| Issue | Status | Notes |
|---|---|---|
| `expo-notifications` crashes in Expo Go | ✅ Fixed | Detected via `Constants.executionEnvironment`, module skipped |
| `expo-av` deprecated in SDK 54 | ⚠️ Warning | Migrate to `expo-audio` + `expo-video` |
| App size ~300MB | ⚠️ Open | Prayer GIFs (181MB) + PDFs (87MB) dominate |
| PDF Mushaf loading slow | ⚠️ Open | 55MB PDF loaded entirely via pdf.js in WebView |

---

## Optimization Roadmap

| Optimization | Size Impact | Priority |
|---|---|---|
| Replace prayer GIFs with static images + CSS animations | **-181MB** | 🔴 High |
| Move Quran PDFs to CDN, use pre-rendered page images | **-87MB** + faster loads | 🔴 High |
| Compress adhan MP3s to 64kbps | **-7MB** | 🟡 Medium |
| Migrate `expo-av` → `expo-audio` | Future-proof | 🟡 Medium |

**Target**: ~300MB → **10-15MB** with CDN-hosted assets

---

## License

Private — Al Quran Prototype
