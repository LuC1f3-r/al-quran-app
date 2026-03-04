import { useState, useEffect } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getLocales } from 'expo-localization';

import { COLORS, RADIUS, SPACING } from '../constants/theme';
import {
    useSubscriptionStore,
    getPricing,
    type PlanId,
} from '../store/useSubscriptionStore';

/* ── Plan feature lists ── */

const PLAN_FEATURES: Record<PlanId, { icon: string; text: string }[]> = {
    free: [
        { icon: 'account-music-outline', text: '2 Reciters (As-Sudais & Alafasy)' },
        { icon: 'book-open-page-variant-outline', text: 'Full Quran Access' },
        { icon: 'compass-outline', text: 'Qibla Compass' },
        { icon: 'clock-outline', text: 'Prayer Times' },
        { icon: 'bullhorn-outline', text: 'Halal Ads every 5 mins' },
    ],
    basic: [
        { icon: 'star-outline', text: 'All Free Plan Benefits' },
        { icon: 'cancel', text: 'No Ads' },
        { icon: 'account-music-outline', text: '2 Reciters' },
    ],
    premium: [
        { icon: 'star-outline', text: 'All Basic Plan Benefits' },
        { icon: 'cancel', text: 'No Ads' },
        { icon: 'account-group-outline', text: 'All 20 Reciters Unlocked' },
        { icon: 'download-outline', text: 'Offline Downloads (coming soon)' },
    ],
};

/* ================================================================== */
/*  Subscription Screen                                                */
/* ================================================================== */

export default function SubscriptionScreen() {
    const router = useRouter();
    const { plan: currentPlan, expiresAt, activatePlan, region, setRegion } =
        useSubscriptionStore();

    const [selectedPlan, setSelectedPlan] = useState<PlanId>(currentPlan);
    const [expandedPlan, setExpandedPlan] = useState<PlanId | null>(null);

    /* ── Detect region on mount ── */
    useEffect(() => {
        try {
            const locales = getLocales();
            const regionCode = locales?.[0]?.regionCode ?? 'IN';
            setRegion(regionCode);
        } catch {
            setRegion('IN');
        }
    }, []);

    const pricing = getPricing(region);

    /* ── Days remaining ── */
    const daysRemaining = expiresAt
        ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null;

    const expiryLabel = expiresAt
        ? `Expires on ${new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} (${daysRemaining} days remaining)`
        : null;

    /* ── Handle upgrade ── */
    const handleUpgrade = () => {
        if (selectedPlan === 'free') {
            Alert.alert('Free Plan', 'You are already on the Free plan.');
            return;
        }
        // Mock activation — in production this would go through RevenueCat / Stripe
        activatePlan(selectedPlan, 30);
        Alert.alert(
            'Plan Activated! 🎉',
            `Your ${selectedPlan === 'basic' ? 'Basic' : 'Premium'} plan has been activated for 30 days.`,
        );
    };

    /* ── Render a plan card ── */
    const renderPlanCard = (
        planId: PlanId,
        title: string,
        price: string | null,
        recommended?: boolean,
    ) => {
        const isActive = currentPlan === planId;
        const isSelected = selectedPlan === planId;
        const isExpanded = expandedPlan === planId;
        const features = PLAN_FEATURES[planId];

        return (
            <Pressable
                key={planId}
                style={[
                    styles.planCard,
                    isActive && styles.planCardActive,
                    isSelected && !isActive && styles.planCardSelected,
                ]}
                onPress={() => setSelectedPlan(planId)}
            >
                {/* Header row */}
                <View style={styles.planHeader}>
                    <View style={styles.planTitleRow}>
                        <MaterialCommunityIcons
                            name={planId === 'free' ? 'gift-outline' : planId === 'basic' ? 'shield-check-outline' : 'crown-outline'}
                            size={24}
                            color={isActive ? '#1D8655' : '#374151'}
                        />
                        <View style={{ marginLeft: 10, flex: 1 }}>
                            <Text style={styles.planTitle}>{title}</Text>
                            {recommended && (
                                <Text style={styles.recommendedBadge}>Recommended Plan</Text>
                            )}
                        </View>
                    </View>

                    {/* Radio / check */}
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                        {isActive ? (
                            <MaterialCommunityIcons name="check" size={16} color="#fff" />
                        ) : isSelected ? (
                            <View style={styles.radioDot} />
                        ) : null}
                    </View>
                </View>

                {/* Active badge */}
                {isActive && (
                    <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>Active Plan</Text>
                        <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
                    </View>
                )}

                {/* Price */}
                {price ? (
                    <View style={styles.priceRow}>
                        <Text style={styles.priceAmount}>{price}</Text>
                        <Text style={styles.pricePeriod}> for 30 days</Text>
                    </View>
                ) : (
                    <Text style={styles.priceAmount}>Free</Text>
                )}

                {/* Expiry info */}
                {isActive && expiryLabel && planId !== 'free' && (
                    <Text style={styles.expiryText}>{expiryLabel}</Text>
                )}

                {/* Features (always show first 2, rest on expand) */}
                <View style={styles.featureList}>
                    {features.slice(0, isExpanded ? features.length : 2).map((f, idx) => (
                        <View key={idx} style={styles.featureRow}>
                            <View style={styles.featureIcon}>
                                <MaterialCommunityIcons
                                    name={f.icon as any}
                                    size={18}
                                    color="#1D8655"
                                />
                            </View>
                            <Text style={styles.featureText}>{f.text}</Text>
                        </View>
                    ))}
                </View>

                {/* View More / Less */}
                {features.length > 2 && (
                    <Pressable
                        style={styles.viewMoreBtn}
                        onPress={() => setExpandedPlan(isExpanded ? null : planId)}
                    >
                        <MaterialCommunityIcons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={22}
                            color="#1D8655"
                        />
                        <Text style={styles.viewMoreText}>
                            {isExpanded ? 'View Less' : 'View More'}
                        </Text>
                    </Pressable>
                )}
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            {/* ── Top bar ── */}
            <View style={styles.topBar}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
                </Pressable>
                <Text style={styles.topTitle}>My Plans</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* ── Plan cards ── */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {renderPlanCard('free', 'Free', null)}
                {renderPlanCard(
                    'basic',
                    'Ads Free',
                    `${pricing.symbol}${pricing.basic}`,
                    true,
                )}
                {renderPlanCard(
                    'premium',
                    'Premium',
                    `${pricing.symbol}${pricing.premium}`,
                )}
            </ScrollView>

            {/* ── Bottom CTA ── */}
            <View style={styles.bottomCta}>
                <Pressable
                    style={[
                        styles.ctaButton,
                        selectedPlan === currentPlan && styles.ctaButtonDisabled,
                    ]}
                    onPress={handleUpgrade}
                >
                    <Text style={styles.ctaText}>
                        {selectedPlan === currentPlan
                            ? 'Current Plan'
                            : currentPlan !== 'free'
                                ? 'Extend Plan (+30 days)'
                                : 'Upgrade Plan'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

/* ================================================================== */
/*  Styles                                                              */
/* ================================================================== */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F7F9',
    },

    /* ── Top bar ── */
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 56,
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.sm,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '800',
        color: '#1F2937',
        marginRight: 40,
    },

    /* ── Scroll ── */
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.md,
        paddingBottom: 120,
        gap: 14,
    },

    /* ── Plan card ── */
    planCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: RADIUS.xl,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        padding: SPACING.md,
    },
    planCardActive: {
        borderColor: '#1D8655',
        borderWidth: 2,
    },
    planCardSelected: {
        borderColor: '#9CA3AF',
        borderWidth: 2,
    },

    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    planTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    planTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1F2937',
    },
    recommendedBadge: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1D8655',
        marginTop: 1,
    },

    /* Radio */
    radio: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: '#1D8655',
        backgroundColor: '#1D8655',
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },

    /* Active badge */
    activeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        backgroundColor: '#1D8655',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: RADIUS.pill,
        marginBottom: 8,
    },
    activeBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },

    /* Price */
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    priceAmount: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1F2937',
    },
    pricePeriod: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    expiryText: {
        fontSize: 13,
        color: '#1D8655',
        fontWeight: '600',
        marginBottom: 8,
    },

    /* Features */
    featureList: {
        marginTop: 10,
        gap: 8,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    featureIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F0FDF4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
        flex: 1,
    },

    /* View More */
    viewMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 10,
    },
    viewMoreText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1D8655',
    },

    /* ── Bottom CTA ── */
    bottomCta: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: SPACING.md,
        paddingVertical: 16,
        paddingBottom: 36,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    ctaButton: {
        backgroundColor: '#1D8655',
        borderRadius: RADIUS.pill,
        paddingVertical: 16,
        alignItems: 'center',
    },
    ctaButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    ctaText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
});
