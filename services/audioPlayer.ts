/* ------------------------------------------------------------------ */
/*  Audio Player Service — uses expo-av                               */
/* ------------------------------------------------------------------ */

import { Audio } from 'expo-av';
import { getAyahAudioUrl, RECITERS, type ReciterId } from './quranApi';

type PlaybackState = {
    isPlaying: boolean;
    currentSurah: number;
    currentAyah: number;
    reciterFolder: string;
    durationMs: number;
    positionMs: number;
};

let sound: Audio.Sound | null = null;
let state: PlaybackState = {
    isPlaying: false,
    currentSurah: 0,
    currentAyah: 0,
    reciterFolder: '',
    durationMs: 0,
    positionMs: 0,
};

type Listener = (state: PlaybackState) => void;
const listeners = new Set<Listener>();

function notifyListeners() {
    listeners.forEach((fn) => fn({ ...state }));
}

export function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}

export function getState() {
    return { ...state };
}

/** Resolve the reciter folder from a reciter name */
function resolveFolder(reciterName: string): string {
    const match = RECITERS.find((r) => r.name === reciterName);
    return match?.folder ?? RECITERS[0].folder;
}

/** Play a single ayah */
export async function playAyah(
    surahNumber: number,
    ayahNumber: number,
    reciterName: string,
): Promise<void> {
    await stopAudio();

    const folder = resolveFolder(reciterName);
    const url = getAyahAudioUrl(surahNumber, ayahNumber, folder);

    await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
    });

    const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        (status) => {
            if (status.isLoaded) {
                state = {
                    ...state,
                    isPlaying: status.isPlaying,
                    durationMs: status.durationMillis ?? 0,
                    positionMs: status.positionMillis ?? 0,
                };
                notifyListeners();

                // Auto-stop when finished
                if (status.didJustFinish) {
                    state.isPlaying = false;
                    notifyListeners();
                }
            }
        },
    );

    sound = newSound;
    state = {
        isPlaying: true,
        currentSurah: surahNumber,
        currentAyah: ayahNumber,
        reciterFolder: folder,
        durationMs: 0,
        positionMs: 0,
    };
    notifyListeners();
}

/** Pause */
export async function pauseAudio(): Promise<void> {
    if (sound) {
        await sound.pauseAsync();
        state.isPlaying = false;
        notifyListeners();
    }
}

/** Resume */
export async function resumeAudio(): Promise<void> {
    if (sound) {
        await sound.playAsync();
        state.isPlaying = true;
        notifyListeners();
    }
}

/** Toggle play/pause */
export async function toggleAudio(): Promise<void> {
    if (state.isPlaying) {
        await pauseAudio();
    } else {
        await resumeAudio();
    }
}

/** Stop and unload */
export async function stopAudio(): Promise<void> {
    if (sound) {
        try {
            await sound.stopAsync();
            await sound.unloadAsync();
        } catch {
            // ignore if already unloaded
        }
        sound = null;
    }
    state = { isPlaying: false, currentSurah: 0, currentAyah: 0, reciterFolder: '', durationMs: 0, positionMs: 0 };
    notifyListeners();
}

/** Play entire surah sequentially */
export async function playSurah(
    surahNumber: number,
    totalAyahs: number,
    reciterName: string,
    startAyah = 1,
): Promise<void> {
    const folder = resolveFolder(reciterName);

    for (let ayah = startAyah; ayah <= totalAyahs; ayah++) {
        if (!state.isPlaying && ayah > startAyah) break; // user stopped

        const url = getAyahAudioUrl(surahNumber, ayah, folder);
        await stopAudio();

        await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
        });

        const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: url },
            { shouldPlay: true },
        );

        sound = newSound;
        state = {
            isPlaying: true,
            currentSurah: surahNumber,
            currentAyah: ayah,
            reciterFolder: folder,
            durationMs: 0,
            positionMs: 0,
        };
        notifyListeners();

        // Wait for playback to finish
        await new Promise<void>((resolve) => {
            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded) {
                    state.durationMs = status.durationMillis ?? 0;
                    state.positionMs = status.positionMillis ?? 0;
                    notifyListeners();

                    if (status.didJustFinish) {
                        resolve();
                    }
                }
            });
        });
    }

    state.isPlaying = false;
    notifyListeners();
}
