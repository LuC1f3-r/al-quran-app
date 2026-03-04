import { useEffect, useState, useCallback, useRef } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { COLORS, RADIUS, SPACING } from '../constants/theme';
import {
    getState as getAudioState,
    subscribe,
    pauseAudio,
    resumeAudio,
    playSurah,
    playAyah,
    stopAudio,
} from '../services/audioPlayer';
import { useAppStore } from '../store/useAppStore';
import { RECITERS } from '../services/quranApi';
import { useSubscriptionStore, isReciterLocked } from '../store/useSubscriptionStore';

const { width: SCREEN_W } = Dimensions.get('window');

/* ── Helpers ── */

function formatTime(ms: number) {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ */
/*  Full-Screen Player                                                */
/* ------------------------------------------------------------------ */

export default function NowPlayingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        surahNumber?: string;
        surahName?: string;
        surahNameArabic?: string;
        translatedName?: string;
        totalVerses?: string;
    }>();

    const surahNumber = Number(params.surahNumber ?? 1);
    const surahName = params.surahName ?? 'Al-Fatihah';
    const surahNameArabic = params.surahNameArabic ?? 'الفاتحة';
    const translatedName = params.translatedName ?? '';
    const totalVerses = Number(params.totalVerses ?? 7);
    const reciter = useAppStore((s) => s.settings.reciter);
    const setReciter = useAppStore((s) => s.setReciter);
    const subPlan = useSubscriptionStore((s) => s.plan);

    /* ── Audio state ── */
    const [audio, setAudio] = useState(getAudioState());
    useEffect(() => subscribe(setAudio), []);

    /* Whether we've started playback for this session */
    const started = useRef(false);

    /* ── Auto-start playing the whole surah on mount ── */
    useEffect(() => {
        if (!started.current) {
            started.current = true;
            playSurah(surahNumber, totalVerses, reciter);
        }
    }, [surahNumber, totalVerses, reciter]);

    /* ── Reciter modal ── */
    const [reciterModalVisible, setReciterModalVisible] = useState(false);

    /* ── Repeat mode: 0 = none, 1 = repeat surah ── */
    const [repeatMode, setRepeatMode] = useState(0);

    /* ── Playback speed ── */
    const [speed, setSpeed] = useState(1);
    const speeds = [1, 1.25, 1.5, 2];
    const cycleSpeed = () => {
        const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
        setSpeed(next);
    };

    /* ── Controls ── */
    const isThisSurah = audio.currentSurah === surahNumber;
    const isPlaying = audio.isPlaying && isThisSurah;
    const currentAyah = isThisSurah ? audio.currentAyah : 1;

    const handlePlayPause = useCallback(async () => {
        if (isPlaying) {
            await pauseAudio();
        } else if (isThisSurah && !audio.isPlaying) {
            await resumeAudio();
        } else {
            await playSurah(surahNumber, totalVerses, reciter);
        }
    }, [isPlaying, isThisSurah, audio.isPlaying, surahNumber, totalVerses, reciter]);

    const handlePrevious = useCallback(async () => {
        const prev = Math.max(1, currentAyah - 1);
        await stopAudio();
        await playSurah(surahNumber, totalVerses, reciter, prev);
    }, [currentAyah, surahNumber, totalVerses, reciter]);

    const handleNext = useCallback(async () => {
        const next = Math.min(totalVerses, currentAyah + 1);
        await stopAudio();
        await playSurah(surahNumber, totalVerses, reciter, next);
    }, [currentAyah, totalVerses, surahNumber, reciter]);

    /* ── Progress ── */
    const progress = audio.durationMs > 0 ? audio.positionMs / audio.durationMs : 0;

    /* ── Now playing subtitle ── */
    const nowPlayingSubtitle = `Surah ${surahNumber} • ${surahName}`;

    return (
        <View style={styles.container}>
            {/* Background image — mosque / minaret */}
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80' }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
            />
            {/* Subtle darkening overlay so text is readable */}
            <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.45)']}
                locations={[0, 0.35, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            {/* ── Top bar ── */}
            <View style={styles.topBar}>
                <Pressable onPress={() => { stopAudio(); router.back(); }} style={styles.topBtn}>
                    <MaterialCommunityIcons name="chevron-down" size={28} color="#FFFFFF" />
                </Pressable>

                <View style={styles.topCenter}>
                    <Text style={styles.topTitle}>NOW PLAYING</Text>
                    <Text style={styles.topSubtitle}>{nowPlayingSubtitle}</Text>
                </View>

                {/* Placeholder for symmetry */}
                <View style={{ width: 40, height: 40 }} />
            </View>

            {/* ── Flex spacer to center the card ── */}
            <View style={{ flex: 1 }} />

            {/* ── Surah Card (centered) ── */}
            <View style={styles.surahCard}>
                <Text style={styles.surahNumber}>{surahNumber}. {surahName}</Text>
                <Text style={styles.surahArabic}>{surahNameArabic}</Text>
                {translatedName ? (
                    <Text style={styles.surahTranslated}>{translatedName}</Text>
                ) : null}
                <Pressable style={styles.downloadRow}>
                    <MaterialCommunityIcons name="cloud-download-outline" size={18} color="#6B7280" />
                    <Text style={styles.downloadText}>Download</Text>
                </Pressable>
            </View>

            {/* ── Flex spacer to center the card ── */}
            <View style={{ flex: 1 }} />

            {/* ── Reciter pill (tappable → opens modal) ── */}
            <Pressable style={styles.reciterPill} onPress={() => setReciterModalVisible(true)}>
                <View style={styles.reciterAvatar}>
                    <MaterialCommunityIcons name="account" size={18} color="#FFF" />
                </View>
                <Text style={styles.reciterName} numberOfLines={1}>{reciter}</Text>
                <MaterialCommunityIcons name="chevron-down" size={18} color="rgba(255,255,255,0.7)" />
            </Pressable>

            {/* ── Action buttons ── */}
            <View style={styles.actionRow}>
                <Pressable style={styles.actionBtn}>
                    <MaterialCommunityIcons name="information-outline" size={22} color="rgba(255,255,255,0.8)" />
                </Pressable>
                <Pressable style={styles.actionBtn} onPress={cycleSpeed}>
                    <Text style={styles.speedText}>{speed}x</Text>
                </Pressable>
                <Pressable style={styles.actionBtn}>
                    <MaterialCommunityIcons name="bookmark-outline" size={22} color="rgba(255,255,255,0.8)" />
                </Pressable>
            </View>

            {/* ── Ayah indicator ── */}
            <Text style={styles.ayahIndicator}>
                Ayah {currentAyah} of {totalVerses}
            </Text>

            {/* ── Progress bar ── */}
            <View style={styles.progressSection}>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                    <View
                        style={[
                            styles.progressThumb,
                            { left: `${progress * 100}%` },
                        ]}
                    />
                </View>
                <View style={styles.timeRow}>
                    <Text style={styles.timeText}>{formatTime(audio.positionMs)}</Text>
                    <Text style={styles.timeText}>{formatTime(audio.durationMs)}</Text>
                </View>
            </View>

            {/* ── Controls ── */}
            <View style={styles.controlRow}>
                <Pressable onPress={() => setRepeatMode((m) => (m + 1) % 2)}>
                    <MaterialCommunityIcons
                        name={repeatMode === 0 ? 'repeat' : 'repeat-once'}
                        size={26}
                        color={repeatMode > 0 ? '#22C55E' : 'rgba(255,255,255,0.5)'}
                    />
                </Pressable>

                <Pressable onPress={handlePrevious} style={styles.skipBtn}>
                    <MaterialCommunityIcons name="skip-previous" size={36} color="#FFFFFF" />
                </Pressable>

                <Pressable style={styles.playBtn} onPress={handlePlayPause}>
                    <MaterialCommunityIcons
                        name={isPlaying ? 'pause' : 'play'}
                        size={40}
                        color={COLORS.white}
                    />
                </Pressable>

                <Pressable onPress={handleNext} style={styles.skipBtn}>
                    <MaterialCommunityIcons name="skip-next" size={36} color="#FFFFFF" />
                </Pressable>

                <Pressable onPress={() => router.push(`/reader?surahNumber=${surahNumber}&surahName=${surahName}`)}>
                    <MaterialCommunityIcons name="playlist-music" size={26} color="rgba(255,255,255,0.5)" />
                </Pressable>
            </View>

            <View style={{ height: 48 }} />

            {/* ═══════════════════════════════════════════════════════ */}
            {/* ── Reciter picker modal ──                             */}
            {/* ═══════════════════════════════════════════════════════ */}
            <Modal transparent visible={reciterModalVisible} onRequestClose={() => setReciterModalVisible(false)}>
                <Pressable style={styles.modalBackdrop} onPress={() => setReciterModalVisible(false)}>
                    <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>Choose Reciter</Text>
                        <Text style={styles.modalHint}>{RECITERS.length} reciters available</Text>
                        <ScrollView style={styles.reciterScroll} showsVerticalScrollIndicator={false}>
                            {RECITERS.map((r, idx) => {
                                const isActive = r.name === reciter;
                                const locked = isReciterLocked(r.id, subPlan);
                                const initials = r.name
                                    .replace(/\(.*\)/g, '')
                                    .trim()
                                    .split(/[\s-]+/)
                                    .filter((w) => w.length > 0)
                                    .slice(0, 2)
                                    .map((w) => w[0].toUpperCase())
                                    .join('');
                                const hue = (idx * 37) % 360;
                                const avatarBg = locked
                                    ? '#D1D5DB'
                                    : `hsl(${hue}, 55%, ${isActive ? '40%' : '65%'})`;
                                const quality = r.folder.match(/(\d+)kbps/)?.[1] ?? '';

                                return (
                                    <Pressable
                                        key={r.id}
                                        style={[styles.reciterRow, isActive && styles.reciterRowActive, locked && { opacity: 0.6 }]}
                                        onPress={() => {
                                            if (locked) {
                                                Alert.alert(
                                                    'Premium Reciter 🔒',
                                                    `${r.name} is available on the Premium plan.`,
                                                    [
                                                        { text: 'Cancel', style: 'cancel' },
                                                        { text: 'Upgrade', onPress: () => { setReciterModalVisible(false); router.push('/subscription'); } },
                                                    ],
                                                );
                                                return;
                                            }
                                            setReciter(r.name);
                                            setReciterModalVisible(false);
                                        }}
                                    >
                                        <View style={[styles.reciterBubble, { backgroundColor: avatarBg }]}>
                                            {locked ? (
                                                <MaterialCommunityIcons name="lock" size={18} color="#fff" />
                                            ) : (
                                                <Text style={styles.reciterInitials}>{initials}</Text>
                                            )}
                                        </View>
                                        <View style={styles.reciterInfo}>
                                            <Text
                                                style={[styles.reciterLabel, isActive && styles.reciterLabelActive]}
                                                numberOfLines={1}
                                            >
                                                {r.name}
                                            </Text>
                                            {locked ? (
                                                <Text style={[styles.reciterQuality, { color: '#F59E0B' }]}>Premium</Text>
                                            ) : quality ? (
                                                <Text style={styles.reciterQuality}>{quality} kbps</Text>
                                            ) : null}
                                        </View>
                                        {isActive && !locked && (
                                            <MaterialCommunityIcons name="check-circle" size={22} color="#22C55E" />
                                        )}
                                        {locked && (
                                            <MaterialCommunityIcons name="lock-outline" size={20} color="#9CA3AF" />
                                        )}
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A2E',
    },

    /* ── Top bar ── */
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 56,
        paddingHorizontal: SPACING.md,
    },
    topBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    topCenter: {
        alignItems: 'center',
    },
    topTitle: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 2,
    },
    topSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },

    /* ── Surah card ── */
    surahCard: {
        alignSelf: 'center',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        paddingVertical: 24,
        paddingHorizontal: 44,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
        width: SCREEN_W * 0.78,
    },
    surahNumber: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 6,
    },
    surahArabic: {
        fontSize: 38,
        color: '#1F2937',
        fontWeight: '400',
        lineHeight: 58,
    },
    surahTranslated: {
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '500',
        marginTop: 2,
    },
    downloadRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: RADIUS.pill,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    downloadText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
    },

    /* ── Reciter pill ── */
    reciterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        gap: 8,
        backgroundColor: 'rgba(34,197,94,0.85)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: RADIUS.pill,
        marginBottom: 18,
    },
    reciterAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reciterName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        maxWidth: SCREEN_W * 0.5,
    },

    /* ── Action buttons ── */
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 18,
        marginBottom: 14,
    },
    actionBtn: {
        width: 46,
        height: 46,
        borderRadius: 23,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    speedText: {
        fontSize: 14,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.8)',
    },

    /* ── Ayah indicator ── */
    ayahIndicator: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 10,
    },

    /* ── Progress bar ── */
    progressSection: {
        paddingHorizontal: SPACING.lg,
        marginBottom: 20,
    },
    progressTrack: {
        height: 5,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.2)',
        position: 'relative',
    },
    progressFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        borderRadius: 3,
        backgroundColor: '#22C55E',
    },
    progressThumb: {
        position: 'absolute',
        top: -5,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#22C55E',
        marginLeft: -8,
        shadowColor: '#22C55E',
        shadowOpacity: 0.4,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    timeText: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.5)',
    },

    /* ── Controls ── */
    controlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 22,
        marginBottom: 10,
    },
    skipBtn: {
        padding: 4,
    },
    playBtn: {
        width: 74,
        height: 74,
        borderRadius: 37,
        backgroundColor: '#22C55E',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#22C55E',
        shadowOpacity: 0.45,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },

    /* ── Reciter modal ── */
    modalBackdrop: {
        flex: 1,
        backgroundColor: '#00000060',
        justifyContent: 'center',
        padding: SPACING.md,
    },
    modalCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1F2937',
    },
    modalHint: {
        fontSize: 13,
        color: '#9CA3AF',
        marginBottom: 8,
    },
    reciterScroll: {
        maxHeight: 480,
    },
    reciterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: RADIUS.md,
        gap: 12,
        marginBottom: 6,
        backgroundColor: '#F9FAFB',
    },
    reciterRowActive: {
        backgroundColor: '#ECFDF5',
        borderWidth: 1.5,
        borderColor: '#22C55E',
    },
    reciterBubble: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reciterInitials: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
    reciterInfo: {
        flex: 1,
    },
    reciterLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    reciterLabelActive: {
        color: '#065F46',
        fontWeight: '700',
    },
    reciterQuality: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 1,
    },
});
