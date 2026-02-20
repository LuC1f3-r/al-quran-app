import { useEffect, useState, useCallback, useRef } from 'react';
import {
    Dimensions,
    Image,
    Pressable,
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
        totalVerses?: string;
    }>();

    const surahNumber = Number(params.surahNumber ?? 1);
    const surahName = params.surahName ?? 'Al-Fatihah';
    const surahNameArabic = params.surahNameArabic ?? 'الفاتحة';
    const totalVerses = Number(params.totalVerses ?? 7);
    const reciter = useAppStore((s) => s.settings.reciter);

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

    return (
        <View style={styles.container}>
            {/* Background image */}
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80' }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
            />
            <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.85)', '#FFFFFF']}
                locations={[0, 0.55, 0.75]}
                style={StyleSheet.absoluteFillObject}
            />

            {/* ── Top bar ── */}
            <View style={styles.topBar}>
                <Pressable onPress={() => { stopAudio(); router.back(); }} style={styles.topBtn}>
                    <MaterialCommunityIcons name="chevron-down" size={28} color="#374151" />
                </Pressable>
                <View style={{ width: 28 }} />
            </View>

            {/* ── Surah Card ── */}
            <View style={styles.surahCard}>
                <Text style={styles.surahNumber}>{surahNumber}. {surahName}</Text>
                <Text style={styles.surahArabic}>{surahNameArabic}</Text>
                <View style={styles.downloadRow}>
                    <MaterialCommunityIcons name="cloud-download-outline" size={18} color="#6B7280" />
                    <Text style={styles.downloadText}>Download</Text>
                </View>
            </View>

            {/* ── Reciter ── */}
            <View style={styles.reciterRow}>
                <View style={styles.reciterAvatar}>
                    <MaterialCommunityIcons name="account" size={20} color="#FFF" />
                </View>
                <Text style={styles.reciterName}>{reciter}</Text>
                <MaterialCommunityIcons name="chevron-down" size={18} color="#6B7280" />
            </View>

            {/* ── Action buttons ── */}
            <View style={styles.actionRow}>
                <Pressable style={styles.actionBtn}>
                    <MaterialCommunityIcons name="alarm" size={22} color="#374151" />
                </Pressable>
                <Pressable style={styles.actionBtn} onPress={cycleSpeed}>
                    <Text style={styles.speedText}>x{speed}</Text>
                </Pressable>
                <Pressable style={styles.actionBtn}>
                    <MaterialCommunityIcons name="bookmark-outline" size={22} color="#374151" />
                </Pressable>
            </View>

            {/* ── Ayah indicator ── */}
            <Text style={styles.ayahIndicator}>
                Ayah {currentAyah} of {totalVerses}
            </Text>

            {/* ── Progress bar ── */}
            <View style={styles.progressSection}>
                <Text style={styles.timeText}>{formatTime(audio.positionMs)}</Text>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                    <View
                        style={[
                            styles.progressThumb,
                            { left: `${progress * 100}%` },
                        ]}
                    />
                </View>
                <Text style={styles.timeText}>{formatTime(audio.durationMs)}</Text>
            </View>

            {/* ── Controls ── */}
            <View style={styles.controlRow}>
                <Pressable onPress={() => setRepeatMode((m) => (m + 1) % 2)}>
                    <MaterialCommunityIcons
                        name={repeatMode === 0 ? 'repeat' : 'repeat-once'}
                        size={26}
                        color={repeatMode > 0 ? '#22C55E' : '#9CA3AF'}
                    />
                </Pressable>

                <Pressable onPress={handlePrevious} style={styles.skipBtn}>
                    <MaterialCommunityIcons name="skip-previous" size={36} color="#1F2937" />
                </Pressable>

                <Pressable style={styles.playBtn} onPress={handlePlayPause}>
                    <MaterialCommunityIcons
                        name={isPlaying ? 'pause' : 'play'}
                        size={40}
                        color={COLORS.white}
                    />
                </Pressable>

                <Pressable onPress={handleNext} style={styles.skipBtn}>
                    <MaterialCommunityIcons name="skip-next" size={36} color="#1F2937" />
                </Pressable>

                <Pressable onPress={() => router.push(`/reader?surahNumber=${surahNumber}&surahName=${surahName}`)}>
                    <MaterialCommunityIcons name="playlist-music" size={26} color="#9CA3AF" />
                </Pressable>
            </View>

            <View style={{ height: 36 }} />
        </View>
    );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        justifyContent: 'flex-end',
    },

    topBar: {
        position: 'absolute',
        top: 52,
        left: SPACING.md,
        right: SPACING.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    topBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    surahCard: {
        alignSelf: 'center',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        paddingVertical: 20,
        paddingHorizontal: 40,
        alignItems: 'center',
        shadowColor: '#001122',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
        marginBottom: 20,
    },
    surahNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 4,
    },
    surahArabic: {
        fontSize: 36,
        color: '#1F2937',
        fontWeight: '400',
        lineHeight: 56,
    },
    downloadRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: RADIUS.pill,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    downloadText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },

    reciterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 14,
    },
    reciterAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#2FA56C',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reciterName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },

    actionRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 10,
    },
    actionBtn: {
        width: 46,
        height: 46,
        borderRadius: 23,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    speedText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#374151',
    },

    ayahIndicator: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
    },

    progressSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        gap: 10,
        marginBottom: 16,
    },
    timeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#9CA3AF',
        width: 54,
        textAlign: 'center',
    },
    progressTrack: {
        flex: 1,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#E5E7EB',
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
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },

    controlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 10,
    },
    skipBtn: {
        padding: 4,
    },
    playBtn: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#22C55E',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#BBF7D0',
        shadowColor: '#22C55E',
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
});
