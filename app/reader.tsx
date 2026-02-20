import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { fetchChapters, fetchVerses, type Chapter, type Verse } from '../services/quranApi';
import { playAyah, pauseAudio, stopAudio, subscribe, getState as getAudioState } from '../services/audioPlayer';

type ReaderParams = {
  page?: string;
  surahName?: string;
  surahNumber?: string;
};

export default function ReaderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<ReaderParams>();
  const surahNumber = useMemo(() => {
    const parsed = Number(params.surahNumber ?? 1);
    return Number.isFinite(parsed) && parsed >= 1 && parsed <= 114 ? Math.round(parsed) : 1;
  }, [params.surahNumber]);

  const surahName = params.surahName ?? 'Al-Fatihah';
  const reciter = useAppStore((state) => state.settings.reciter);
  const quranScript = useAppStore((state) => state.settings.quranScript);
  const addBookmark = useAppStore((state) => state.addBookmark);
  const setLastReading = useAppStore((state) => state.setLastReading);

  /* ── Audio state ── */
  const [audioState, setAudioState] = useState(getAudioState());
  useEffect(() => {
    const unsub = subscribe(setAudioState);
    return unsub;
  }, []);

  /* ── Verse state ── */
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allLoaded, setAllLoaded] = useState(false);

  /* ── Chapter metadata ── */
  const [chapterMeta, setChapterMeta] = useState<Chapter | null>(null);

  /* ── Initial load ── */
  useEffect(() => {
    let cancelled = false;
    setVerses([]);
    setCurrentPage(1);
    setAllLoaded(false);
    (async () => {
      setLoading(true);
      try {
        const [{ verses: v, totalPages: tp }, chapters] = await Promise.all([
          fetchVerses(surahNumber, 1, 50, 131, quranScript),
          fetchChapters(),
        ]);
        if (!cancelled) {
          setVerses(v);
          setTotalPages(tp);
          setAllLoaded(tp <= 1);
          setChapterMeta(chapters.find((c) => c.id === surahNumber) ?? null);
          setLastReading({
            surahName,
            surahNumber,
            page: Number(params.page ?? 1),
          });
        }
      } catch {
        // keep empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [surahNumber, quranScript]);

  /* ── Load more ── */
  const loadMore = useCallback(async () => {
    if (loadingMore || allLoaded || currentPage >= totalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const { verses: moreVerses, totalPages: tp } = await fetchVerses(surahNumber, nextPage, 50, 131, quranScript);
      setVerses((prev) => [...prev, ...moreVerses]);
      setCurrentPage(nextPage);
      if (nextPage >= tp || moreVerses.length === 0) {
        setAllLoaded(true);
      }
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  }, [surahNumber, currentPage, totalPages, loadingMore, allLoaded]);

  /* ── Audio handlers ── */
  const handlePlayAyah = async (ayahNumber: number) => {
    // If already playing this ayah, pause
    if (audioState.isPlaying && audioState.currentSurah === surahNumber && audioState.currentAyah === ayahNumber) {
      await pauseAudio();
    } else {
      await playAyah(surahNumber, ayahNumber, reciter);
    }
  };

  const handleBottomPlayerToggle = async () => {
    if (audioState.isPlaying) {
      await pauseAudio();
    } else if (verses.length > 0) {
      // Play first verse or resume
      const firstVerse = verses[0].verseNumber;
      await playAyah(surahNumber, firstVerse, reciter);
    }
  };

  const meta = chapterMeta;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => { stopAudio(); router.back(); }} style={styles.iconButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </Pressable>
        <Text style={styles.topTitle}>{surahName}</Text>
        <Pressable
          onPress={() =>
            addBookmark({
              page: Number(params.page ?? 1),
              surahName,
              surahNumber,
            })
          }
          style={styles.iconButton}
        >
          <MaterialCommunityIcons name="bookmark-outline" size={24} color="#111827" />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primaryGreenSoft} />
          <Text style={styles.loadingText}>Loading verses…</Text>
        </View>
      ) : (
        <FlatList
          data={verses}
          keyExtractor={(item) => item.verseKey}
          contentContainerStyle={styles.scrollContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            <>
              {/* Surah info card */}
              {meta && (
                <View style={styles.surahCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.surahTitle}>{meta.nameSimple}</Text>
                    <Text style={styles.surahSub}>{meta.translatedName}</Text>
                    <Text style={styles.surahMeta}>{meta.versesCount} Verses</Text>
                    <Text style={styles.surahMeta}>
                      {meta.revelationPlace === 'makkah' ? 'Makkah' : 'Madinah'}
                    </Text>
                  </View>
                  <View style={styles.surahArt}>
                    <MaterialCommunityIcons name="mosque" size={46} color="#1D7F53" />
                  </View>
                </View>
              )}

              {/* Bismillah */}
              {meta?.bismillahPre && (
                <View style={styles.bismillahStrip}>
                  <Text style={styles.bismillahText}>بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</Text>
                </View>
              )}
            </>
          }
          ListFooterComponent={
            <>
              {loadingMore && (
                <ActivityIndicator
                  style={{ paddingVertical: 20 }}
                  size="small"
                  color={COLORS.primaryGreenSoft}
                />
              )}
              {allLoaded && verses.length > 0 && (
                <Text style={styles.endText}>— End of Surah —</Text>
              )}
            </>
          }
          renderItem={({ item }) => {
            const isPlaying =
              audioState.isPlaying &&
              audioState.currentSurah === surahNumber &&
              audioState.currentAyah === item.verseNumber;

            return (
              <View style={[styles.ayahCard, isPlaying && styles.ayahCardPlaying]}>
                <View style={styles.ayahActionsTop}>
                  <View style={styles.ayahNumberBadge}>
                    <Text style={styles.ayahNumber}>{item.verseNumber}</Text>
                  </View>

                  <View style={styles.ayahActionIcons}>
                    <Pressable
                      style={styles.ayahIconBtn}
                      onPress={() => handlePlayAyah(item.verseNumber)}
                    >
                      <MaterialCommunityIcons
                        name={isPlaying ? 'pause-circle' : 'play-circle-outline'}
                        size={24}
                        color={isPlaying ? '#1D8655' : '#1F2A44'}
                      />
                    </Pressable>
                    <Pressable style={styles.ayahIconBtn}>
                      <MaterialCommunityIcons name="heart-outline" size={20} color="#1F2A44" />
                    </Pressable>
                  </View>
                </View>

                <Text style={styles.ayahArabic}>{item.arabicText}</Text>
                <Text style={styles.ayahTranslation}>{item.translation}</Text>
              </View>
            );
          }}
        />
      )}

      {/* Bottom player — tap to expand */}
      <Pressable
        style={styles.bottomPlayer}
        onPress={() =>
          router.push(
            `/now-playing?surahNumber=${surahNumber}&surahName=${surahName}&surahNameArabic=${encodeURIComponent(chapterMeta?.nameArabic ?? '')}&totalVerses=${chapterMeta?.versesCount ?? 7}`,
          )
        }
      >
        <View style={styles.sliderLine}>
          <View
            style={[
              styles.sliderProgress,
              {
                width: audioState.durationMs > 0
                  ? `${(audioState.positionMs / audioState.durationMs) * 100}%`
                  : '0%',
              },
            ]}
          />
        </View>

        <View style={styles.playerRow}>
          <View style={styles.playerLeft}>
            <View style={styles.playerBadge}>
              <MaterialCommunityIcons name="book-open-page-variant" size={18} color="#D7FAE9" />
            </View>
            <View>
              <Text style={styles.playerTitle}>{surahName}</Text>
              <Text style={styles.playerSub}>
                {audioState.currentAyah > 0
                  ? `Verse: ${audioState.currentAyah}`
                  : `${verses.length} verses`}
              </Text>
            </View>
          </View>

          <View style={styles.playerControls}>
            <Pressable
              style={[styles.playerButton, audioState.isPlaying && styles.playerButtonActive]}
              onPress={(e) => { e.stopPropagation(); handleBottomPlayerToggle(); }}
            >
              <MaterialCommunityIcons
                name={audioState.isPlaying ? 'pause' : 'play'}
                size={22}
                color={COLORS.white}
              />
            </Pressable>
            <Pressable style={styles.playerButtonGhost} onPress={(e) => { e.stopPropagation(); stopAudio(); }}>
              <MaterialCommunityIcons name="stop" size={22} color={COLORS.white} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  topBar: {
    paddingTop: 48,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
  },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
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
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 136,
    gap: SPACING.sm,
  },
  surahCard: {
    marginTop: 2,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  surahTitle: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: '800',
  },
  surahSub: {
    marginTop: 2,
    color: '#374151',
    fontSize: 17,
  },
  surahMeta: {
    marginTop: 3,
    color: '#9CA3AF',
    fontSize: 14,
  },
  surahArt: {
    width: 110,
    borderRadius: RADIUS.md,
    backgroundColor: '#F8EFCF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bismillahStrip: {
    borderRadius: RADIUS.md,
    backgroundColor: '#F8F1DF',
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
  },
  bismillahText: {
    textAlign: 'center',
    color: '#AE8332',
    fontSize: 24,
  },
  ayahCard: {
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    padding: SPACING.md,
    gap: 8,
  },
  ayahCardPlaying: {
    borderColor: '#1D8655',
    backgroundColor: '#F0FFF5',
  },
  ayahActionsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },
  ayahNumberBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#EFF6F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahNumber: {
    color: COLORS.primaryGreen,
    fontSize: 13,
    fontWeight: '800',
  },
  ayahActionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ayahIconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahArabic: {
    textAlign: 'right',
    fontSize: 30,
    color: '#0B7B4B',
    lineHeight: 52,
  },
  ayahTranslation: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 27,
  },
  endText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    paddingVertical: 16,
    fontWeight: '600',
  },
  bottomPlayer: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    bottom: 10,
    borderRadius: 24,
    backgroundColor: '#2FA56C',
    overflow: 'hidden',
  },
  sliderLine: {
    height: 4,
    backgroundColor: '#8BD8B0',
  },
  sliderProgress: {
    height: 4,
    backgroundColor: '#FFFFFF',
  },
  playerRow: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playerBadge: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#1E7A4E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  playerSub: {
    marginTop: 2,
    color: '#D9FFE9',
    fontSize: 14,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: '#79D6A7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerButtonActive: {
    backgroundColor: '#FFFFFF30',
  },
  playerButtonGhost: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
