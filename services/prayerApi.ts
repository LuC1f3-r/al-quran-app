/* ------------------------------------------------------------------ */
/*  Aladhan Prayer Times API wrapper                                  */
/* ------------------------------------------------------------------ */

const BASE = 'https://api.aladhan.com/v1';

/* ── Types ── */

export type PrayerTimings = {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    Sunset: string;
    Midnight: string;
    Imsak: string;
};

export type HijriDate = {
    date: string;
    day: string;
    month: string;
    monthAr: string;
    year: string;
    weekdayEn: string;
    weekdayAr: string;
};

export type GregorianDate = {
    date: string;
    day: string;
    month: string;
    year: string;
    weekday: string;
};

export type PrayerTimesResponse = {
    timings: PrayerTimings;
    hijri: HijriDate;
    gregorian: GregorianDate;
};

/* ── API functions ── */

/**
 * Fetch prayer times by GPS coordinates.
 * Method 1 = University of Islamic Sciences, Karachi
 * Method 2 = ISNA (common in North America)
 * Method 3 = Muslim World League (default)
 */
export async function fetchPrayerTimesByCoords(
    latitude: number,
    longitude: number,
    method = 1,
): Promise<PrayerTimesResponse> {
    const url = `${BASE}/timings?latitude=${latitude}&longitude=${longitude}&method=${method}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Aladhan API failed: ${res.status}`);

    const json = await res.json();
    const data = json.data;

    return {
        timings: {
            Fajr: data.timings.Fajr,
            Sunrise: data.timings.Sunrise,
            Dhuhr: data.timings.Dhuhr,
            Asr: data.timings.Asr,
            Maghrib: data.timings.Maghrib,
            Isha: data.timings.Isha,
            Sunset: data.timings.Sunset,
            Midnight: data.timings.Midnight,
            Imsak: data.timings.Imsak,
        },
        hijri: {
            date: data.date.hijri.date,
            day: data.date.hijri.day,
            month: data.date.hijri.month.en,
            monthAr: data.date.hijri.month.ar,
            year: data.date.hijri.year,
            weekdayEn: data.date.hijri.weekday.en,
            weekdayAr: data.date.hijri.weekday.ar,
        },
        gregorian: {
            date: data.date.gregorian.date,
            day: data.date.gregorian.day,
            month: data.date.gregorian.month.en,
            year: data.date.gregorian.year,
            weekday: data.date.gregorian.weekday.en,
        },
    };
}

/**
 * Fetch prayer times by city name (fallback when GPS unavailable).
 */
export async function fetchPrayerTimesByCity(
    city: string,
    country: string,
    method = 1,
): Promise<PrayerTimesResponse> {
    const url = `${BASE}/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Aladhan City API failed: ${res.status}`);

    const json = await res.json();
    const data = json.data;

    return {
        timings: {
            Fajr: data.timings.Fajr,
            Sunrise: data.timings.Sunrise,
            Dhuhr: data.timings.Dhuhr,
            Asr: data.timings.Asr,
            Maghrib: data.timings.Maghrib,
            Isha: data.timings.Isha,
            Sunset: data.timings.Sunset,
            Midnight: data.timings.Midnight,
            Imsak: data.timings.Imsak,
        },
        hijri: {
            date: data.date.hijri.date,
            day: data.date.hijri.day,
            month: data.date.hijri.month.en,
            monthAr: data.date.hijri.month.ar,
            year: data.date.hijri.year,
            weekdayEn: data.date.hijri.weekday.en,
            weekdayAr: data.date.hijri.weekday.ar,
        },
        gregorian: {
            date: data.date.gregorian.date,
            day: data.date.gregorian.day,
            month: data.date.gregorian.month.en,
            year: data.date.gregorian.year,
            weekday: data.date.gregorian.weekday.en,
        },
    };
}

/**
 * Convert Aladhan time strings (e.g. "05:38") to a structured prayer list
 * matching the shape the UI already expects.
 *
 * On Fridays, Dhuhr is automatically replaced with "Jummah".
 */
export function timingsToList(timings: PrayerTimings, date?: Date) {
    const isFriday = (date ?? new Date()).getDay() === 5;
    return [
        { id: 'fajr', name: 'Fajr', time24: timings.Fajr },
        { id: 'sunrise', name: 'Sunrise', time24: timings.Sunrise },
        { id: 'dhuhr', name: isFriday ? 'Jummah' : 'Dhuhr', time24: timings.Dhuhr },
        { id: 'asr', name: 'Asr', time24: timings.Asr },
        { id: 'maghrib', name: 'Maghrib', time24: timings.Maghrib },
        { id: 'isha', name: 'Isha', time24: timings.Isha },
    ];
}
