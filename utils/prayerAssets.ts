import { AVPlaybackSource } from 'expo-av';

export const PRAYER_VIDEOS: Record<string, AVPlaybackSource> = {
    tahajjud: require('../assets/prayer-videos/tahjud.mp4'),
    fajr: require('../assets/prayer-videos/fajr.mp4'),
    sunrise: require('../assets/prayer-videos/sunrise.mp4'),
    dhuhr: require('../assets/prayer-videos/duhr.mp4'),
    jummah: require('../assets/prayer-videos/duhr.mp4'),
    asr: require('../assets/prayer-videos/asr.mp4'),
    maghrib: require('../assets/prayer-videos/maghrib.mp4'),
    isha: require('../assets/prayer-videos/isha.mp4'),
};

/**
 * Returns the prayer video source based on the current time of day.
 * 12:00am – 5:00am  → Tahajjud
 * 5:01am  – 6:30am  → Fajr
 * 6:31am  – 10:00am → Sunrise
 * 10:01am – 3:00pm  → Dhuhr
 * 3:01pm  – 6:00pm  → Asr
 * 6:01pm  – 7:30pm  → Maghrib
 * 7:31pm  – 11:59pm → Isha
 */
export function getCurrentPrayerVideo(now: Date = new Date()): AVPlaybackSource {
    const h = now.getHours();
    const m = now.getMinutes();
    const totalMinutes = h * 60 + m;

    if (totalMinutes <= 300) return PRAYER_VIDEOS.tahajjud;       // 00:00 – 05:00
    if (totalMinutes <= 390) return PRAYER_VIDEOS.fajr;           // 05:01 – 06:30
    if (totalMinutes <= 600) return PRAYER_VIDEOS.sunrise;        // 06:31 – 10:00
    if (totalMinutes <= 900) return PRAYER_VIDEOS.dhuhr;          // 10:01 – 15:00
    if (totalMinutes <= 1080) return PRAYER_VIDEOS.asr;           // 15:01 – 18:00
    if (totalMinutes <= 1170) return PRAYER_VIDEOS.maghrib;       // 18:01 – 19:30
    return PRAYER_VIDEOS.isha;                                    // 19:31 – 23:59
}
