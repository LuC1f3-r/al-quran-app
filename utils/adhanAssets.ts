/* ------------------------------------------------------------------ */
/*  Adhan Audio Assets — bundled local files                          */
/* ------------------------------------------------------------------ */

export type AdhanOption = {
    id: string;
    label: string;
    /** Short description shown in the picker */
    description: string;
    /** Local require() source for bundled audio */
    source: ReturnType<typeof require>;
};

/**
 * Available adhan audio options.
 * Audio files are bundled in assets/audio/ for offline support.
 */
export const ADHAN_OPTIONS: AdhanOption[] = [
    {
        id: 'makkah',
        label: 'Makkah',
        description: 'Masjid al-Haram style',
        source: require('../assets/audio/makkah-adhaan.mp3'),
    },
    {
        id: 'madinah',
        label: 'Madinah',
        description: 'Masjid an-Nabawi style',
        source: require('../assets/audio/medinah-adhaan.mp3'),
    },
    {
        id: 'alaqsa',
        label: 'Al-Aqsa',
        description: 'Masjid al-Aqsa style',
        source: require('../assets/audio/al-aqsa-adhaan.mp3'),
    },
    {
        id: 'egypt',
        label: 'Egypt',
        description: 'Egyptian style',
        source: require('../assets/audio/egypt-adhaan.mp3'),
    },
    {
        id: 'turkey',
        label: 'Turkey',
        description: 'Turkish style',
        source: require('../assets/audio/turkey-adhaan.mp3'),
    },
];

/** Default adhan ID */
export const DEFAULT_ADHAN_ID = 'makkah';

/** Get an adhan option by ID, falling back to the first option */
export function getAdhanOption(id: string): AdhanOption {
    return ADHAN_OPTIONS.find((o) => o.id === id) ?? ADHAN_OPTIONS[0];
}
