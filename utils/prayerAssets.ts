export const PRAYER_GIFS: Record<string, any> = {
    tahajjud: require('../assets/prayer-gifs/tahjud.gif'),
    fajr: require('../assets/prayer-gifs/fajr.gif'),
    sunrise: require('../assets/prayer-gifs/sunrise.gif'),
    dhuhr: require('../assets/prayer-gifs/duhr.gif'),
    jummah: require('../assets/prayer-gifs/duhr.gif'),
    asr: require('../assets/prayer-gifs/asr.gif'),
    maghrib: require('../assets/prayer-gifs/maghrib.gif'),
    isha: require('../assets/prayer-gifs/isha.gif'),
};

/**
 * Returns the prayer GIF source based on the current time of day.
 * 12:00am – 5:00am  → Tahajjud
 * 5:01am  – 6:30am  → Fajr
 * 6:31am  – 10:00am → Sunrise
 * 10:01am – 3:00pm  → Dhuhr
 * 3:01pm  – 6:00pm  → Asr
 * 6:01pm  – 7:30pm  → Maghrib
 * 7:31pm  – 11:59pm → Isha
 */
export function getCurrentPrayerGif(now: Date = new Date()) {
    const h = now.getHours();
    const m = now.getMinutes();
    const totalMinutes = h * 60 + m;

    if (totalMinutes <= 300) return PRAYER_GIFS.tahajjud;       // 00:00 – 05:00
    if (totalMinutes <= 390) return PRAYER_GIFS.fajr;           // 05:01 – 06:30
    if (totalMinutes <= 600) return PRAYER_GIFS.sunrise;        // 06:31 – 10:00
    if (totalMinutes <= 900) return PRAYER_GIFS.dhuhr;          // 10:01 – 15:00
    if (totalMinutes <= 1080) return PRAYER_GIFS.asr;           // 15:01 – 18:00
    if (totalMinutes <= 1170) return PRAYER_GIFS.maghrib;       // 18:01 – 19:30
    return PRAYER_GIFS.isha;                                    // 19:31 – 23:59
}
