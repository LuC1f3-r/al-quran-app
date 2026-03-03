import { useCallback, useRef } from 'react';
import { Animated, StyleSheet, Easing, Text } from 'react-native';
import LottieView from 'lottie-react-native';

const FADE_OUT_DURATION = 800;

type Props = {
    onFinish: () => void;
};

export function SplashScreen({ onFinish }: Props) {
    const screenFade = useRef(new Animated.Value(1)).current;

    const handleFinish = useCallback(() => {
        onFinish();
    }, [onFinish]);

    const onAnimationFinish = useCallback(() => {
        Animated.timing(screenFade, {
            toValue: 0,
            duration: FADE_OUT_DURATION,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start(handleFinish);
    }, [screenFade, handleFinish]);

    return (
        <Animated.View style={[styles.container, { opacity: screenFade }]}>
            <LottieView
                source={require('../assets/splash-animation.json')}
                autoPlay
                loop={false}
                onAnimationFinish={onAnimationFinish}
                style={styles.lottie}
            />
            <Text style={styles.subtitle}>Al-Quran</Text>
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
    lottie: {
        width: 280,
        height: 280,
    },
    subtitle: {
        marginTop: 24,
        color: 'rgba(255,255,255,0.7)',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 4,
    },
});
