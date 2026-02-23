/* ------------------------------------------------------------------ */
/*  Adhan Audio Player — uses expo-av                                 */
/*  Dedicated player separate from Quran recitation audioPlayer.ts    */
/* ------------------------------------------------------------------ */

import { Audio } from 'expo-av';
import { getAdhanOption } from '../utils/adhanAssets';

type AdhanPlaybackState = {
    isPlaying: boolean;
    /** Which prayer row triggered the playback (e.g. 'fajr') */
    activePrayerId: string | null;
    /** Which adhan audio is loaded (e.g. 'makkah') */
    adhanId: string | null;
};

let sound: Audio.Sound | null = null;
let state: AdhanPlaybackState = {
    isPlaying: false,
    activePrayerId: null,
    adhanId: null,
};

type Listener = (state: AdhanPlaybackState) => void;
const listeners = new Set<Listener>();

function notifyListeners() {
    listeners.forEach((fn) => fn({ ...state }));
}

/** Subscribe to playback state changes */
export function subscribeAdhan(listener: Listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/** Get current playback state */
export function getAdhanState(): AdhanPlaybackState {
    return { ...state };
}

/** Stop and unload any currently playing adhan */
export async function stopAdhan(): Promise<void> {
    if (sound) {
        try {
            await sound.stopAsync();
            await sound.unloadAsync();
        } catch {
            // ignore if already unloaded
        }
        sound = null;
    }
    state = { isPlaying: false, activePrayerId: null, adhanId: null };
    notifyListeners();
}

/**
 * Play the adhan audio.
 *
 * @param adhanId  - ID from ADHAN_OPTIONS (e.g. 'makkah')
 * @param prayerId - which prayer row triggered this (e.g. 'fajr')
 */
export async function playAdhan(adhanId: string, prayerId: string): Promise<void> {
    // If the same adhan is already playing for the same prayer, toggle off
    if (state.isPlaying && state.activePrayerId === prayerId) {
        await stopAdhan();
        return;
    }

    // Stop any existing playback first
    await stopAdhan();

    const option = getAdhanOption(adhanId);

    await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
    });

    const { sound: newSound } = await Audio.Sound.createAsync(
        option.source,
        { shouldPlay: true },
        (status) => {
            if (status.isLoaded) {
                if (status.didJustFinish) {
                    state = { isPlaying: false, activePrayerId: null, adhanId: null };
                    notifyListeners();
                    // Unload after finishing
                    newSound.unloadAsync().catch(() => { });
                    if (sound === newSound) sound = null;
                }
            }
        },
    );

    sound = newSound;
    state = {
        isPlaying: true,
        activePrayerId: prayerId,
        adhanId,
    };
    notifyListeners();
}

/**
 * Preview an adhan without associating it with a specific prayer row.
 * Useful for the settings modal when browsing muezzin options.
 */
export async function previewAdhan(adhanId: string): Promise<void> {
    await playAdhan(adhanId, '__preview__');
}
