import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, Easing, I18nManager } from 'react-native';

const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
// Split into words for a smooth word-by-word reveal (preserves Arabic cursive)
const WORDS = BISMILLAH.split(' ');
const WORD_DELAY = 250;       // ms between each word
const WORD_FADE_IN = 400;     // ms for each word to fade in
const HOLD_DURATION = 800;
const FADE_OUT_DURATION = 800;

type Props = {
    onFinish: () => void;
};

export function SplashScreen({ onFinish }: Props) {
    const wordAnims = useRef(WORDS.map(() => new Animated.Value(0))).current;
    const screenFade = useRef(new Animated.Value(1)).current;
    const subtitleFade = useRef(new Animated.Value(0)).current;

    const handleFinish = useCallback(() => {
        onFinish();
    }, [onFinish]);

    useEffect(() => {
        // Stagger each word's fade-in
        const wordAnimations = wordAnims.map((anim, i) =>
            Animated.timing(anim, {
                toValue: 1,
                duration: WORD_FADE_IN,
                delay: i * WORD_DELAY,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        );

        const subtitleAnimation = Animated.timing(subtitleFade, {
            toValue: 1,
            duration: 500,
            delay: WORDS.length * WORD_DELAY + 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        });

        Animated.parallel([...wordAnimations, subtitleAnimation]).start(() => {
            setTimeout(() => {
                Animated.timing(screenFade, {
                    toValue: 0,
                    duration: FADE_OUT_DURATION,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }).start(handleFinish);
            }, HOLD_DURATION);
        });
    }, [wordAnims, subtitleFade, screenFade, handleFinish]);

    return (
        <Animated.View style={[styles.container, { opacity: screenFade }]}>
            <View style={styles.textWrap}>
                <View style={styles.wordRow}>
                    {WORDS.map((word, i) => (
                        <Animated.Text
                            key={`${i}-${word}`}
                            style={[
                                styles.word,
                                {
                                    opacity: wordAnims[i],
                                    transform: [
                                        {
                                            translateY: wordAnims[i].interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [10, 0],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            {word}
                        </Animated.Text>
                    ))}
                </View>
            </View>
            <Animated.Text style={[styles.subtitle, { opacity: subtitleFade }]}>
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
    textWrap: {
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    wordRow: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    word: {
        color: '#FFFFFF',
        fontSize: 34,
        fontWeight: '700',
        lineHeight: 56,
        writingDirection: 'rtl',
    },
    subtitle: {
        marginTop: 24,
        color: 'rgba(255,255,255,0.7)',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 4,
    },
});
