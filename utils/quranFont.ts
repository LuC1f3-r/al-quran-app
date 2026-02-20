import type { QuranScript } from '../store/useAppStore';

/**
 * Maps the user's quranScript setting to the loaded font family name.
 */
export function getQuranFontFamily(script: QuranScript): string {
    switch (script) {
        case 'uthmani':
            return 'UthmanicHafs';
        case 'indopak':
            return 'IndoPakScript';
        case 'imlaei':
        default:
            return 'UthmaniScript';
    }
}
