import { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { COLORS, RADIUS, SPACING } from '../constants/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/**
 * Quran page image URL from quran.com
 * Pages are numbered 1–604
 */
function getPageImageUrl(pageNumber: number): string {
    // Use the Quran.com CDN for high-quality Madani Mushaf pages
    const padded = String(pageNumber).padStart(3, '0');
    return `https://v4.quran.com/images/pages/page${padded}.png`;
}

export default function QuranPageScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        pageNumber?: string;
        surahName?: string;
    }>();

    const initialPage = Math.max(1, Math.min(604, Number(params.pageNumber ?? 1)));
    const surahName = params.surahName ?? '';
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [loading, setLoading] = useState(true);

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setLoading(true);
            setCurrentPage((p) => p - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < 604) {
            setLoading(true);
            setCurrentPage((p) => p + 1);
        }
    };

    return (
        <View style={styles.container}>
            {/* ── Top bar ── */}
            <View style={styles.topBar}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
                </Pressable>
                <View style={styles.topCenter}>
                    <Text style={styles.topTitle}>
                        {surahName ? surahName : 'Quran'}
                    </Text>
                    <Text style={styles.topSub}>Page {currentPage} of 604</Text>
                </View>
                <View style={{ width: 34 }} />
            </View>

            {/* ── Page image ── */}
            <View style={styles.pageContainer}>
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={COLORS.primaryGreenSoft} />
                        <Text style={styles.loadingText}>Loading page…</Text>
                    </View>
                )}
                <Image
                    source={{ uri: getPageImageUrl(currentPage) }}
                    style={styles.pageImage}
                    resizeMode="contain"
                    onLoadEnd={() => setLoading(false)}
                />
            </View>

            {/* ── Bottom nav ── */}
            <View style={styles.bottomBar}>
                <Pressable
                    style={[styles.navBtn, currentPage <= 1 && styles.navBtnDisabled]}
                    onPress={goToPrevPage}
                    disabled={currentPage <= 1}
                >
                    <MaterialCommunityIcons name="chevron-left" size={28} color={currentPage > 1 ? '#1F2937' : '#D1D5DB'} />
                    <Text style={[styles.navText, currentPage <= 1 && styles.navTextDisabled]}>Previous</Text>
                </Pressable>

                <View style={styles.pageIndicator}>
                    <Text style={styles.pageNumber}>{currentPage}</Text>
                </View>

                <Pressable
                    style={[styles.navBtn, currentPage >= 604 && styles.navBtnDisabled]}
                    onPress={goToNextPage}
                    disabled={currentPage >= 604}
                >
                    <Text style={[styles.navText, currentPage >= 604 && styles.navTextDisabled]}>Next</Text>
                    <MaterialCommunityIcons name="chevron-right" size={28} color={currentPage < 604 ? '#1F2937' : '#D1D5DB'} />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FBF8F1',
    },

    topBar: {
        paddingTop: 52,
        paddingBottom: 10,
        paddingHorizontal: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderColor: '#EBEEF1',
    },
    backBtn: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topCenter: {
        alignItems: 'center',
    },
    topTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    topSub: {
        fontSize: 13,
        fontWeight: '500',
        color: '#9CA3AF',
        marginTop: 1,
    },

    pageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        backgroundColor: 'rgba(251,248,241,0.9)',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    pageImage: {
        width: SCREEN_W - 16,
        height: SCREEN_H - 200,
    },

    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingVertical: 12,
        paddingBottom: 36,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderColor: '#EBEEF1',
    },
    navBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: RADIUS.lg,
    },
    navBtnDisabled: {
        opacity: 0.4,
    },
    navText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1F2937',
    },
    navTextDisabled: {
        color: '#D1D5DB',
    },
    pageIndicator: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#22C55E',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#22C55E',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    pageNumber: {
        fontSize: 17,
        fontWeight: '800',
        color: '#FFFFFF',
    },
});
