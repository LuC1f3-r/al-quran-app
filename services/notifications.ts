/* ------------------------------------------------------------------ */
/*  Prayer Notifications — uses expo-notifications                    */
/* ------------------------------------------------------------------ */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { PrayerTimings } from './prayerApi';

/* ── Configure default handler ── */
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/* ── Request permissions ── */
export async function requestNotificationPermissions(): Promise<boolean> {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
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
 */
export async function schedulePrayerNotifications(
    timings: PrayerTimings,
): Promise<void> {
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

        await Notifications.scheduleNotificationAsync({
            content: {
                title: `🕌 ${prayer.name} Prayer`,
                body: `It's time for ${prayer.name} prayer (${timeStr})`,
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
            },
        });
    }
}

/**
 * Cancel all scheduled prayer notifications.
 */
export async function cancelPrayerNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}
