export type Ayah = {
  id: number;
  arabic: string;
  translation: string;
  narrator: string;
};

export const AL_BAQARAH_SAMPLE_AYAHS: Ayah[] = [
  {
    id: 1,
    arabic: 'الم',
    translation: 'Alif, Lam, Meem.',
    narrator: 'Dr. Mustafa Khattab',
  },
  {
    id: 2,
    arabic: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ',
    translation: 'This is the Book! There is no doubt about it, a guide for those mindful of Allah.',
    narrator: 'Dr. Mustafa Khattab',
  },
  {
    id: 3,
    arabic: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ',
    translation: 'Who believe in the unseen, establish prayer, and donate from what We have provided for them.',
    narrator: 'Dr. Mustafa Khattab',
  },
];
