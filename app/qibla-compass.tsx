import { useEffect, useState, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';

import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { calculateQiblaBearing, bearingToCardinal } from '../utils/qibla';

/* ---- helpers ---- */

function normalise(deg: number) {
    return ((deg % 360) + 360) % 360;
}

const TICK_COUNT = 72; // every 5°
const CARDINAL_LABELS: Record<number, string> = {
    0: 'N', 90: 'E', 180: 'S', 270: 'W',
};

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export default function QiblaCompassScreen() {
    const router = useRouter();

    /* ── Location & Qibla ── */
    const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
    const [locationName, setLocationName] = useState('');
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    /* ── Compass heading ── */
    const [heading, setHeading] = useState(0);
    const animatedHeading = useRef(new Animated.Value(0)).current;
    const lastHeading = useRef(0);

    /* ── Get location & calculate Qibla bearing ── */
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Location permission is required to calculate Qibla direction.');
                    setLoading(false);
                    return;
                }

                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                if (cancelled) return;

                const bearing = calculateQiblaBearing(loc.coords.latitude, loc.coords.longitude);
                setQiblaBearing(bearing);

                const addresses = await Location.reverseGeocodeAsync({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });
                if (!cancelled && addresses.length > 0) {
                    const a = addresses[0];
                    setLocationName([a.city, a.region, a.country].filter(Boolean).join(', '));
                }
            } catch {
                setErrorMsg('Could not get your location. Please enable GPS.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    /* ── Subscribe to magnetometer ── */
    useEffect(() => {
        Magnetometer.setUpdateInterval(100);
        const sub = Magnetometer.addListener((data) => {
            const { x, y } = data;
            let angle = Math.atan2(y, x) * (180 / Math.PI);
            angle = normalise(90 - angle);
            setHeading(angle);

            let diff = angle - lastHeading.current;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;
            const newTarget = lastHeading.current + diff;
            lastHeading.current = newTarget;

            Animated.timing(animatedHeading, {
                toValue: newTarget,
                duration: 150,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }).start();
        });

        return () => sub.remove();
    }, []);

    /* ── Derived values ── */
    const compassRotation = animatedHeading.interpolate({
        inputRange: [-360, 0, 360],
        outputRange: ['360deg', '0deg', '-360deg'],
    });

    const qiblaRelative = qiblaBearing != null ? normalise(qiblaBearing - heading) : null;
    const isAligned = qiblaRelative != null && (qiblaRelative < 5 || qiblaRelative > 355);

    return (
        <View style={styles.container}>
            {/* ── Top bar ── */}
            <View style={styles.topBar}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={28} color={COLORS.white} />
                </Pressable>
                <Text style={styles.topTitle}>Qibla Compass</Text>
                <View style={{ width: 40, height: 40 }} />
            </View>

            {/* ── Location badge ── */}
            {locationName ? (
                <View style={styles.locationBadge}>
                    <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.white} />
                    <Text style={styles.locationText}>{locationName}</Text>
                </View>
            ) : null}

            {loading ? (
                <View style={styles.centerWrap}>
                    <ActivityIndicator size="large" color={COLORS.primaryGreenSoft} />
                    <Text style={styles.loadingText}>Getting your location…</Text>
                </View>
            ) : errorMsg ? (
                <View style={styles.centerWrap}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#E74C3C" />
                    <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
            ) : (
                <>
                    {/* ── Heading display ── */}
                    <View style={styles.headingRow}>
                        <Text style={styles.headingDeg}>{Math.round(heading)}°</Text>
                        <Text style={styles.headingCardinal}>{bearingToCardinal(heading)}</Text>
                    </View>

                    {/* ── Compass ── */}
                    <View style={styles.compassWrapper}>
                        {/* Outer green ring */}
                        <View style={[styles.outerRing, isAligned && styles.outerRingAligned]}>
                            <Animated.View
                                style={[
                                    styles.compassDial,
                                    { transform: [{ rotate: compassRotation }] },
                                ]}
                            >
                                {/* Inner mint circle */}
                                <View style={styles.innerCircle}>
                                    {/* Subtle grid pattern */}
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <View
                                            key={`h-${i}`}
                                            style={[styles.gridLine, styles.gridLineH, { top: `${20 + i * 15}%` }]}
                                        />
                                    ))}
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <View
                                            key={`v-${i}`}
                                            style={[styles.gridLine, styles.gridLineV, { left: `${20 + i * 15}%` }]}
                                        />
                                    ))}
                                </View>

                                {/* Tick marks */}
                                {Array.from({ length: TICK_COUNT }).map((_, i) => {
                                    const deg = i * 5;
                                    const isCardinal = deg % 90 === 0;
                                    const isMajor = deg % 30 === 0;
                                    const label = CARDINAL_LABELS[deg];

                                    return (
                                        <View
                                            key={`tick-${i}`}
                                            style={[
                                                styles.tickContainer,
                                                { transform: [{ rotate: `${deg}deg` }] },
                                            ]}
                                        >
                                            <View
                                                style={[
                                                    styles.tick,
                                                    isCardinal && styles.tickCardinal,
                                                    isMajor && !isCardinal && styles.tickMajor,
                                                ]}
                                            />
                                            {label ? (
                                                <Text
                                                    style={[
                                                        styles.tickLabel,
                                                        { transform: [{ rotate: `-${deg}deg` }] },
                                                        deg === 0 && styles.tickLabelNorth,
                                                    ]}
                                                >
                                                    {label}
                                                </Text>
                                            ) : null}
                                        </View>
                                    );
                                })}

                                {/* Dashed line from center to Kaaba */}
                                {qiblaBearing != null && (
                                    <View
                                        style={[
                                            styles.dashedLineWrap,
                                            { transform: [{ rotate: `${qiblaBearing}deg` }] },
                                        ]}
                                    >
                                        <View style={styles.dashedLine}>
                                            {Array.from({ length: 8 }).map((_, i) => (
                                                <View key={`dash-${i}`} style={styles.dash} />
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Kaaba icon on the ring */}
                                {qiblaBearing != null && (
                                    <View
                                        style={[
                                            styles.kaabaIconWrap,
                                            { transform: [{ rotate: `${qiblaBearing}deg` }] },
                                        ]}
                                    >
                                        <View style={[
                                            styles.kaabaIcon,
                                            { transform: [{ rotate: `-${qiblaBearing}deg` }] },
                                        ]}>
                                            <MaterialCommunityIcons name="mosque" size={28} color="#1F2937" />
                                        </View>
                                    </View>
                                )}
                            </Animated.View>

                            {/* Center red needle (static, always points up) */}
                            <View style={styles.needleCenter}>
                                {/* Red triangle pointing up */}
                                <View style={styles.needleUp} />
                                {/* Gray triangle pointing down */}
                                <View style={styles.needleDown} />
                                {/* Center dot */}
                                <View style={styles.needleDot} />
                            </View>
                        </View>
                    </View>

                    {/* ── Status ── */}
                    <View style={styles.statusSection}>
                        {isAligned ? (
                            <View style={styles.alignedBadge}>
                                <MaterialCommunityIcons name="check-circle" size={22} color="#10B981" />
                                <Text style={styles.alignedText}>You are facing the Qibla!</Text>
                            </View>
                        ) : (
                            <Text style={styles.hintText}>
                                Rotate until the Kaaba aligns with the red needle
                            </Text>
                        )}

                        {qiblaBearing != null && (
                            <View style={styles.bearingRow}>
                                <View style={styles.bearingChip}>
                                    <MaterialCommunityIcons name="compass-outline" size={16} color="#1D8655" />
                                    <Text style={styles.bearingValue}>
                                        {Math.round(qiblaBearing)}° {bearingToCardinal(qiblaBearing)}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* ── Kaaba card ── */}
                    <View style={styles.kaabaCard}>
                        <View style={styles.kaabaCardIcon}>
                            <MaterialCommunityIcons name="mosque" size={22} color="#fff" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.kaabaTitle}>Masjid al-Haram</Text>
                            <Text style={styles.kaabaSubtitle}>Makkah, Saudi Arabia</Text>
                        </View>
                        <View style={styles.distanceBadge}>
                            <MaterialCommunityIcons name="map-marker-distance" size={14} color="#1D8655" />
                            <Text style={styles.distanceText}>Qibla</Text>
                        </View>
                    </View>
                </>
            )}
        </View>
    );
}

/* ================================================================== */
/*  Styles                                                              */
/* ================================================================== */

const COMPASS_SIZE = 310;
const RING_BORDER = 10;
const INNER_SIZE = COMPASS_SIZE - RING_BORDER * 2;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F3F6',
    },

    /* ── Top bar ── */
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 56,
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.sm,
        backgroundColor: '#1D8655',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backBtn: {
        width: 40, height: 40,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: RADIUS.pill,
    },
    topTitle: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: '800',
    },

    /* ── Location ── */
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: RADIUS.pill,
        backgroundColor: '#1D8655',
        marginTop: 8,
        shadowColor: '#065F46',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    locationText: { color: '#fff', fontSize: 13, fontWeight: '600' },

    /* ── Loading / Error ── */
    centerWrap: {
        flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12,
    },
    loadingText: { color: '#6B7280', fontSize: 15 },
    errorText: { color: '#E74C3C', fontSize: 15, textAlign: 'center', paddingHorizontal: 24 },

    /* ── Heading display ── */
    headingRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginTop: 28,
        gap: 6,
    },
    headingDeg: {
        color: '#1F2937',
        fontSize: 48,
        fontWeight: '900',
        letterSpacing: 1,
    },
    headingCardinal: {
        color: '#1D8655',
        fontSize: 22,
        fontWeight: '700',
    },

    /* ── Compass ── */
    compassWrapper: {
        alignSelf: 'center',
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outerRing: {
        width: COMPASS_SIZE,
        height: COMPASS_SIZE,
        borderRadius: COMPASS_SIZE / 2,
        borderWidth: RING_BORDER,
        borderColor: '#1D8655',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        shadowColor: '#065F46',
        shadowOpacity: 0.2,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    outerRingAligned: {
        borderColor: '#10B981',
        shadowColor: '#10B981',
        shadowOpacity: 0.4,
    },
    compassDial: {
        width: INNER_SIZE,
        height: INNER_SIZE,
        borderRadius: INNER_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* Inner mint circle with grid */
    innerCircle: {
        position: 'absolute',
        width: INNER_SIZE * 0.7,
        height: INNER_SIZE * 0.7,
        borderRadius: (INNER_SIZE * 0.7) / 2,
        backgroundColor: '#E8F5E9',
        overflow: 'hidden',
    },
    gridLine: {
        position: 'absolute',
        backgroundColor: 'rgba(29,134,85,0.08)',
    },
    gridLineH: {
        width: '100%',
        height: 1,
    },
    gridLineV: {
        height: '100%',
        width: 1,
    },

    /* Tick marks */
    tickContainer: {
        position: 'absolute',
        width: 30,
        height: INNER_SIZE / 2,
        alignItems: 'center',
        bottom: INNER_SIZE / 2,
        left: INNER_SIZE / 2 - 15,
        transformOrigin: 'bottom',
        overflow: 'visible',
    },
    tick: {
        width: 1.5,
        height: 8,
        backgroundColor: '#D1D5DB',
    },
    tickMajor: {
        width: 2,
        height: 14,
        backgroundColor: '#6B7280',
    },
    tickCardinal: {
        width: 2.5,
        height: 18,
        backgroundColor: '#1F2937',
    },
    tickLabel: {
        position: 'absolute',
        top: 22,
        color: '#1A3A5C',
        fontSize: 16,
        fontWeight: '900',
    },
    tickLabelNorth: {
        color: '#E74C3C',
        fontWeight: '900',
        fontSize: 18,
    },

    /* Dashed line from center to Kaaba */
    dashedLineWrap: {
        position: 'absolute',
        width: 2,
        height: INNER_SIZE / 2,
        alignItems: 'center',
        bottom: INNER_SIZE / 2,
        left: INNER_SIZE / 2 - 1,
        transformOrigin: 'bottom',
    },
    dashedLine: {
        alignItems: 'center',
        gap: 4,
        paddingTop: 30,
    },
    dash: {
        width: 2,
        height: 8,
        backgroundColor: '#E74C3C',
        borderRadius: 1,
    },

    /* Kaaba icon on ring */
    kaabaIconWrap: {
        position: 'absolute',
        width: 44,
        height: INNER_SIZE / 2 + 10,
        alignItems: 'center',
        bottom: INNER_SIZE / 2,
        left: INNER_SIZE / 2 - 22,
        transformOrigin: 'bottom',
    },
    kaabaIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        top: -16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
        borderWidth: 2,
        borderColor: '#1D8655',
    },

    /* Center red needle */
    needleCenter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    needleUp: {
        width: 0,
        height: 0,
        borderLeftWidth: 12,
        borderRightWidth: 12,
        borderBottomWidth: 55,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#E74C3C',
        marginBottom: -2,
    },
    needleDown: {
        width: 0,
        height: 0,
        borderLeftWidth: 12,
        borderRightWidth: 12,
        borderTopWidth: 55,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#9CA3AF',
        marginTop: -2,
    },
    needleDot: {
        position: 'absolute',
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#fff',
        borderWidth: 3,
        borderColor: '#E74C3C',
    },

    /* ── Status ── */
    statusSection: {
        alignItems: 'center',
        marginTop: 24,
        gap: 10,
    },
    alignedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: RADIUS.pill,
        borderWidth: 1.5,
        borderColor: '#A7F3D0',
    },
    alignedText: {
        color: '#065F46',
        fontWeight: '700',
        fontSize: 15,
    },
    hintText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    bearingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bearingChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADIUS.pill,
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    bearingValue: { color: '#065F46', fontSize: 14, fontWeight: '700' },

    /* ── Kaaba card ── */
    kaabaCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 'auto',
        marginBottom: 40,
        marginHorizontal: SPACING.lg,
        backgroundColor: '#fff',
        borderRadius: RADIUS.xl,
        paddingVertical: 14,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    kaabaCardIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#1D8655',
        alignItems: 'center',
        justifyContent: 'center',
    },
    kaabaTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
    kaabaSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 1 },
    distanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: RADIUS.pill,
    },
    distanceText: { color: '#1D8655', fontSize: 12, fontWeight: '700' },
});
