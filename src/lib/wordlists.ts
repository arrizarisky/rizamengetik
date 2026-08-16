import { Difficulty, DrillType, Language } from '../types';
import { textGeneratorService } from './textGenerator';

// Fallback word lists (used when Gemini API is unavailable or loading)
export const FALLBACK_WORD_LISTS: Record<Language, Record<Difficulty, string[]>> = {
  id: {
    easy: [
      'saya suka belajar mengetik dengan sepuluh jari tanpa melihat papan tombol',
      'fokus pada akurasi dan ketepatan jari di baris utama tuts F dan J',
      'kopi hangat di pagi hari menemani semangat kerja dan belajar hal baru',
      'kebiasaan baik dibangun secara perlahan setiap hari dengan konsisten',
      'pola pikir yang tenang menghasilkan ketukan jari yang tepat dan teratur',
      'ketepatan selalu lebih penting daripada sekadar mengetik dengan tergesa',
      'setiap huruf memiliki posisi jari yang sudah ditentukan sejak awal',
      'latihan rutin lima menit sehari melatih memori otot secara alami',
    ],
    medium: [
      'Memori otot terbentuk ketika jari kita terbiasa menekan tombol tanpa perlu melirik layar atau keyboard.',
      'Akurasi adalah fondasi utama; kecepatan mengetik akan bertambah secara otomatis seiring meningkatnya ketepatan.',
      'Dalam mode blind typing, dengarkan audio dengan saksama dan biarkan kedua tangan bekerja secara otomatis.',
      'Posisi dasar kedua jari telunjuk berada di tombol F dan J yang memiliki tonjolan taktil khusus.',
      'Hindari kebiasaan menekan tombol backspace berulang kali; ketiklah secara tenang dan terencana.',
      'Disiplin dalam posisi jari sepuluh akan mencegah cedera pergelangan tangan saat bekerja lama di depan komputer.',
    ],
    hard: [
      'PT Teknologi Nusantara (Persero) mencatat pertumbuhan 24.8% pada Q3-2025; total transaksi capai Rp 18.500.000!',
      'Gunakan kombinasi Shift + 7 untuk menghasilkan karakter ampersand (&), dan Shift + 5 untuk persentase (%).',
      'Refleks motorik halus (fine-motor control) pada jari kelingking kiri memerlukan 10.000 repetisi stimulus.',
      'Pada tanggal 17-08-1945, naskah Proklamasi diketik dengan mesin ketik manual buatan Jerman berformat QWERTZ.',
      'Kombinasi tombol spesial: Ctrl+Shift+P, Alt+F4, serta karakter kurung kurawal { dan } pada tata letak standar.',
    ],
    code: [
      'const calculateAccuracy = (correct: number, total: number): number => Math.round((correct / total) * 100);',
      'interface UserSession { id: string; hearts: number; isPassed: boolean; score: number; }',
      'function handleKeyPress(event: KeyboardEvent): void { if (event.key === targetChar) playThock(); }',
      'const [streak, setStreak] = useState<number>(0); useEffect(() => { checkDailyGoal(); }, []);',
      'const response = await fetch("/api/scores", { method: "POST", headers: { "Content-Type": "application/json" } });',
      'export default function BlindMode() { const audio = useAudio(); return <div className="p-4" />; }',
    ],
  },
  en: {
    easy: [
      'focus on accuracy and muscle memory rather than raw typing speed',
      'keep your index fingers resting gently on the home keys F and J',
      'smooth and steady rhythm creates flawless typing without backspaces',
      'every key on the board belongs to a specific dedicated finger',
      'blind typing allows you to write your thoughts at the speed of thought',
      'practice five minutes every single day to build everlasting muscle memory',
      'calm mind and precise fingers make the perfect typing companion',
      'listen carefully to the audio cues and trust your finger instincts',
    ],
    medium: [
      'True mastery is not about how fast your fingers fly, but how rarely they make a mistake.',
      'Place your hands on the home row; feel the tactile bumps on F and J before you start typing.',
      'In blind mode, close your eyes and let your auditory memory guide your mechanical keystrokes.',
      'A clean streak without touching the backspace key earns the highest precision multipliers.',
      'Good posture and ergonomic finger positioning protect your wrists during long coding sessions.',
      'Typing with 100% accuracy saves more editing time than typing fast with continuous mistakes.',
    ],
    hard: [
      'The Apollo 11 mission landed on July 20, 1969, with only 15% fuel remaining in the Lunar Module (LM-5)!',
      'According to IEEE Standard 754-2019, 64-bit floating point numbers have 53 bits of precision (~15-17 digits).',
      'Always remember: 99.4% precision beats 120 WPM with 85% accuracy in production code reviews & data entry.',
      'Special symbols require precise pinky coordination: ~ ! @ # $ % ^ & * ( ) _ + { } | : " < > ?',
      'The quick brown fox jumps over 10 lazy dogs @ 4:30 PM — test every single character in the standard ASCII set!',
    ],
    code: [
      'export async function getLeaderboard(): Promise<LeaderboardEntry[]> { return await supabase.from("scores").select("*"); }',
      'const filter = (items: string[], query: string) => items.filter(item => item.toLowerCase().includes(query));',
      'type AccuracyMetric = { totalStrokes: number; correctStrokes: number; errorRate: number; };',
      'const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();',
      'if (hearts <= 0) { soundEngine.playHeartLost(); setGameState("FAILED"); }',
      'const isFlawless = errors === 0 && backspaces === 0;',
    ],
  },
};

export const DRILLS: Record<DrillType, { title: string; subtitle: string; words: string[] }> = {
  home_row: {
    title: 'Home Row Mastery (ASDF JKL;)',
    subtitle: 'Anchor your fingers on the baseline with tactile nubs on F and J',
    words: [
      'fjfj dkdk slsl a;a; fa jada fall flask salad flash dash glad half flask',
      'ask dad all fall alas alfalfa kafka salsa flask flash lads fall dahlia',
      'dad asks dad falls all lads ask a flask flash as a salad adds salsa',
    ],
  },
  top_row: {
    title: 'Top Row Reach (QWERTY UIOP)',
    subtitle: 'Upward finger extensions without lifting your palm base',
    words: [
      'tree quiet wire peer write power troop root pour report quote pretty write type',
      'power route write pure queue proper query tower writer prior pottery require',
      'pure quiet poetry wrote true utility properly power output write query tree',
    ],
  },
  bottom_row: {
    title: 'Bottom Row Agility (ZXCVB NM,./)',
    subtitle: 'Downward finger tucks and thumb spacebar synchronization',
    words: [
      'zack buzz vibe calm menu next back zone moon zinc view cabin maximum',
      'box cab zinc zoom venom vanish bench climb comb combative mix bronze blank',
      'vanish black box zinc calm buzz view next menu cabin zinc back zoom vibe',
    ],
  },
  number_row: {
    title: 'Number Row Precision (1234567890)',
    subtitle: 'Extended vertical reaches for numbers without looking down',
    words: [
      '102 938 475 8291 3847 19283 50493 928374 1029 3847 5610 9482 7361 5029',
      '2025 1984 3.1415 42 100% 777 9999 501 842 16384 32768 65536 256 512 1024',
    ],
  },
  symbols: {
    title: 'Code & Punctuation Symbols',
    subtitle: 'Shift key synchronization and pinky finger strength',
    words: [
      'const data = { id: 1, name: "blind", items: [1, 2, 3], active: true };',
      'function test(a: number, b: number): boolean { return (a + b) >= 100; }',
      'npm i @supabase/supabase-js @tailwindcss/vite --save-dev && npm run test',
    ],
  },
  custom: {
    title: 'Targeted Weak Finger Drill',
    subtitle: 'Generated exercises focusing on your most frequent mistyped keys',
    words: [],
  },
};

// Key to finger mapping for the virtual keyboard
export const KEY_FINGER_MAPPING: Record<
  string,
  { finger: string; hand: 'left' | 'right'; label: string; color: string }
> = {
  // Left Hand
  '`': { finger: 'left-pinky', hand: 'left', label: 'L. Pinky', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  '~': { finger: 'left-pinky', hand: 'left', label: 'L. Pinky', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  '1': { finger: 'left-pinky', hand: 'left', label: 'L. Pinky', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  '!': { finger: 'left-pinky', hand: 'left', label: 'L. Pinky', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  'q': { finger: 'left-pinky', hand: 'left', label: 'L. Pinky', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  'Q': { finger: 'left-pinky', hand: 'left', label: 'L. Pinky', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  'a': { finger: 'left-pinky', hand: 'left', label: 'L. Pinky', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  'A': { finger: 'left-pinky', hand: 'left', label: 'L. Pinky', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  'z': { finger: 'left-pinky', hand: 'left', label: 'L. Pinky', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  'Z': { finger: 'left-pinky', hand: 'left', label: 'L. Pinky', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },

  '2': { finger: 'left-ring', hand: 'left', label: 'L. Ring', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  '@': { finger: 'left-ring', hand: 'left', label: 'L. Ring', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  'w': { finger: 'left-ring', hand: 'left', label: 'L. Ring', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  'W': { finger: 'left-ring', hand: 'left', label: 'L. Ring', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  's': { finger: 'left-ring', hand: 'left', label: 'L. Ring', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  'S': { finger: 'left-ring', hand: 'left', label: 'L. Ring', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  'x': { finger: 'left-ring', hand: 'left', label: 'L. Ring', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  'X': { finger: 'left-ring', hand: 'left', label: 'L. Ring', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },

  '3': { finger: 'left-middle', hand: 'left', label: 'L. Middle', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  '#': { finger: 'left-middle', hand: 'left', label: 'L. Middle', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  'e': { finger: 'left-middle', hand: 'left', label: 'L. Middle', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  'E': { finger: 'left-middle', hand: 'left', label: 'L. Middle', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  'd': { finger: 'left-middle', hand: 'left', label: 'L. Middle', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  'D': { finger: 'left-middle', hand: 'left', label: 'L. Middle', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  'c': { finger: 'left-middle', hand: 'left', label: 'L. Middle', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  'C': { finger: 'left-middle', hand: 'left', label: 'L. Middle', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },

  '4': { finger: 'left-index', hand: 'left', label: 'L. Index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  '$': { finger: 'left-index', hand: 'left', label: 'L. Index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  '5': { finger: 'left-index', hand: 'left', label: 'L. Index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  '%': { finger: 'left-index', hand: 'left', label: 'L. Index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  'r': { finger: 'left-index', hand: 'left', label: 'L. Index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  'R': { finger: 'left-index', hand: 'left', label: 'L. Index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  't': { finger: 'left-index', hand: 'left', label: 'L. Index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  'T': { finger: 'left-index', hand: 'left', label: 'L. Index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  'f': { finger: 'left-index', hand: 'left', label: 'L. Index (Home Nodule)', color: 'bg-cyan-500/30 text-cyan-200 border-cyan-400 font-bold' },
  'F': { finger: 'left-index', hand: 'left', label: 'L. Index (Home Nodule)', color: 'bg-cyan-500/30 text-cyan-200 border-cyan-400 font-bold' },
  'g': { finger: 'left-index', hand: 'left', label: 'L. Index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  'G': { finger: 'left-index', hand: 'left', label: 'L. Index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  'v': { finger: 'left-index', hand: 'left', label: 'L. Index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  'V': { finger: 'left-index', hand: 'left', label: 'L. Index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  'b': { finger: 'left-index', hand: 'left', label: 'L. Index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  'B': { finger: 'left-index', hand: 'left', label: 'L. Index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },

  // Right Hand
  '6': { finger: 'right-index', hand: 'right', label: 'R. Index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  '^': { finger: 'right-index', hand: 'right', label: 'R. Index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  '7': { finger: 'right-index', hand: 'right', label: 'R. Index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  '&': { finger: 'right-index', hand: 'right', label: 'R. Index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  'y': { finger: 'right-index', hand: 'right', label: 'R. Index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  'Y': { finger: 'right-index', hand: 'right', label: 'R. Index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  'u': { finger: 'right-index', hand: 'right', label: 'R. Index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  'U': { finger: 'right-index', hand: 'right', label: 'R. Index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  'h': { finger: 'right-index', hand: 'right', label: 'R. Index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  'H': { finger: 'right-index', hand: 'right', label: 'R. Index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  'j': { finger: 'right-index', hand: 'right', label: 'R. Index (Home Nodule)', color: 'bg-blue-500/30 text-blue-200 border-blue-400 font-bold' },
  'J': { finger: 'right-index', hand: 'right', label: 'R. Index (Home Nodule)', color: 'bg-blue-500/30 text-blue-200 border-blue-400 font-bold' },
  'n': { finger: 'right-index', hand: 'right', label: 'R. Index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  'N': { finger: 'right-index', hand: 'right', label: 'R. Index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  'm': { finger: 'right-index', hand: 'right', label: 'R. Index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  'M': { finger: 'right-index', hand: 'right', label: 'R. Index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },

  '8': { finger: 'right-middle', hand: 'right', label: 'R. Middle', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  '*': { finger: 'right-middle', hand: 'right', label: 'R. Middle', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  'i': { finger: 'right-middle', hand: 'right', label: 'R. Middle', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  'I': { finger: 'right-middle', hand: 'right', label: 'R. Middle', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  'k': { finger: 'right-middle', hand: 'right', label: 'R. Middle', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  'K': { finger: 'right-middle', hand: 'right', label: 'R. Middle', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  ',': { finger: 'right-middle', hand: 'right', label: 'R. Middle', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  '<': { finger: 'right-middle', hand: 'right', label: 'R. Middle', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },

  '9': { finger: 'right-ring', hand: 'right', label: 'R. Ring', color: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
  '(': { finger: 'right-ring', hand: 'right', label: 'R. Ring', color: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
  'o': { finger: 'right-ring', hand: 'right', label: 'R. Ring', color: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
  'O': { finger: 'right-ring', hand: 'right', label: 'R. Ring', color: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
  'l': { finger: 'right-ring', hand: 'right', label: 'R. Ring', color: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
  'L': { finger: 'right-ring', hand: 'right', label: 'R. Ring', color: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
  '.': { finger: 'right-ring', hand: 'right', label: 'R. Ring', color: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
  '>': { finger: 'right-ring', hand: 'right', label: 'R. Ring', color: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },

  '0': { finger: 'right-pinky', hand: 'right', label: 'R. Pinky', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  ')': { finger: 'right-pinky', hand: 'right', label: 'R. Pinky', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  '-': { finger: 'right-pinky', hand: 'right', label: 'R. Pinky', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  '_': { finger: 'right-pinky', hand: 'right', label: 'R. Pinky', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  '=': { finger: 'right-pinky', hand: 'right', label: 'R. Pinky', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  '+': { finger: 'right-pinky', hand: 'right', label: 'R. Pinky', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  'p': { finger: 'right-pinky', hand: 'right', label: 'R. Pinky', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  'P': { finger: 'right-pinky', hand: 'right', label: 'R. Pinky', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  '[': { finger: 'right-pinky', hand: 'right', label: 'R. Pinky', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  '{': { finger: 'right-pinky', hand: 'right', label: 'R. Pinky', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  ']': { finger: 'right-pinky', hand: 'right', label: 'R. Pinky', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  '}': { finger: 'right-pinky', hand: 'right', label: 'R. Pinky', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  ';': { finger: 'right-pinky', hand: 'right', label: 'R. Pinky', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  ':': { finger: 'right-pinky', hand: 'right', label: 'R. Pinky', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  "'": { finger: 'right-pinky', hand: 'right', label: 'R. Pinky', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  '"': { finger: 'right-pinky', hand: 'right', label: 'R. Pinky', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  '/': { finger: 'right-pinky', hand: 'right', label: 'R. Pinky', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  '?': { finger: 'right-pinky', hand: 'right', label: 'R. Pinky', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },

  ' ': { finger: 'thumb', hand: 'left', label: 'Thumb (Spacebar)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
};

// Dynamic word lists with AI generation
export class WordListManager {
  private static instance: WordListManager;
  private generatedLists: Map<string, string[]> = new Map();
  private isGenerating: Map<string, boolean> = new Map();

  private constructor() {}

  static getInstance(): WordListManager {
    if (!WordListManager.instance) {
      WordListManager.instance = new WordListManager();
    }
    return WordListManager.instance;
  }

  private getCacheKey(language: Language, difficulty: Difficulty): string {
    return `${language}_${difficulty}`;
  }

  async getWordList(language: Language, difficulty: Difficulty): Promise<string[]> {
    const cacheKey = this.getCacheKey(language, difficulty);

    // Return cached if available
    if (this.generatedLists.has(cacheKey)) {
      return this.generatedLists.get(cacheKey)!;
    }

    // If already generating, return fallback
    if (this.isGenerating.get(cacheKey)) {
      return FALLBACK_WORD_LISTS[language][difficulty];
    }

    // Try to generate new texts
    try {
      this.isGenerating.set(cacheKey, true);
      const texts = await textGeneratorService.generateTexts(language, difficulty);
      
      if (texts && texts.length > 0) {
        this.generatedLists.set(cacheKey, texts);
        return texts;
      }
    } catch (error) {
      console.error('Failed to generate word list, using fallback:', error);
    } finally {
      this.isGenerating.set(cacheKey, false);
    }

    // Fallback to static lists
    return FALLBACK_WORD_LISTS[language][difficulty];
  }

  async refreshWordList(language: Language, difficulty: Difficulty): Promise<string[]> {
    const cacheKey = this.getCacheKey(language, difficulty);
    
    try {
      const texts = await textGeneratorService.generateTexts(language, difficulty, true);
      
      if (texts && texts.length > 0) {
        this.generatedLists.set(cacheKey, texts);
        return texts;
      }
    } catch (error) {
      console.error('Failed to refresh word list:', error);
    }

    return FALLBACK_WORD_LISTS[language][difficulty];
  }

  clearCache(): void {
    this.generatedLists.clear();
    textGeneratorService.clearCache();
  }
}

// Export singleton instance
export const wordListManager = WordListManager.getInstance();

// Backward compatibility: export dynamic getter
export const getWordLists = async (language: Language, difficulty: Difficulty): Promise<string[]> => {
  return wordListManager.getWordList(language, difficulty);
};

// For immediate use (non-async), returns fallback
export const WORD_LISTS = FALLBACK_WORD_LISTS;
