import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

import { PrayerSettingsModal } from '../components/PrayerSettingsModal';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { PRAYER_TIMES } from '../data/prayers';
import { useAppStore } from '../store/useAppStore';
import { getCurrentPrayerId, toDisplayTime } from '../utils/prayer';
import { fetchPrayerTimesByCoords, timingsToList, type PrayerTimesResponse } from '../services/prayerApi';
import { PRAYER_GIFS, getCurrentPrayerGif } from '../utils/prayerAssets';

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function buildWeekDays(center: Date) {
  const result = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    result.push({
      day: DAY_NAMES[d.getDay()],
      date: String(d.getDate()),
      full: d,
    });
  }
  return result;
}

export default function PrayerTimesScreen() {
  const router = useRouter();
  const storedLocation = useAppStore((state) => state.settings.location);

  const [selectedDateIndex, setSelectedDateIndex] = useState(3); // center
  const [selectedPrayerName, setSelectedPrayerName] = useState('');
  const [settingsVisible, setSettingsVisible] = useState(false);

  /* ── Live prayer times ── */
  const [livePrayers, setLivePrayers] = useState<ReturnType<typeof timingsToList> | null>(null);
  const [prayerData, setPrayerData] = useState<PrayerTimesResponse | null>(null);
  const [locationName, setLocationName] = useState(storedLocation);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        const data = await fetchPrayerTimesByCoords(loc.coords.latitude, loc.coords.longitude);
        if (cancelled) return;

        setLivePrayers(timingsToList(data.timings));
        setPrayerData(data);

        const addresses = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (!cancelled && addresses.length > 0) {
          const a = addresses[0];
          setLocationName([a.city, a.region, a.country].filter(Boolean).join(', '));
        }
      } catch {
        // fall back
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const prayerList = livePrayers ?? PRAYER_TIMES;
  const currentPrayerId = useMemo(() => getCurrentPrayerId(prayerList, new Date()), [prayerList]);
  const weekDays = useMemo(() => buildWeekDays(new Date()), []);

  /* date display */
  const dateStr = prayerData
    ? `${prayerData.gregorian.day} ${prayerData.gregorian.month} ${prayerData.gregorian.year}`
    : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const hijriStr = prayerData
    ? `${prayerData.hijri.day} ${prayerData.hijri.month} ${prayerData.hijri.year} AH`
    : '';

  return (
    <View style={styles.container}>
      {/* ── GIF Header Area ── */}
      <View style={styles.headerHeroArea}>
        <Image
          source={getCurrentPrayerGif(new Date())}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />

        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.topIconButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </Pressable>

          <Text style={styles.topTitle}>Prayer Times</Text>

          <View style={styles.topIconButton} />
        </View>

        <View style={styles.dateCard}>
          <View style={styles.dateTitleRow}>
            <Text style={styles.dateTitle}>{dateStr}</Text>
          </View>
          {hijriStr ? <Text style={styles.hijriSubtitle}>{hijriStr}</Text> : null}

          <View style={styles.daysRow}>
            {weekDays.map((item, index) => {
              const selected = index === selectedDateIndex;
              return (
                <Pressable
                  key={`${item.day}-${item.date}`}
                  style={[styles.dayItem, selected && styles.dayItemSelected]}
                  onPress={() => setSelectedDateIndex(index)}
                >
                  <Text style={[styles.dayLabel, selected && styles.dayLabelSelected]}>{item.day}</Text>
                  <Text style={[styles.dayDate, selected && styles.dayDateSelected]}>{item.date}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={16} color="#6B7280" />
        <Text style={styles.locationText}>{locationName}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primaryGreenSoft} />
          <Text style={styles.loadingHint}>Fetching prayer times…</Text>
        </View>
      ) : (
        <FlatList
          data={prayerList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isActive = item.id === currentPrayerId;

            return (
              <View style={[styles.prayerRow, isActive && styles.prayerRowActive]}>
                <View style={[styles.rowLeadingIcon, isActive && styles.rowLeadingIconActive]}>
                  <Image
                    source={PRAYER_GIFS[item.id] || PRAYER_GIFS['dhuhr']}
                    style={{ width: 38, height: 38, borderRadius: RADIUS.md }}
                    resizeMode="cover"
                  />
                </View>

                <Text style={[styles.prayerName, isActive && styles.prayerNameActive]}>{item.name}</Text>

                <View style={styles.rightWrap}>
                  <Text style={[styles.prayerTime, isActive && styles.prayerTimeActive]}>{toDisplayTime(item.time24)}</Text>
                  <Pressable style={styles.soundBtn}>
                    <MaterialCommunityIcons
                      name="volume-high"
                      size={20}
                      color={isActive ? '#E9FFF3' : '#50B224'}
                    />
                  </Pressable>
                  <Pressable
                    style={styles.soundBtn}
                    onPress={() => {
                      setSelectedPrayerName(item.name);
                      setSettingsVisible(true);
                    }}
                  >
                    <MaterialCommunityIcons name="cog-outline" size={20} color={isActive ? '#E9FFF3' : '#50B224'} />
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}

      <PrayerSettingsModal
        visible={settingsVisible}
        prayerName={selectedPrayerName}
        onClose={() => setSettingsVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F3F6',
  },
  headerHeroArea: {
    paddingHorizontal: SPACING.md,
    paddingTop: 50,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  topIconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.pill,
  },
  topTitle: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: '800',
  },
  dateCard: {
    marginTop: SPACING.md,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  dateTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
  },
  hijriSubtitle: {
    textAlign: 'center',
    marginTop: 2,
    fontSize: 13,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  daysRow: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayItemSelected: {
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dayLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  dayLabelSelected: {
    color: COLORS.white,
    fontWeight: '700',
  },
  dayDate: {
    marginTop: 2,
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
  },
  dayDateSelected: {
    color: COLORS.white,
    fontWeight: '800',
  },
  locationRow: {
    marginTop: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingHint: {
    color: '#6B7280',
    fontSize: 14,
  },
  listContent: {
    paddingTop: SPACING.md,
    paddingBottom: 124,
    gap: 10,
  },
  prayerRow: {
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  prayerRowActive: {
    backgroundColor: '#1D8655',
  },
  rowLeadingIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLeadingIconActive: {
    backgroundColor: '#2AA46B',
  },
  prayerName: {
    marginLeft: SPACING.sm,
    flex: 1,
    color: '#374151',
    fontSize: 17,
    fontWeight: '700',
  },
  prayerNameActive: {
    color: COLORS.white,
  },
  rightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prayerTime: {
    color: '#4B5563',
    fontSize: 17,
    marginRight: 6,
  },
  prayerTimeActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  soundBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
