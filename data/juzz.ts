export type Juzz = {
  id: number;
  name: string;
  arabic: string;
  startPage: number;
};

const names = [
  ['Alif Lam Meem', 'الم'],
  ['Sayaqool', 'سيقول'],
  ['Tilkal Rusul', 'تلك الرسل'],
  ['Lan Tana Loo', 'لن تنالوا'],
  ['Wal Mohsanat', 'والمحصنات'],
  ['La Yuhibbullah', 'لا يحب الله'],
  ['Wa Iza Samiu', 'واذا سمعوا'],
  ['Wa Lau Annana', 'ولو أننا'],
  ['Qalal Malao', 'قال الملأ'],
  ["Wa A'lamu", 'واعلموا'],
  ["Ya'tazeroon", 'يعتذرون'],
  ['Wa Mamin Daabat', 'وما من دابة'],
  ['Wa Ma Ubarriu', 'وما أبرئ'],
  ['Rubama', 'ربما'],
  ['Subhanallazi', 'سبحان الذي'],
  ['Qal Alam', 'قال ألم'],
  ['Aqtarabat', 'اقتربت'],
  ['Qad Aflaha', 'قد أفلح'],
  ['Wa Qalallazina', 'وقال الذين'],
  ["A'man Khalaq", 'أمن خلق'],
  ['Utlu Ma Oohi', 'اتل ما أوحي'],
  ['Wa Manyaqnut', 'ومن يقنت'],
  ['Wa Mali', 'وما لي'],
  ['Faman Azlam', 'فمن أظلم'],
  ['Elahe Yuruddo', 'إليه يرد'],
  ["Ha'a Meem", 'حم'],
  ['Qala Fama Khatbukum', 'قال فما خطبكم'],
  ['Qad Sami Allah', 'قد سمع الله'],
  ['Tabarakallazi', 'تبارك الذي'],
  ['Amma', 'عم'],
] as const;

export const JUZZ_LIST: Juzz[] = names.map((item, index) => ({
  id: index + 1,
  name: item[0],
  arabic: item[1],
  startPage: index === 0 ? 2 : index * 20 + 2,
}));
