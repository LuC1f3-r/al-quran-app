import { useState } from 'react';
import {
    Alert,
    Linking,
    Modal,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useAppStore, type QuranScript } from '../store/useAppStore';

/* ── Script options ── */
const SCRIPT_OPTIONS: { value: QuranScript; label: string; sample: string; hint: string }[] = [
    {
        value: 'indopak',
        label: 'Indo-Pak Font',
        sample: 'اَلۡحَمۡدُ لِلّٰهِ رَبِّ الۡعٰلَمِیۡنَ ۙ',
        hint: 'Popular in Pakistan, India, Bangladesh',
    },
    {
        value: 'uthmani',
        label: 'Usmani Font',
        sample: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
        hint: 'Recommended for Saudi Arabia, Dubai, Oman etc',
    },
    {
        value: 'imlaei',
        label: 'Simple Font',
        sample: 'الحمد لله رب العالمين',
        hint: 'Plain Arabic, easy to read',
    },
];

const scriptDisplayName = (s: QuranScript) =>
    SCRIPT_OPTIONS.find((o) => o.value === s)?.label ?? 'Usmani Font';

/* ------------------------------------------------------------------ */
/*  Row components                                                    */
/* ------------------------------------------------------------------ */

type ToggleRowProps = {
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    iconColor: string;
    iconBg: string;
    title: string;
    subtitle: string;
    value: boolean;
    onToggle: (v: boolean) => void;
};

function ToggleRow({ icon, iconColor, iconBg, title, subtitle, value, onToggle }: ToggleRowProps) {
    return (
        <View style={styles.row}>
            <View style={[styles.rowIconWrap, { backgroundColor: iconBg }]}>
                <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
            </View>
            <View style={styles.rowTextCol}>
                <Text style={styles.rowTitle}>{title}</Text>
                <Text style={styles.rowSub}>{subtitle}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: '#E5E7EB', true: '#86EFAC' }}
                thumbColor={value ? '#22C55E' : '#F3F4F6'}
            />
        </View>
    );
}

type NavRowProps = {
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    iconColor: string;
    iconBg: string;
    title: string;
    subtitle: string;
    onPress: () => void;
};

function NavRow({ icon, iconColor, iconBg, title, subtitle, onPress }: NavRowProps) {
    return (
        <Pressable style={styles.row} onPress={onPress}>
            <View style={[styles.rowIconWrap, { backgroundColor: iconBg }]}>
                <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
            </View>
            <View style={styles.rowTextCol}>
                <Text style={styles.rowTitle}>{title}</Text>
                <Text style={styles.rowSub}>{subtitle}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#D1D5DB" />
        </Pressable>
    );
}

/* ------------------------------------------------------------------ */
/*  Screen                                                            */
/* ------------------------------------------------------------------ */

export default function ProfileScreen() {
    const router = useRouter();
    const settings = useAppStore((s) => s.settings);
    const update = useAppStore((s) => s.updatePrayerSetting);
    const setQuranScript = useAppStore((s) => s.setQuranScript);

    const [verticalScroll, setVerticalScroll] = useState(false);
    const [scriptModalVisible, setScriptModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            {/* ── Top bar ── */}
            <View style={styles.topBar}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
                </Pressable>
                <Text style={styles.topTitle}>Settings</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* ── Profile header card ── */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarCircle}>
                        <MaterialCommunityIcons name="account" size={42} color="#FFFFFF" />
                    </View>
                    <Text style={styles.profileName}>Usman Ghani</Text>
                    <Text style={styles.profileEmail}>Reading since 2024</Text>
                </View>

                {/* ── Promo banner ── */}
                <View style={styles.promoBanner}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.promoTitle}>
                            Teach Kids Quran Easily <Text style={styles.promoBadge}>AD ✨</Text>
                        </Text>
                        <Text style={styles.promoSub}>Learn faster with AI-powered assistance…</Text>
                        <View style={styles.promoBtn}>
                            <Text style={styles.promoBtnText}>Try Now</Text>
                        </View>
                    </View>
                    <MaterialCommunityIcons name="school" size={52} color="#1D7F53" style={{ opacity: 0.25 }} />
                </View>

                {/* ── GENERAL ── */}
                <Text style={styles.sectionLabel}>GENERAL</Text>
                <View style={styles.card}>
                    <ToggleRow
                        icon="vibrate"
                        iconColor="#F59E0B"
                        iconBg="#FEF3C7"
                        title="Vibrate"
                        subtitle="On Page Swipe"
                        value={settings.vibrationEnabled}
                        onToggle={(v) => update('vibrationEnabled', v)}
                    />
                    <View style={styles.sep} />
                    <ToggleRow
                        icon="arrow-collapse-down"
                        iconColor="#EF4444"
                        iconBg="#FEE2E2"
                        title="Vertical Scroll"
                        subtitle="Scroll Page Vertically"
                        value={verticalScroll}
                        onToggle={setVerticalScroll}
                    />
                    <View style={styles.sep} />
                    <NavRow
                        icon="abjad-arabic"
                        iconColor="#8B5CF6"
                        iconBg="#EDE9FE"
                        title="Change Quran Script"
                        subtitle={scriptDisplayName(settings.quranScript)}
                        onPress={() => setScriptModalVisible(true)}
                    />
                    <View style={styles.sep} />
                    <NavRow
                        icon="web"
                        iconColor="#0EA5E9"
                        iconBg="#E0F2FE"
                        title="Languages"
                        subtitle="English"
                        onPress={() => Alert.alert('Languages', 'Coming soon – choose your preferred translation language.')}
                    />
                    <View style={styles.sep} />
                    <NavRow
                        icon="theme-light-dark"
                        iconColor="#1F2937"
                        iconBg="#F3F4F6"
                        title="App Theme"
                        subtitle="Light Mode"
                        onPress={() => Alert.alert('Theme', 'Coming soon – toggle between Light and Dark mode.')}
                    />
                </View>

                {/* ── NOTIFICATIONS ── */}
                <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
                <View style={styles.card}>
                    <ToggleRow
                        icon="bell-ring"
                        iconColor="#22C55E"
                        iconBg="#DCFCE7"
                        title="Prayer Alerts"
                        subtitle="Get notified at prayer times"
                        value={settings.prayerAlertsEnabled}
                        onToggle={(v) => update('prayerAlertsEnabled', v)}
                    />
                    <View style={styles.sep} />
                    <ToggleRow
                        icon="volume-high"
                        iconColor="#3B82F6"
                        iconBg="#DBEAFE"
                        title="Adhan Preview"
                        subtitle="Play Adhan sound with notification"
                        value={settings.adhanPreviewEnabled}
                        onToggle={(v) => update('adhanPreviewEnabled', v)}
                    />
                </View>

                {/* ── OTHER ── */}
                <Text style={styles.sectionLabel}>OTHER</Text>
                <View style={styles.card}>
                    <NavRow
                        icon="chat-processing"
                        iconColor="#22C55E"
                        iconBg="#DCFCE7"
                        title="Feedback / Chat"
                        subtitle="Let's share your thoughts with us"
                        onPress={() => Linking.openURL('mailto:feedback@quranapp.com')}
                    />
                    <View style={styles.sep} />
                    <NavRow
                        icon="star"
                        iconColor="#F59E0B"
                        iconBg="#FEF3C7"
                        title="Rate Us"
                        subtitle="Your Experience on App"
                        onPress={() => Alert.alert('Rate Us', 'Thank you for your support! ⭐')}
                    />
                    <View style={styles.sep} />
                    <NavRow
                        icon="share-variant"
                        iconColor="#F97316"
                        iconBg="#FFF7ED"
                        title="Share App"
                        subtitle="Spread the word"
                        onPress={() =>
                            Share.share({ message: 'Check out this beautiful Quran app! 📖✨' })
                        }
                    />
                    <View style={styles.sep} />
                    <NavRow
                        icon="information"
                        iconColor="#6B7280"
                        iconBg="#F3F4F6"
                        title="About"
                        subtitle="Version 0.1.0"
                        onPress={() => Alert.alert('Al-Quran App', 'Version 0.1.0\nBuilt with love ❤️')}
                    />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* ── Script Picker Modal ── */}
            <Modal transparent visible={scriptModalVisible} onRequestClose={() => setScriptModalVisible(false)}>
                <Pressable style={styles.modalBackdrop} onPress={() => setScriptModalVisible(false)}>
                    <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>Quran Scripts</Text>
                        <Text style={styles.modalHint}>
                            Please select the Script of Holy Quran you want to read
                        </Text>

                        {SCRIPT_OPTIONS.map((opt) => {
                            const active = settings.quranScript === opt.value;
                            return (
                                <Pressable
                                    key={opt.value}
                                    style={[styles.scriptOption, active && styles.scriptOptionActive]}
                                    onPress={() => {
                                        setQuranScript(opt.value);
                                        setScriptModalVisible(false);
                                    }}
                                >
                                    <View style={styles.scriptOptionTop}>
                                        <View>
                                            <Text style={styles.scriptLabel}>{opt.label}</Text>
                                            {active && (
                                                <Text style={styles.scriptDownloaded}>✅ Active</Text>
                                            )}
                                        </View>
                                        <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                                            {active && <View style={styles.radioInner} />}
                                        </View>
                                    </View>
                                    <Text style={styles.scriptSample}>{opt.sample}</Text>
                                    <Text style={styles.scriptHint}>{opt.hint}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' },

    topBar: {
        paddingTop: 52,
        paddingBottom: SPACING.sm,
        paddingHorizontal: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderColor: '#EBEEF1',
    },
    backBtn: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
    },

    scroll: {
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.md,
        paddingBottom: 40,
        gap: SPACING.sm,
    },

    /* Profile header */
    profileCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        alignItems: 'center',
        shadowColor: '#001122',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 999,
        backgroundColor: '#2FA56C',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    profileName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1F2937',
    },
    profileEmail: {
        marginTop: 2,
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '500',
    },

    /* Promo */
    promoBanner: {
        borderRadius: RADIUS.xl,
        backgroundColor: '#E9FFF3',
        padding: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        overflow: 'hidden',
    },
    promoTitle: { fontSize: 15, fontWeight: '800', color: '#1F2937' },
    promoBadge: { fontSize: 12, color: '#22C55E', fontWeight: '700' },
    promoSub: { marginTop: 4, fontSize: 13, color: '#6B7280' },
    promoBtn: {
        marginTop: 10,
        alignSelf: 'flex-start',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.pill,
        paddingHorizontal: 18,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    promoBtnText: { fontSize: 14, fontWeight: '700', color: '#1F2937' },

    /* Sections */
    sectionLabel: {
        marginTop: SPACING.sm,
        marginLeft: 4,
        fontSize: 13,
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 0.8,
    },

    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        shadowColor: '#001122',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    /* Rows */
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: 14,
        gap: SPACING.sm,
    },
    rowIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowTextCol: { flex: 1 },
    rowTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
    rowSub: { marginTop: 1, fontSize: 13, color: '#9CA3AF' },
    sep: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 66 },

    /* Modal */
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    modalCard: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        gap: SPACING.sm,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center',
    },
    modalHint: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 4,
    },

    /* Script options */
    scriptOption: {
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        gap: 6,
    },
    scriptOptionActive: {
        borderColor: '#22C55E',
        backgroundColor: '#F0FFF4',
    },
    scriptOptionTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scriptLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },
    scriptDownloaded: {
        fontSize: 12,
        color: '#22C55E',
        fontWeight: '600',
        marginTop: 2,
    },
    scriptSample: {
        fontSize: 26,
        color: '#1F2937',
        textAlign: 'right',
        fontWeight: '400',
        lineHeight: 42,
    },
    scriptHint: {
        fontSize: 12,
        color: '#22C55E',
        fontWeight: '500',
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterActive: {
        borderColor: '#22C55E',
    },
    radioInner: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#22C55E',
    },
});
