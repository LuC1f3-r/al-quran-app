import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';

import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useAppStore, type QuranScript } from '../store/useAppStore';

const { width: SCREEN_W } = Dimensions.get('window');

/* ── PDF asset map ── */

const PDF_ASSETS: Record<string, number> = {
    indopak: require('../assets/quran/indo-pak-quran.pdf'),
    uthmani: require('../assets/quran/uthmani-quran.pdf'),
    imlaei: require('../assets/quran/uthmani-quran.pdf'),
};

export default function QuranPageScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        pageNumber?: string;
        surahName?: string;
    }>();

    const quranScript = useAppStore((state) => state.settings.quranScript);
    const initialPage = Math.max(1, Math.min(604, Number(params.pageNumber ?? 1)));
    const surahName = params.surahName ?? '';
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [loading, setLoading] = useState(true);
    const [pdfUri, setPdfUri] = useState<string | null>(null);
    const webViewRef = useRef<WebView>(null);

    /* ── Resolve the PDF asset to a local file URI ── */
    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                const assetModule = PDF_ASSETS[quranScript] ?? PDF_ASSETS.uthmani;
                const asset = Asset.fromModule(assetModule);
                await asset.downloadAsync();
                if (!cancelled && asset.localUri) {
                    setPdfUri(asset.localUri);
                }
            } catch (err) {
                console.warn('Failed to load PDF asset:', err);
            }
        })();

        return () => { cancelled = true; };
    }, [quranScript]);

    const goToPrevPage = () => {
        if (currentPage > 1) {
            const newPage = currentPage - 1;
            setCurrentPage(newPage);
            webViewRef.current?.injectJavaScript(`goToPage(${newPage}); true;`);
        }
    };

    const goToNextPage = () => {
        if (currentPage < 604) {
            const newPage = currentPage + 1;
            setCurrentPage(newPage);
            webViewRef.current?.injectJavaScript(`goToPage(${newPage}); true;`);
        }
    };

    /* ── HTML that uses pdf.js to render a single page ── */
    const getPdfViewerHtml = (fileUri: string, page: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #FBF8F1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    canvas {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #6B7280;
      font-family: system-ui, sans-serif;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="loading" id="loadingMsg">Rendering page…</div>
  <canvas id="pdfCanvas"></canvas>
  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    let pdfDoc = null;
    const canvas = document.getElementById('pdfCanvas');
    const ctx = canvas.getContext('2d');
    const loadingMsg = document.getElementById('loadingMsg');

    async function renderPage(num) {
      if (!pdfDoc) return;
      try {
        const page = await pdfDoc.getPage(num);
        const dpr = window.devicePixelRatio || 2;
        const viewport = page.getViewport({ scale: 1 });
        
        // Scale to fit screen width while maintaining aspect ratio
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const scaleW = screenWidth / viewport.width;
        const scaleH = screenHeight / viewport.height;
        const scale = Math.min(scaleW, scaleH) * dpr;
        
        const scaledViewport = page.getViewport({ scale });
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        canvas.style.width = (scaledViewport.width / dpr) + 'px';
        canvas.style.height = (scaledViewport.height / dpr) + 'px';

        await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
        loadingMsg.style.display = 'none';
        canvas.style.display = 'block';
        
        // Notify React Native that loading is complete
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'loaded' }));
      } catch (err) {
        loadingMsg.textContent = 'Error rendering page';
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: err.message }));
      }
    }

    function goToPage(num) {
      loadingMsg.style.display = 'block';
      loadingMsg.textContent = 'Rendering page…';
      canvas.style.display = 'none';
      renderPage(num);
    }

    // Load the PDF
    (async () => {
      try {
        pdfDoc = await pdfjsLib.getDocument('${fileUri}').promise;
        renderPage(${page});
      } catch (err) {
        loadingMsg.textContent = 'Failed to load PDF';
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: err.message }));
      }
    })();
  </script>
</body>
</html>
`;

    const scriptLabel = quranScript === 'indopak' ? 'Indo-Pak' : 'Uthmani';

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
                    <Text style={styles.topSub}>
                        Page {currentPage} of 604 · {scriptLabel}
                    </Text>
                </View>
                <View style={{ width: 34 }} />
            </View>

            {/* ── PDF viewer ── */}
            <View style={styles.pageContainer}>
                {(loading || !pdfUri) && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={COLORS.primaryGreenSoft} />
                        <Text style={styles.loadingText}>
                            Loading {scriptLabel} Mushaf…
                        </Text>
                    </View>
                )}
                {pdfUri && (
                    <WebView
                        ref={webViewRef}
                        originWhitelist={['*']}
                        source={{ html: getPdfViewerHtml(pdfUri, currentPage) }}
                        style={styles.webView}
                        javaScriptEnabled
                        domStorageEnabled
                        allowFileAccess
                        allowFileAccessFromFileURLs
                        allowUniversalAccessFromFileURLs
                        mixedContentMode="always"
                        onMessage={(event) => {
                            try {
                                const data = JSON.parse(event.nativeEvent.data);
                                if (data.type === 'loaded') {
                                    setLoading(false);
                                }
                            } catch { }
                        }}
                        onError={() => setLoading(false)}
                    />
                )}
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
    webView: {
        flex: 1,
        backgroundColor: '#FBF8F1',
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
