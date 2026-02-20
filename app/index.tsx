import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { PRAYER_TIMES } from '../data/prayers';
import { formatCountdown, getNextPrayer, getTimeOfDayTheme, toDisplayTime } from '../utils/prayer';
import { useAppStore } from '../store/useAppStore';
import { fetchPrayerTimesByCoords, timingsToList, type PrayerTimesResponse } from '../services/prayerApi';
import { PRAYER_GIFS, getCurrentPrayerGif } from '../utils/prayerAssets';

/* ------------------------------------------------------------------ */
/*  Static data                                                       */
/* ------------------------------------------------------------------ */

const isFriday = new Date().getDay() === 5;

const prayerShortcutKeys = [
  { key: 'fajr', label: 'Fajr', icon: 'weather-sunset-up' as const, id: 'fajr' },
  { key: 'dhuhr', label: isFriday ? 'Jummah' : 'Dhuhr', icon: isFriday ? 'mosque' as const : 'white-balance-sunny' as const, id: 'dhuhr' },
  { key: 'asr', label: 'Asr', icon: 'weather-partly-cloudy' as const, id: 'asr' },
  { key: 'maghrib', label: 'Maghrib', icon: 'weather-sunset-down' as const, id: 'maghrib' },
  { key: 'isha', label: 'Isha', icon: 'weather-night' as const, id: 'isha' },
];

const quickActions = [
  { key: 'quran', title: 'Quran', image: require('../assets/img/quran-2.png'), route: '/surah-index' as const, bg: '#E8F5E9' },
  { key: 'juzz', title: 'Juzz', image: require('../assets/img/juzz.png'), route: '/juzz-index' as const, bg: '#FFF3E0' },
  { key: 'goto', title: 'Go To', image: require('../assets/img/search.png'), route: '/go-to-page' as const, bg: '#E3F2FD' },
  { key: 'bookmarks', title: 'Bookmarks', image: require('../assets/img/bookmark.png'), route: '/bookmarks' as const, bg: '#FCE4EC' },
  { key: 'dua', title: 'Dua', image: require('../assets/img/dua.png'), route: null, bg: '#F3E5F5' },
  { key: 'hadith', title: 'Hadith', image: require('../assets/img/hadith.png'), route: null, bg: '#E0F7FA' },
  { key: 'tasbeeh', title: 'Tasbeeh', image: require('../assets/img/tasbih.png'), route: null, bg: '#FFF8E1' },
  { key: 'salah', title: 'Salah', image: require('../assets/img/shalat.png'), route: null, bg: '#E8EAF6' },
  { key: 'compass', title: 'Compass', image: require('../assets/img/compass.png'), route: null, bg: '#E0F2F1' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function HomeScreen() {
  const router = useRouter();
  const [now, setNow] = useState(new Date());
  const lastReading = useAppStore((s) => s.lastReading);

  /* ── Live prayer times ── */
  const [livePrayers, setLivePrayers] = useState<ReturnType<typeof timingsToList> | null>(null);
  const [prayerData, setPrayerData] = useState<PrayerTimesResponse | null>(null);
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        const data = await fetchPrayerTimesByCoords(loc.coords.latitude, loc.coords.longitude);
        if (cancelled) return;

        setLivePrayers(timingsToList(data.timings));
        setPrayerData(data);

        // Reverse geocode for location name
        const addresses = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (!cancelled && addresses.length > 0) {
          const a = addresses[0];
          setLocationName([a.city, a.region, a.country].filter(Boolean).join(', '));
        }
      } catch {
        // Silently fall back to static times
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── Clock ── */
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const prayerList = livePrayers ?? PRAYER_TIMES;
  const nextPrayer = useMemo(() => getNextPrayer(prayerList, now), [now, prayerList]);
  const theme = useMemo(() => getTimeOfDayTheme(now), [now]);
  const timeText = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  /* prayer time map for shortcuts */
  const prayerTimeMap = useMemo(() => {
    const map: Record<string, string> = {};
    prayerList.forEach((p) => {
      map[p.id] = toDisplayTime(p.time24).replace(/ (AM|PM)/, '');
    });
    return map;
  }, [prayerList]);

  /* Hijri date string */
  const hijriText = prayerData
    ? `${prayerData.hijri.day} ${prayerData.hijri.month} ${prayerData.hijri.year} AH`
    : '';

  return (
    <View style={styles.container}>
      {/* ───────── HERO (tappable → prayer-times) ───────── */}
      <Pressable
        onPress={() => router.push('/prayer-times')}
        style={[styles.heroArea, { backgroundColor: theme.heroBackground }]}
      >
        <Image
          source={getCurrentPrayerGif(now)}
          style={{ position: 'absolute', top: 0, left: 0, width: '120%', height: '130%' }}
          resizeMode="cover"
          fadeDuration={0}
        />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />

        {/* header row */}
        <View style={styles.heroHeaderRow}>
          <View>
            <Text style={styles.greeting}>Assalamu alaikum</Text>
            <Text style={styles.userName}>Usman Ghani</Text>
          </View>
          <Pressable
            onPress={() => router.push('/profile')}
            style={[styles.avatarBubble, { backgroundColor: theme.heroBackgroundAlt }]}
          >
            <MaterialCommunityIcons name="account" size={20} color={COLORS.white} />
          </Pressable>
        </View>

        {/* clock */}
        <Text style={styles.clockValue}>{timeText}</Text>
        <Text style={styles.nextPrayerText}>
          {nextPrayer.nextPrayer.name} in {formatCountdown(nextPrayer.countdownSeconds)}
        </Text>
        {hijriText ? <Text style={styles.hijriText}>{hijriText}</Text> : null}

        {/* prayer shortcut row */}
        <View style={styles.prayerShortcutRow}>
          {prayerShortcutKeys.map((p) => {
            const isNext = nextPrayer.nextPrayer.id === p.id;
            return (
              <View key={p.key} style={styles.prayerShortcutItem}>
                <View
                  style={[
                    styles.prayerCircle,
                    {
                      backgroundColor: isNext ? '#FFFFFF30' : theme.accentCircle,
                      borderWidth: isNext ? 2 : 0,
                      borderColor: isNext ? '#FFFFFF90' : 'transparent',
                    },
                  ]}
                >
                  <MaterialCommunityIcons name={p.icon} size={20} color={COLORS.white} />
                </View>
                <Text style={styles.prayerLabel}>{p.label}</Text>
                <Text style={styles.prayerTime}>{prayerTimeMap[p.id] ?? '--'}</Text>
              </View>
            );
          })}
        </View>
      </Pressable>

      {/* ───────── SCROLLABLE BODY ───────── */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* location badge */}
        {locationName ? (
          <View style={styles.locationBadge}>
            <MaterialCommunityIcons name="map-marker" size={14} color="#6B7280" />
            <Text style={styles.locationText}>{locationName}</Text>
          </View>
        ) : null}

        {/* Last Read card */}
        <Pressable
          style={styles.lastReadCard}
          onPress={() =>
            router.push({
              pathname: '/reader',
              params: {
                page: String(lastReading.page),
                surahName: lastReading.surahName ?? 'Al-Fatihah',
                surahNumber: String(lastReading.surahNumber ?? 1),
              },
            })
          }
        >
          <LinearGradient
            colors={['#0F7B3F', '#1AAF5D', '#34D375']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.lastReadLeft}>
            <Text style={styles.lastReadLabel}>Last Read</Text>
            <Text style={styles.lastReadSurah}>{lastReading.surahName ?? 'الفاتحة'}</Text>
            <Text style={styles.lastReadAyah}>Ayah no. {lastReading.page}</Text>

            <View style={styles.continueButton}>
              <Text style={styles.continueText}>Continue</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#0E6A44" />
            </View>
          </View>

          <View style={styles.lastReadRight}>
            <Image
              source={require('../assets/img/quran.png')}
              style={{ width: 100, height: 100 }}
              resizeMode="contain"
            />
          </View>
        </Pressable>

        {/* Quick actions grid */}
        <View style={styles.actionsGrid}>
          {quickActions.map((item) => (
            <Pressable
              key={item.key}
              style={[styles.actionTile, { backgroundColor: item.bg }]}
              onPress={() => item.route && router.push(item.route)}
            >
              <Image
                source={item.image}
                style={styles.actionImage}
                resizeMode="contain"
              />
              <Text style={styles.actionText}>{item.title}</Text>
            </Pressable>
          ))}
        </View>

        {/* Prayer tracker */}
        <Pressable style={styles.prayerTrackerBtn} onPress={() => router.push('/prayer-times')}>
          <MaterialCommunityIcons name="chart-timeline-variant" size={22} color="#1F2937" />
          <Text style={styles.prayerTrackerText}>Prayer Tracker</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" />
        </Pressable>
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },

  /* Hero */
  heroArea: {
    paddingTop: 54,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroAccentBand: {
    position: 'absolute',
    bottom: 0,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  starDot: { position: 'absolute', borderRadius: 10 },
  starDotOne: { top: 68, left: 100, width: 3, height: 3 },
  starDotTwo: { top: 108, right: 60, width: 4, height: 4 },
  starDotThree: { top: 56, right: 40, width: 2, height: 2 },
  starDotFour: { top: 90, left: 200, width: 2, height: 2 },
  starDotFive: { top: 130, left: 50, width: 3, height: 3 },

  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { color: '#D7E8FA', fontSize: 14, fontWeight: '500', letterSpacing: 0.3 },
  userName: { marginTop: 2, color: COLORS.white, fontSize: 22, fontWeight: '800' },
  avatarBubble: {
    width: 40, height: 40, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },

  clockValue: {
    marginTop: SPACING.md,
    textAlign: 'center',
    color: COLORS.white,
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: 2,
  },
  nextPrayerText: {
    marginTop: 4, color: '#CDE4FF', fontSize: 14, fontWeight: '600', textAlign: 'center',
  },
  hijriText: {
    marginTop: 2, color: '#A5C8EE', fontSize: 12, fontWeight: '500', textAlign: 'center',
  },

  prayerShortcutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    paddingHorizontal: 4,
  },
  prayerShortcutItem: { alignItems: 'center', gap: 4, width: '18%' },
  prayerCircle: {
    width: 46, height: 46, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  prayerLabel: { marginTop: 2, color: '#E0EEFF', fontWeight: '700', fontSize: 12 },
  prayerTime: { color: '#B0CCEE', fontSize: 11, fontWeight: '600' },

  /* Body */
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 120,
    gap: SPACING.md,
  },

  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: '#E8EBEF',
  },
  locationText: { color: '#6B7280', fontSize: 12, fontWeight: '600' },

  actionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-around', rowGap: 12,
  },
  actionTile: {
    width: '40%',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  actionImage: {
    width: 72, height: 72,
  },
  actionText: { color: '#374151', fontSize: 15, fontWeight: '800', textAlign: 'center' },

  lastReadCard: {
    borderRadius: RADIUS.xl,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#064E2B',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    padding: SPACING.sm,
  },
  lastReadLeft: { flex: 1, padding: SPACING.lg },
  lastReadLabel: { color: '#C8F5DA', fontSize: 13, fontWeight: '600' },
  lastReadSurah: { marginTop: 6, color: COLORS.white, fontSize: 22, fontWeight: '800' },
  lastReadAyah: { marginTop: 2, color: '#D4FADF', fontSize: 13 },
  continueButton: {
    marginTop: SPACING.md,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  continueText: { color: '#0E6A44', fontSize: 14, fontWeight: '700' },
  lastReadRight: {
    width: 120, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm,
  },

  prayerTrackerBtn: {
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#001122',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  prayerTrackerText: { flex: 1, color: '#1F2937', fontWeight: '800', fontSize: 16 },
});
