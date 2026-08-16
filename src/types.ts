export type Language = 'id' | 'en';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'code';

export type DrillType = 'home_row' | 'top_row' | 'bottom_row' | 'number_row' | 'symbols' | 'custom';

export type SoundSwitchType = 'thock' | 'clicky' | 'creamy' | 'silent';

export type GameMode = 'precision' | 'blind' | 'drills' | 'leaderboard';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string; // icon name or uploaded image URL
  avatarType: 'icon' | 'upload'; // Type of avatar
  typoFrequency: string; // from onboarding survey
  dailyGoalMinutes: number; // 5, 10, 15
  initialAccuracy: number; // from diagnostic test
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface UserStats {
  totalSessions: number;
  totalTimeMinutes: number;
  overallAccuracy: number;
  bestAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  todayMinutesPracticed: number;
  totalCharactersTyped: number;
  totalErrors: number;
  totalBackspaces: number;
  fingerAccuracyMap: Record<string, { correct: number; total: number }>;
  keyMistakeCount: Record<string, number>;
  xp: number;
  level: number;
}

export interface SessionResult {
  id: string;
  mode: GameMode;
  language: Language;
  difficulty: Difficulty;
  accuracy: number; // 0 - 100%
  rawAccuracy: number; // before penalties
  wpm: number;
  cpm: number;
  score: number;
  totalStrokes: number;
  correctStrokes: number;
  errorCount: number;
  backspaceCount: number;
  timeSpentSeconds: number;
  completedAt: string;
  heartsRemaining: number;
  passed: boolean;
  mistakesByKey: Record<string, number>;
  streakBonus: number;
  targetTextLength: number;
}

export interface LeaderboardEntry {
  id: string;
  user_name: string;
  avatar: string;
  accuracy: number;
  score: number;
  mode: string;
  language: string;
  difficulty: string;
  backspaces: number;
  wpm: number;
  created_at: string;
}

export interface Settings {
  soundProfile: SoundSwitchType;
  soundVolume: number; // 0 to 1
  ttsRate: number; // 0.7 to 1.3
  ttsPitch: number;
  enableErrorChime: boolean;
  enableTTSVoice: boolean;
  strictBackspaceMode: boolean; // Backspaces reduce score extra
  zenMode: boolean; // Unlimited hearts
  showVirtualKeyboard: boolean;
  showFingerGuides: boolean;
  blindfoldCurtain: boolean; // Blackout screen in blind mode
  fontFamily: 'mono' | 'sans';
  maxHearts: number; // User-defined max hearts (1-10)
  customText: string; // Custom text for practice
  useCustomText: boolean; // Toggle to use custom text
}

export interface FingerMapping {
  key: string;
  finger: 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index' | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky' | 'thumb';
  hand: 'left' | 'right';
}
