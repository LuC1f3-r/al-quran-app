/* ------------------------------------------------------------------ */
/*  Prayer Notifications — uses expo-notifications                    */
/*  Completely skipped in Expo Go (remote notifs removed in SDK 53)   */
/* ------------------------------------------------------------------ */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { PrayerTimings } from './prayerApi';

let Notifications: typeof import('expo-notifications') | null = null;

/* ── Only load expo-notifications outside Expo Go ── */
const isExpoGo = Constants.executionEnvironment === 'storeClient';

if (!isExpoGo) {
    try {
        Notifications = require('expo-notifications');
        Notifications!.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
    } catch {
        // silently ignore
    }
} else {
    console.log('Running in Expo Go — notifications disabled.');
}

/* ── Request permissions ── */
export async function requestNotificationPermissions(): Promise<boolean> {
    if (!Notifications) return false;
    try {
        const { status: existing } = await Notifications.getPermissionsAsync();
        if (existing === 'granted') return true;

        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    } catch {
        return false;
    }
}

/* ── Schedule prayer notifications ── */
const PRAYER_KEYS: Array<{ key: keyof PrayerTimings; name: string }> = [
    { key: 'Fajr', name: 'Fajr' },
    { key: 'Dhuhr', name: 'Dhuhr' },
    { key: 'Asr', name: 'Asr' },
    { key: 'Maghrib', name: 'Maghrib' },
    { key: 'Isha', name: 'Isha' },
];

/**
 * Cancel all existing scheduled notifications, then schedule
 * one notification for each of the 5 prayer times.
 *
 * @param timings        The raw prayer timings object (Fajr, Dhuhr, …).
 * @param adhanEnabled   Per-prayer map – `{ fajr: true, dhuhr: false, … }`.
 *                       When omitted every prayer is assumed enabled.
 */
export async function schedulePrayerNotifications(
    timings: PrayerTimings,
    adhanEnabled?: Record<string, boolean>,
): Promise<void> {
    if (!Notifications) return;

    try {
        const granted = await requestNotificationPermissions();
        if (!granted) return;

        // Cancel previous
        await Notifications.cancelAllScheduledNotificationsAsync();

        const now = new Date();

        for (const prayer of PRAYER_KEYS) {
            const timeStr = timings[prayer.key]; // e.g. "05:38"
            if (!timeStr) continue;

            const [hourStr, minuteStr] = timeStr.split(':');
            const hour = Number(hourStr);
            const minute = Number(minuteStr);

            // Build a Date for today at this prayer time
            const triggerDate = new Date(now);
            triggerDate.setHours(hour, minute, 0, 0);

            // If the time already passed today, schedule for tomorrow
            if (triggerDate <= now) {
                triggerDate.setDate(triggerDate.getDate() + 1);
            }

            // Determine the lowercase prayer ID used by the store
            const prayerId = prayer.key.toLowerCase();
            const isAdhanEnabled = adhanEnabled ? adhanEnabled[prayerId] !== false : true;

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: `🕌 ${prayer.name} Prayer`,
                    body: `It's time for ${prayer.name} prayer (${timeStr})`,
                    sound: true,
                    data: { prayerId, adhanEnabled: isAdhanEnabled },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: triggerDate,
                },
            });
        }
    } catch {
        console.warn('Failed to schedule notifications');
    }
}

/**
 * Cancel all scheduled prayer notifications.
 */
export async function cancelPrayerNotifications(): Promise<void> {
    if (!Notifications) return;
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {
        // silently ignore in Expo Go
    }
}
