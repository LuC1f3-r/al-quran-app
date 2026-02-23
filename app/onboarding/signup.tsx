import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuthStore } from '../../store/useAuthStore';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export default function SignupScreen() {
    const router = useRouter();
    const signup = useAuthStore((s) => s.signup);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSignup = () => {
        /* ── Basic validation ── */
        if (!firstName.trim()) {
            Alert.alert('Missing Field', 'Please enter your first name.');
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Mismatch', 'Passwords do not match.');
            return;
        }

        signup({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            dob,
            authMethod: 'email',
        });

        router.replace('/');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#064E2B', '#0F7B3F', '#15A050']}
                style={StyleSheet.absoluteFillObject}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Back */}
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </Pressable>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>
                            Join us on your spiritual journey
                        </Text>
                    </View>

                    {/* Form card */}
                    <View style={styles.card}>
                        {/* Name row */}
                        <View style={styles.nameRow}>
                            <View style={[styles.inputWrap, { flex: 1 }]}>
                                <Text style={styles.label}>First Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="First name"
                                    placeholderTextColor="#9CA3AF"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    autoCapitalize="words"
                                />
                            </View>
                            <View style={[styles.inputWrap, { flex: 1 }]}>
                                <Text style={styles.label}>Last Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Last name"
                                    placeholderTextColor="#9CA3AF"
                                    value={lastName}
                                    onChangeText={setLastName}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>

                        {/* DOB */}
                        <View style={styles.inputWrap}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="DD/MM/YYYY"
                                placeholderTextColor="#9CA3AF"
                                value={dob}
                                onChangeText={setDob}
                                keyboardType="numbers-and-punctuation"
                            />
                        </View>

                        {/* Email */}
                        <View style={styles.inputWrap}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                placeholderTextColor="#9CA3AF"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </View>

                        {/* Password */}
                        <View style={styles.inputWrap}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.passwordRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                    placeholder="Min 6 characters"
                                    placeholderTextColor="#9CA3AF"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <Pressable
                                    style={styles.eyeBtn}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="#6B7280"
                                    />
                                </Pressable>
                            </View>
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputWrap}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.passwordRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                    placeholder="Re-enter password"
                                    placeholderTextColor="#9CA3AF"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirm}
                                    autoCapitalize="none"
                                />
                                <Pressable
                                    style={styles.eyeBtn}
                                    onPress={() => setShowConfirm(!showConfirm)}
                                >
                                    <Ionicons
                                        name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="#6B7280"
                                    />
                                </Pressable>
                            </View>
                        </View>

                        {/* Submit */}
                        <Pressable style={styles.submitBtn} onPress={handleSignup}>
                            <Text style={styles.submitText}>Create Account</Text>
                            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                        </Pressable>
                    </View>

                    {/* Already have account */}
                    <Pressable style={styles.loginLink} onPress={() => router.back()}>
                        <Text style={styles.loginLinkText}>
                            Already have an account?{' '}
                            <Text style={styles.loginLinkBold}>Login</Text>
                        </Text>
                    </Pressable>

                    {/* Dots */}
                    <View style={styles.dotsRow}>
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                        <View style={[styles.dot, styles.dotActive]} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        marginTop: 20,
        marginBottom: 24,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 30,
        fontWeight: '900',
    },
    subtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginTop: 6,
        fontWeight: '500',
    },

    /* Card */
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        gap: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
    },

    nameRow: {
        flexDirection: 'row',
        gap: 12,
    },

    inputWrap: {
        gap: 4,
    },
    label: {
        color: '#374151',
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 2,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderRadius: RADIUS.md,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '500',
    },

    passwordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: RADIUS.md,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        paddingRight: 4,
    },
    eyeBtn: {
        width: 40, height: 40,
        alignItems: 'center', justifyContent: 'center',
    },

    submitBtn: {
        backgroundColor: '#0F7B3F',
        borderRadius: RADIUS.md,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 4,
    },
    submitText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '800',
    },

    loginLink: {
        alignSelf: 'center',
        marginTop: 20,
        paddingVertical: 8,
    },
    loginLinkText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontWeight: '500',
    },
    loginLinkBold: {
        color: '#FFFFFF',
        fontWeight: '800',
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
