import { useCallback, useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View,
    type ViewToken,
} from 'react-native';
import { Image } from 'expo-image';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useAppStore, type QuranScript } from '../store/useAppStore';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/* ── Blob store base URL ── */

const BLOB_BASE =
    'https://0rzi132lc8qguh0y.public.blob.vercel-storage.com';

const SCRIPT_PATHS: Record<QuranScript, string> = {
    indopak: 'indopak',
    uthmani: 'uthmani',
    imlaei: 'uthmani', // shares uthmani assets
};

/** Build the remote URL for a given page number and script. */
function getPageUrl(script: QuranScript, page: number): string {
    const folder = SCRIPT_PATHS[script];
    return `${BLOB_BASE}/${folder}/page_${page}.webp`;
}

/* ── Pre-compute the 604 page data items once ── */

const TOTAL_PAGES = 604;
const PAGES = Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1);

/* ── Placeholder blurhash (neutral warm parchment tone) ── */
const PAGE_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0teleVs';

/* ── Viewability config (kept outside component to avoid re-creation) ── */
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 60 };

export default function QuranPageScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        pageNumber?: string;
        surahName?: string;
    }>();

    const quranScript = useAppStore((state) => state.settings.quranScript);
    const setLastReading = useAppStore((state) => state.setLastReading);
    const addBookmark = useAppStore((state) => state.addBookmark);

    const initialPage = Math.max(1, Math.min(TOTAL_PAGES, Number(params.pageNumber ?? 1)));
    const surahName = params.surahName ?? '';

    const [currentPage, setCurrentPage] = useState(initialPage);
    const listRef = useRef<FlashListRef<number>>(null);

    /* ── Compute the image height to fill the available space ── */
    const topBarH = 90;
    const bottomBarH = 80;
    const imageAreaH = SCREEN_H - topBarH - bottomBarH;

    /* ── Viewable items handler — track which page is on-screen ── */
    const onViewableItemsChanged = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0) {
                const page = viewableItems[0].item as number;
                setCurrentPage(page);
                setLastReading({
                    page,
                    surahName: surahName || undefined,
                });
            }
        },
        [surahName, setLastReading],
    );

    /* ── Render a single page ── */
    const renderPage = useCallback(
        ({ item: page }: { item: number }) => {
            const uri = getPageUrl(quranScript, page);
            return (
                <View style={{ width: SCREEN_W, height: imageAreaH }}>
                    <Image
                        source={{ uri }}
                        style={styles.pageImage}
                        contentFit="contain"
                        placeholder={{ blurhash: PAGE_BLURHASH }}
                        transition={200}
                        cachePolicy="disk"
                        recyclingKey={`page-${page}`}
                    />
                </View>
            );
        },
        [quranScript, imageAreaH],
    );

    const scriptLabel = quranScript === 'indopak' ? 'Indo-Pak' : 'Uthmani';

    return (
        <View style={styles.container}>
            {/* ── Top bar ── */}
            <View style={styles.topBar}>
                <Pressable onPress={() => router.back()} style={styles.iconBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
                </Pressable>

                <View style={styles.topCenter}>
                    <Text style={styles.topTitle}>
                        {surahName ? surahName : 'Quran'}
                    </Text>
                    <Text style={styles.topSub}>
                        Page {currentPage} of {TOTAL_PAGES} · {scriptLabel}
                    </Text>
                </View>

                <Pressable
                    style={styles.iconBtn}
                    onPress={() =>
                        addBookmark({
                            page: currentPage,
                            surahName: surahName || `Page ${currentPage}`,
                        })
                    }
                >
                    <MaterialCommunityIcons name="bookmark-plus-outline" size={24} color="#111827" />
                </Pressable>
            </View>

            {/* ── Swipeable page list ── */}
            <View style={styles.listContainer}>
                <FlashList
                    ref={listRef}
                    data={PAGES}
                    renderItem={renderPage}
                    keyExtractor={(page) => `${quranScript}-${page}`}
                    drawDistance={SCREEN_W}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    initialScrollIndex={initialPage - 1}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={VIEWABILITY_CONFIG}
                    extraData={quranScript}
                />
            </View>

            {/* ── Bottom bar ── */}
            <View style={styles.bottomBar}>
                <View style={styles.bottomInner}>
                    <Text style={styles.bottomScript}>{scriptLabel} Script</Text>

                    <View style={styles.pageIndicator}>
                        <Text style={styles.pageNumber}>{currentPage}</Text>
                    </View>

                    <Text style={styles.bottomTotal}>{TOTAL_PAGES} Pages</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FBF8F1',
    },

    /* ── Top bar ── */
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
    iconBtn: {
        width: 38,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    topCenter: {
        alignItems: 'center',
        flex: 1,
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

    /* ── Page list ── */
    listContainer: {
        flex: 1,
    },
    pageImage: {
        flex: 1,
        width: '100%',
    },

    /* ── Bottom bar ── */
    bottomBar: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 12,
        paddingBottom: 36,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderColor: '#EBEEF1',
    },
    bottomInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomScript: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    bottomTotal: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
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
