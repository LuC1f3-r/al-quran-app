import { useRef, useEffect } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

export default function WelcomeScreen() {
    const router = useRouter();

    const fadeIn = useRef(new Animated.Value(0)).current;
    const slideUp = useRef(new Animated.Value(40)).current;
    const btnFade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(fadeIn, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(slideUp, {
                    toValue: 0,
                    duration: 800,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(btnFade, {
                toValue: 1,
                duration: 500,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#064E2B', '#0F7B3F', '#15A050']}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Decorative circles */}
            <View style={[styles.decorCircle, styles.circle1]} />
            <View style={[styles.decorCircle, styles.circle2]} />
            <View style={[styles.decorCircle, styles.circle3]} />

            {/* Content */}
            <Animated.View
                style={[
                    styles.content,
                    { opacity: fadeIn, transform: [{ translateY: slideUp }] },
                ]}
            >
                {/* Mosque icon */}
                <View style={styles.iconWrap}>
                    <MaterialCommunityIcons name="mosque" size={64} color="#fff" />
                </View>

                {/* Bismillah */}
                <Text style={styles.bismillah}>{BISMILLAH}</Text>

                {/* App name */}
                <Text style={styles.appName}>Al-Quran</Text>
                <Text style={styles.tagline}>
                    Your companion for prayer, recitation{'\n'}and spiritual growth
                </Text>
            </Animated.View>

            {/* Bottom actions */}
            <Animated.View style={[styles.bottomSection, { opacity: btnFade }]}>
                <Pressable
                    style={styles.getStartedBtn}
                    onPress={() => router.push('/onboarding/login')}
                >
                    <Text style={styles.getStartedText}>Get Started</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#0F7B3F" />
                </Pressable>

                <View style={styles.dotsRow}>
                    <View style={[styles.dot, styles.dotActive]} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* Decorative */
    decorCircle: {
        position: 'absolute',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    circle1: { width: 400, height: 400, top: -100, right: -100 },
    circle2: { width: 300, height: 300, bottom: -50, left: -80 },
    circle3: { width: 200, height: 200, top: '30%', left: -40, backgroundColor: 'rgba(255,255,255,0.03)' },

    /* Content */
    content: {
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    iconWrap: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    bismillah: {
        color: '#D1FAE5',
        fontSize: 22,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 38,
        marginBottom: 20,
    },
    appName: {
        color: '#FFFFFF',
        fontSize: 42,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 12,
    },
    tagline: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
    },

    /* Bottom */
    bottomSection: {
        position: 'absolute',
        bottom: 60,
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 32,
    },
    getStartedBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 999,
        paddingVertical: 16,
        paddingHorizontal: 40,
        width: '100%',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    getStartedText: {
        color: '#0F7B3F',
        fontSize: 18,
        fontWeight: '800',
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 24,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    dotActive: {
        backgroundColor: '#fff',
        width: 24,
        borderRadius: 4,
    },
});
