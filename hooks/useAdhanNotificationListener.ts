/* ------------------------------------------------------------------ */
/*  useAdhanNotificationListener                                       */
/*  Plays the selected adhan MP3 when a prayer notification fires      */
/*  while the app is in the foreground.                                */
/* ------------------------------------------------------------------ */

import { useEffect } from 'react';
import Constants from 'expo-constants';
import { useAppStore } from '../store/useAppStore';
import { playAdhan, stopAdhan } from '../services/adhanPlayer';

/**
 * Call this hook once in the root layout.
 * It registers a foreground notification listener via expo-notifications.
 * When a prayer notification arrives:
 *   1. Checks `adhanPreviewEnabled` (global toggle)
 *   2. Checks `adhanEnabled` flag embedded in the notification data
 *   3. If both are true → plays the user's selected adhan sound
 */
export function useAdhanNotificationListener() {
    const adhanPreviewEnabled = useAppStore((s) => s.settings.adhanPreviewEnabled);
    const selectedAdhan = useAppStore((s) => s.settings.selectedAdhan);

    useEffect(() => {
        // expo-notifications is not available in Expo Go
        const isExpoGo = Constants.executionEnvironment === 'storeClient';
        if (isExpoGo) return;

        let Notifications: typeof import('expo-notifications') | null = null;
        try {
            Notifications = require('expo-notifications');
        } catch {
            return; // module not available
        }

        if (!Notifications) return;

        // Listen for notifications received while the app is foregrounded
        const subscription = Notifications.addNotificationReceivedListener(
            (notification) => {
                const data = notification.request.content.data as
                    | { prayerId?: string; adhanEnabled?: boolean }
                    | undefined;

                if (!data?.prayerId) return;

                // Global toggle must be on
                if (!adhanPreviewEnabled) return;

                // Per-prayer toggle must be on (embedded at schedule time)
                if (data.adhanEnabled === false) return;

                // Play the selected adhan for this prayer
                playAdhan(selectedAdhan, data.prayerId);
            },
        );

        return () => {
            subscription.remove();
            stopAdhan();
        };
    }, [adhanPreviewEnabled, selectedAdhan]);
}
