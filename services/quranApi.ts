/* ------------------------------------------------------------------ */
/*  Quran.com API v4 — Typed wrapper                                  */
/* ------------------------------------------------------------------ */

const BASE = 'https://api.quran.com/api/v4';

/* ── Types ── */

export type Chapter = {
    id: number;
    revelationPlace: string;
    bismillahPre: boolean;
    nameSimple: string;
    nameArabic: string;
    versesCount: number;
    pages: [number, number];
    translatedName: string;
};

export type QuranScript = 'uthmani' | 'indopak' | 'imlaei';

export type Verse = {
    id: number;
    verseNumber: number;
    verseKey: string;
    arabicText: string;
    pageNumber: number;
    juzNumber: number;
    translation?: string;
};

export type JuzMeta = {
    id: number;
    juzNumber: number;
    verseMapping: Record<string, string>; // e.g. { "2": "142-252" }
    firstVerseId: number;
    lastVerseId: number;
    versesCount: number;
};

/* ── In-memory cache ── */

let cachedChapters: Chapter[] | null = null;

/* ── API functions ── */

export async function fetchChapters(): Promise<Chapter[]> {
    if (cachedChapters) return cachedChapters;

    const res = await fetch(`${BASE}/chapters?language=en`);
    if (!res.ok) throw new Error(`Chapters API failed: ${res.status}`);

    const json = await res.json();
    const chapters: Chapter[] = json.chapters.map((c: any) => ({
        id: c.id,
        revelationPlace: c.revelation_place,
        bismillahPre: c.bismillah_pre,
        nameSimple: c.name_simple,
        nameArabic: c.name_arabic,
        versesCount: c.verses_count,
        pages: c.pages,
        translatedName: c.translated_name?.name ?? '',
    }));

    cachedChapters = chapters;
    return chapters;
}

/** Map script name → API field name */
const SCRIPT_FIELDS: Record<QuranScript, string> = {
    uthmani: 'text_uthmani',
    indopak: 'text_indopak',
    imlaei: 'text_imlaei',
};

export async function fetchVerses(
    chapterNumber: number,
    page = 1,
    perPage = 20,
    translationId = 131, // Dr. Mustafa Khattab
    script: QuranScript = 'uthmani',
): Promise<{ verses: Verse[]; totalPages: number }> {
    const field = SCRIPT_FIELDS[script];
    const url =
        `${BASE}/verses/by_chapter/${chapterNumber}` +
        `?language=en&translations=${translationId}` +
        `&fields=${field}` +
        `&page=${page}&per_page=${perPage}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Verses API failed: ${res.status}`);

    const json = await res.json();
    const verses: Verse[] = json.verses.map((v: any) => ({
        id: v.id,
        verseNumber: v.verse_number,
        verseKey: v.verse_key,
        arabicText: v[field] ?? v.text_uthmani ?? '',
        pageNumber: v.page_number,
        juzNumber: v.juz_number,
        translation: v.translations?.[0]?.text ?? '',
    }));

    return {
        verses,
        totalPages: json.pagination?.total_pages ?? 1,
    };
}

export async function fetchJuzList(): Promise<JuzMeta[]> {
    const res = await fetch(`${BASE}/juzs`);
    if (!res.ok) throw new Error(`Juz API failed: ${res.status}`);

    const json = await res.json();
    return json.juzs.map((j: any) => ({
        id: j.id,
        juzNumber: j.juz_number,
        verseMapping: j.verse_mapping,
        firstVerseId: j.first_verse_id,
        lastVerseId: j.last_verse_id,
        versesCount: j.verses_count,
    }));
}

/* ── Audio helpers ── */

/** Reciter folder names on EveryAyah CDN */
export const RECITERS = [
    { id: 'abdurrahman_as-sudais', name: 'Abdur-Rahman As-Sudais', folder: 'Abdurrahmaan_As-Sudais_192kbps' },
    { id: 'mishari_rashid', name: 'Mishary Rashid Alafasy', folder: 'Alafasy_128kbps' },
    { id: 'saad_al-ghamdi', name: 'Saad Al-Ghamdi', folder: 'Saad_Al_Ghamdi_128kbps' },
    { id: 'abdul_basit_murattal', name: 'Abdul Basit (Murattal)', folder: 'Abdul_Basit_Murattal_192kbps' },
    { id: 'abdul_basit_mujawwad', name: 'Abdul Basit (Mujawwad)', folder: 'Abdul_Basit_Mujawwad_128kbps' },
    { id: 'abu_bakr_ash-shaatree', name: 'Abu Bakr Ash-Shaatree', folder: 'Abu_Bakr_Ash-Shaatree_128kbps' },
    { id: 'abdullah_basfar', name: 'Abdullah Basfar', folder: 'Abdullah_Basfar_192kbps' },
    { id: 'hani_rifai', name: 'Hani Ar-Rifai', folder: 'Hani_Rifai_192kbps' },
    { id: 'husary_murattal', name: 'Mahmoud Khalil Al-Husary', folder: 'Husary_128kbps' },
    { id: 'husary_mujawwad', name: 'Al-Husary (Mujawwad)', folder: 'Husary_128kbps_Mujawwad' },
    { id: 'hudhaify', name: 'Ali Al-Hudhaify', folder: 'Hudhaify_128kbps' },
    { id: 'maher_al_muaiqly', name: 'Maher Al-Muaiqly', folder: 'MaherAlMuaiqly128kbps' },
    { id: 'minshawy_mujawwad', name: 'Al-Minshawy (Mujawwad)', folder: 'Minshawy_Mujawwad_192kbps' },
    { id: 'minshawy_murattal', name: 'Al-Minshawy (Murattal)', folder: 'Minshawy_Murattal_128kbps' },
    { id: 'muhammad_ayyoub', name: 'Muhammad Ayyoub', folder: 'Muhammad_Ayyoub_128kbps' },
    { id: 'muhammad_jibreel', name: 'Muhammad Jibreel', folder: 'Muhammad_Jibreel_128kbps' },
    { id: 'saood_ash-shuraym', name: 'Saud Ash-Shuraym', folder: 'Saood_ash-Shuraym_128kbps' },
    { id: 'nasser_alqatami', name: 'Nasser Al-Qatami', folder: 'Nasser_Alqatami_128kbps' },
    { id: 'yasser_ad-dussary', name: 'Yasser Ad-Dussary', folder: 'Yasser_Ad-Dussary_128kbps' },
    { id: 'khalid_al-qahtanee', name: 'Khalid Al-Qahtanee', folder: 'Khaalid_Abdullaah_al-Qahtaanee_192kbps' },
] as const;

export type ReciterId = (typeof RECITERS)[number]['id'];

/**
 * Returns direct MP3 URL for a specific ayah.
 * Format: https://everyayah.com/data/{folder}/{surah3}{ayah3}.mp3
 */
export function getAyahAudioUrl(
    surahNumber: number,
    ayahNumber: number,
    reciterFolder: string,
): string {
    const s = String(surahNumber).padStart(3, '0');
    const a = String(ayahNumber).padStart(3, '0');
    return `https://everyayah.com/data/${reciterFolder}/${s}${a}.mp3`;
}
