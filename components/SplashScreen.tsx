import { useCallback, useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');

/**
 * Total visible duration of the splash screen
 * before it begins fading out.
 */
const DISPLAY_DURATION = 2400;
const FADE_OUT_DURATION = 800;

type Props = {
    onFinish: () => void;
};

export function SplashScreen({ onFinish }: Props) {
    const screenFade = useRef(new Animated.Value(1)).current;
    const bismillahScale = useRef(new Animated.Value(0.6)).current;
    const bismillahOpacity = useRef(new Animated.Value(0)).current;
    const bismillahSlide = useRef(new Animated.Value(60)).current;
    const subtitleOpacity = useRef(new Animated.Value(0)).current;


    const startFadeOut = useCallback(() => {
        Animated.timing(screenFade, {
            toValue: 0,
            duration: FADE_OUT_DURATION,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start(onFinish);
    }, [screenFade, onFinish]);

    useEffect(() => {
        /* ── Entrance sequence ── */
        Animated.stagger(200, [
            // 1. Bismillah fades in + scales up
            Animated.parallel([
                Animated.timing(bismillahOpacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(bismillahScale, {
                    toValue: 1,
                    friction: 6,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(bismillahSlide, {
                    toValue: 0,
                    duration: 900,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            // 2. Subtitle appears
            Animated.timing(subtitleOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();

        /* ── Auto-dismiss after display duration ── */
        const timer = setTimeout(startFadeOut, DISPLAY_DURATION);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity: screenFade }]}>

            {/* Bismillah calligraphy */}
            <Animated.View
                style={[
                    styles.bismillahWrap,
                    {
                        opacity: bismillahOpacity,
                        transform: [
                            { scale: bismillahScale },
                            { translateX: bismillahSlide },
                        ],
                    },
                ]}
            >
                <Image
                    source={require('../assets/img/bismillah.png')}
                    style={styles.bismillahImage}
                    resizeMode="contain"
                />
            </Animated.View>

            {/* Subtitle */}
            <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
                Al-Quran
            </Animated.Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#0F7B3F',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },

    bismillahWrap: {
        width: SCREEN_W * 0.82,
        alignItems: 'center',
    },
    bismillahImage: {
        width: '100%',
        height: SCREEN_W * 0.4,
        tintColor: '#FFFFFF',
    },
    subtitle: {
        marginTop: 32,
        color: 'rgba(255,255,255,0.7)',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 4,
    },
});
