import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuthStore } from '../../store/useAuthStore';
import { RADIUS, SPACING } from '../../constants/theme';

export default function LoginScreen() {
    const router = useRouter();
    const login = useAuthStore((s) => s.login);
    const skipOnboarding = useAuthStore((s) => s.skipOnboarding);

    /* Mock social login — replace with real auth later */
    const handleGoogleLogin = () => {
        login({
            firstName: 'User',
            lastName: '',
            email: 'user@gmail.com',
            dob: '',
            authMethod: 'google',
        });
        router.replace('/');
    };

    const handleAppleLogin = () => {
        login({
            firstName: 'User',
            lastName: '',
            email: 'user@icloud.com',
            dob: '',
            authMethod: 'apple',
        });
        router.replace('/');
    };

    const handleSkip = () => {
        skipOnboarding();
        router.replace('/');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#064E2B', '#0F7B3F', '#15A050']}
                style={StyleSheet.absoluteFillObject}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Back */}
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>

                {/* Header */}
                <View style={styles.header}>
                    <MaterialCommunityIcons name="mosque" size={40} color="#D1FAE5" />
                    <Text style={styles.title}>Welcome back</Text>
                    <Text style={styles.subtitle}>
                        Sign in to sync your progress{'\n'}across devices
                    </Text>
                </View>

                {/* Login card */}
                <View style={styles.card}>
                    {/* Google */}
                    <Pressable style={styles.socialBtn} onPress={handleGoogleLogin}>
                        <View style={[styles.socialIconWrap, { backgroundColor: '#FEF2F2' }]}>
                            <MaterialCommunityIcons name="google" size={22} color="#EA4335" />
                        </View>
                        <Text style={styles.socialText}>Continue with Google</Text>
                        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                    </Pressable>

                    {/* Apple */}
                    <Pressable style={styles.socialBtn} onPress={handleAppleLogin}>
                        <View style={[styles.socialIconWrap, { backgroundColor: '#F3F4F6' }]}>
                            <Ionicons name="logo-apple" size={22} color="#1F2937" />
                        </View>
                        <Text style={styles.socialText}>Continue with Apple</Text>
                        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                    </Pressable>

                    {/* Email */}
                    <Pressable
                        style={styles.socialBtn}
                        onPress={() => router.push('/onboarding/signup')}
                    >
                        <View style={[styles.socialIconWrap, { backgroundColor: '#EFF6FF' }]}>
                            <MaterialCommunityIcons name="email-outline" size={22} color="#3B82F6" />
                        </View>
                        <Text style={styles.socialText}>Continue with Email</Text>
                        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                    </Pressable>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Create account */}
                    <Pressable
                        style={styles.createAccountBtn}
                        onPress={() => router.push('/onboarding/signup')}
                    >
                        <Text style={styles.createAccountText}>Create an Account</Text>
                    </Pressable>
                </View>

                {/* Skip */}
                <Pressable style={styles.skipBtn} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip for now</Text>
                </Pressable>

                {/* Dots */}
                <View style={styles.dotsRow}>
                    <View style={styles.dot} />
                    <View style={[styles.dot, styles.dotActive]} />
                    <View style={styles.dot} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: {
        paddingTop: 56,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },

    backBtn: {
        width: 40, height: 40,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center', justifyContent: 'center',
    },

    header: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 28,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 30,
        fontWeight: '900',
        marginTop: 16,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
        fontWeight: '500',
    },

    /* Card */
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        gap: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
    },

    socialBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: RADIUS.md,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        backgroundColor: '#FAFAFA',
    },
    socialIconWrap: {
        width: 36, height: 36,
        borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
    },
    socialText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },

    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    dividerLine: {
        flex: 1, height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        color: '#9CA3AF',
        fontSize: 13,
        fontWeight: '600',
        marginHorizontal: 12,
    },

    createAccountBtn: {
        backgroundColor: '#0F7B3F',
        borderRadius: RADIUS.md,
        paddingVertical: 16,
        alignItems: 'center',
    },
    createAccountText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },

    skipBtn: {
        alignSelf: 'center',
        marginTop: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    skipText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontWeight: '600',
    },

    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
    },
    dot: {
        width: 8, height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    dotActive: {
        backgroundColor: '#fff',
        width: 24,
        borderRadius: 4,
    },
});
