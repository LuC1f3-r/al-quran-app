import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { TopHeader } from '../components/TopHeader';
import { PillButton } from '../components/PillButton';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { SURAHS } from '../data/surahs';
import { useAppStore } from '../store/useAppStore';
import { fetchChapters, RECITERS, type Chapter } from '../services/quranApi';
import { useApiData } from '../hooks/useApiData';
import { getQuranFontFamily } from '../utils/quranFont';

export default function SurahIndexScreen() {
  const router = useRouter();
  const reciter = useAppStore((state) => state.settings.reciter);
  const setReciter = useAppStore((state) => state.setReciter);
  const playTrack = useAppStore((state) => state.playTrack);
  const [reciterModalVisible, setReciterModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const quranScript = useAppStore((state) => state.settings.quranScript);
  const quranFont = getQuranFontFamily(quranScript);

  /* Fetch live chapters */
  const { data: chapters, loading } = useApiData(() => fetchChapters(), []);

  /* Map API chapters to the shape we need, fall back to static */
  const surahList = useMemo(() => {
    if (!chapters) {
      return SURAHS.map((s) => ({
        number: s.number,
        englishName: s.englishName,
        arabicName: s.arabicName,
        startPage: s.startPage,
        versesCount: 0,
        translatedName: '',
        revelationPlace: '',
      }));
    }
    return chapters.map((c) => ({
      number: c.id,
      englishName: c.nameSimple,
      arabicName: c.nameArabic,
      startPage: c.pages[0],
      versesCount: c.versesCount,
      translatedName: c.translatedName,
      revelationPlace: c.revelationPlace,
    }));
  }, [chapters]);

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return surahList;
    const q = searchQuery.toLowerCase();
    return surahList.filter(
      (s) =>
        s.englishName.toLowerCase().includes(q) ||
        s.arabicName.includes(q) ||
        s.translatedName.toLowerCase().includes(q) ||
        String(s.number).includes(q),
    );
  }, [surahList, searchQuery]);

  return (
    <View style={styles.container}>
      <TopHeader
        title="Surah Index"
        onBackPress={() => router.back()}
        rightNode={<Ionicons name="search" size={34} color={COLORS.white} />}
      />

      <Pressable style={styles.reciterCard} onPress={() => setReciterModalVisible(true)}>
        <View style={styles.reciterAvatar}>
          <MaterialCommunityIcons name="account-voice" size={28} color={COLORS.primaryGreenSoft} />
        </View>

        <View style={styles.reciterTextWrap}>
          <Text style={styles.reciterLabel}>Reciter</Text>
          <Text style={styles.reciterValue}>{reciter}</Text>
        </View>

        <MaterialCommunityIcons name="chevron-down" size={28} color="#9BD3A0" />
      </Pressable>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primaryGreenSoft} />
          <Text style={styles.loadingText}>Loading surahs…</Text>
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.number.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={styles.rowItem}
              onPress={() =>
                router.push({
                  pathname: '/reader',
                  params: {
                    page: String(item.startPage),
                    surahName: item.englishName,
                    surahNumber: String(item.number),
                  },
                })
              }
            >
              <View style={styles.rowLeft}>
                <View style={styles.numberBadge}>
                  <Text style={styles.numberText}>{item.number}</Text>
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={styles.surahEnglish}>{item.englishName}</Text>
                  <Text style={styles.surahMeta}>
                    {item.translatedName ? `${item.translatedName} · ` : ''}
                    {item.versesCount > 0 ? `${item.versesCount} verses` : ''}
                    {item.revelationPlace ? ` · ${item.revelationPlace}` : ''}
                  </Text>
                </View>
              </View>

              <Text style={[styles.surahArabic, { fontFamily: quranFont }]}>{item.arabicName}</Text>

              <View style={styles.rowActions}>
                <PillButton
                  label="PLAY"
                  icon="play"
                  compact
                  onPress={() =>
                    router.push(
                      `/now-playing?surahNumber=${item.number}&surahName=${item.englishName}&surahNameArabic=${encodeURIComponent(item.arabicName)}&totalVerses=${item.versesCount}`,
                    )
                  }
                />

                <PillButton
                  label="READ"
                  icon="book-open-variant"
                  compact
                  onPress={() =>
                    router.push(
                      `/quran-page?pageNumber=${item.startPage}&surahName=${item.englishName}`,
                    )
                  }
                />
              </View>
            </Pressable>
          )}
        />
      )}

      <Modal transparent visible={reciterModalVisible} onRequestClose={() => setReciterModalVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setReciterModalVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose Reciter</Text>
            {RECITERS.map((r) => (
              <Pressable
                key={r.id}
                style={[styles.reciterOption, r.name === reciter && styles.reciterOptionActive]}
                onPress={() => {
                  setReciter(r.name);
                  setReciterModalVisible(false);
                }}
              >
                <Text style={[styles.reciterOptionText, r.name === reciter && styles.reciterOptionTextActive]}>
                  {r.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  reciterCard: {
    marginHorizontal: SPACING.md,
    marginTop: 10,
    backgroundColor: '#0A7A38',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  reciterAvatar: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reciterTextWrap: {
    flex: 1,
  },
  reciterLabel: {
    color: '#D4F0D7',
    fontSize: 14,
  },
  reciterValue: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 17,
    marginTop: 2,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingBottom: 130,
  },
  rowItem: {
    borderBottomWidth: 1,
    borderColor: '#EBEEF1',
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  numberBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#EFF6F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    color: COLORS.primaryGreen,
    fontSize: 13,
    fontWeight: '800',
  },
  rowTextCol: {
    flex: 1,
    gap: 2,
  },
  surahEnglish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  surahMeta: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  surahArabic: {
    fontSize: 22,
    color: COLORS.gold,
    marginRight: 8,
  },
  rowActions: {
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000050',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  reciterOption: {
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
  },
  reciterOptionActive: {
    backgroundColor: '#E7F5E8',
  },
  reciterOptionText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  reciterOptionTextActive: {
    color: COLORS.primaryGreenSoft,
  },
});
