import React, { createContext, useContext, useEffect, useState } from 'react';
import { soundEngine } from '../lib/audio';
import { upgradeLocalStorageSchema } from '../lib/migration';
import { submitScoreToLeaderboard } from '../lib/supabase';
import {
  Difficulty,
  DrillType,
  GameMode,
  Language,
  SessionResult,
  Settings,
  UserProfile,
  UserStats,
} from '../types';

interface AppContextType {
  userProfile: UserProfile;
  userStats: UserStats;
  settings: Settings;
  currentMode: GameMode;
  selectedLanguage: Language;
  selectedDifficulty: Difficulty;
  selectedDrill: DrillType;
  activeHearts: number;
  maxHearts: number;
  lastSessionResult: SessionResult | null;
  isResultModalOpen: boolean;
  isAnalyticsModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isProfileModalOpen: boolean;
  updateProfile: (profile: Partial<UserProfile>) => void;
  completeOnboarding: (profile: Partial<UserProfile>, initialAccuracy: number) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  setMode: (mode: GameMode) => void;
  setLanguage: (lang: Language) => void;
  setDifficulty: (diff: Difficulty) => void;
  setDrill: (drill: DrillType) => void;
  recordSessionResult: (result: SessionResult) => void;
  loseHeart: () => boolean; // returns true if dead
  resetHearts: () => void;
  openResultModal: () => void;
  closeResultModal: () => void;
  setIsAnalyticsModalOpen: (open: boolean) => void;
  setIsSettingsModalOpen: (open: boolean) => void;
  setIsProfileModalOpen: (open: boolean) => void;
  resetOnboarding: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'user-' + Math.random().toString(36).substring(2, 9),
  name: 'Precision Typist',
  avatar: 'User',
  avatarType: 'icon',
  typoFrequency: 'sometimes',
  dailyGoalMinutes: 10,
  initialAccuracy: 95.0,
  onboardingCompleted: false,
  createdAt: new Date().toISOString(),
};

const DEFAULT_STATS: UserStats = {
  totalSessions: 0,
  totalTimeMinutes: 0,
  overallAccuracy: 98.2,
  bestAccuracy: 0,
  currentStreak: 1,
  longestStreak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  todayMinutesPracticed: 0,
  totalCharactersTyped: 0,
  totalErrors: 0,
  totalBackspaces: 0,
  fingerAccuracyMap: {},
  keyMistakeCount: {},
  xp: 150,
  level: 1,
};

const DEFAULT_SETTINGS: Settings = {
  soundProfile: 'thock',
  soundVolume: 0.75,
  ttsRate: 0.95,
  ttsPitch: 1.0,
  enableErrorChime: true,
  enableTTSVoice: true,
  strictBackspaceMode: true,
  zenMode: false,
  showVirtualKeyboard: true,
  showFingerGuides: true,
  blindfoldCurtain: true,
  fontFamily: 'mono',
  maxHearts: 3,
  customText: '',
  useCustomText: false,
};

const STORAGE_KEYS = {
  PROFILE: 'blindtype_profile',
  STATS: 'blindtype_stats',
  SETTINGS: 'blindtype_settings',
  SESSION_HISTORY: 'blindtype_history',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Run migration on mount (only once per session)
  useEffect(() => {
    upgradeLocalStorageSchema();
  }, []);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATS);
      return saved ? JSON.parse(saved) : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all new fields exist
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [currentMode, setMode] = useState<GameMode>('precision');
  const [selectedLanguage, setLanguage] = useState<Language>('id');
  const [selectedDifficulty, setDifficulty] = useState<Difficulty>('medium');
  const [selectedDrill, setDrill] = useState<DrillType>('home_row');

  const maxHearts = settings.zenMode ? 999 : settings.maxHearts;
  const [activeHearts, setActiveHearts] = useState<number>(maxHearts);

  const [lastSessionResult, setLastSessionResult] = useState<SessionResult | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sync sound engine
  useEffect(() => {
    soundEngine.setVolume(settings.soundVolume);
    soundEngine.setMuted(settings.soundProfile === 'silent');
  }, [settings.soundVolume, settings.soundProfile]);

  // Persist Profile
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
    } catch (e) {
      console.error(e);
    }
  }, [userProfile]);

  // Persist Stats
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(userStats));
    } catch (e) {
      console.error(e);
    }
  }, [userStats]);

  // Persist Settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  // Streak verification on load
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = userStats.lastActiveDate;

    if (lastDate) {
      const last = new Date(lastDate);
      const now = new Date(today);
      const diffTime = Math.abs(now.getTime() - last.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        // Streak broken
        setUserStats((prev) => ({
          ...prev,
          currentStreak: 1,
          lastActiveDate: today,
          todayMinutesPracticed: 0,
        }));
      } else if (diffDays === 1) {
        // New day! Reset today's practice minutes
        setUserStats((prev) => ({
          ...prev,
          todayMinutesPracticed: 0,
          lastActiveDate: today,
        }));
      }
    }
  }, []);

  const updateProfile = (profile: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...profile }));
  };

  const completeOnboarding = (profile: Partial<UserProfile>, initialAccuracy: number) => {
    const updated: UserProfile = {
      ...userProfile,
      ...profile,
      initialAccuracy,
      onboardingCompleted: true,
    };
    setUserProfile(updated);
    setUserStats((prev) => ({
      ...prev,
      overallAccuracy: initialAccuracy,
      bestAccuracy: initialAccuracy,
      xp: 200,
    }));
  };

  const resetOnboarding = () => {
    setUserProfile((prev) => ({ ...prev, onboardingCompleted: false }));
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.zenMode !== undefined || newSettings.maxHearts !== undefined) {
        const newMaxHearts = updated.zenMode ? 999 : (updated.maxHearts || 3);
        setActiveHearts(newMaxHearts);
      }
      return updated;
    });
  };

  const loseHeart = (): boolean => {
    if (settings.zenMode) return false;
    const remaining = Math.max(0, activeHearts - 1);
    setActiveHearts(remaining);
    soundEngine.playHeartLost();
    return remaining === 0;
  };

  const resetHearts = () => {
    setActiveHearts(settings.zenMode ? 999 : settings.maxHearts);
  };

  const recordSessionResult = async (result: SessionResult) => {
    setLastSessionResult(result);
    setIsResultModalOpen(true);

    const today = new Date().toISOString().split('T')[0];
    const sessionMins = Math.max(0.1, Math.round((result.timeSpentSeconds / 60) * 10) / 10);

    // Calculate XP
    const baseXP = Math.round(result.accuracy * 2);
    const bonusFlawless = result.backspaceCount === 0 && result.errorCount === 0 ? 100 : 0;
    const xpGained = baseXP + bonusFlawless;

    setUserStats((prev) => {
      const newTotalSessions = prev.totalSessions + 1;
      const newTotalChars = prev.totalCharactersTyped + result.totalStrokes;
      const newTotalErrors = prev.totalErrors + result.errorCount;
      const newTotalBackspaces = prev.totalBackspaces + result.backspaceCount;
      const newOverallAcc =
        Math.round(
          ((prev.overallAccuracy * prev.totalSessions + result.accuracy) / newTotalSessions) * 10
        ) / 10;
      const newBestAcc = Math.max(prev.bestAccuracy, result.accuracy);
      const newTotalMins = Math.round((prev.totalTimeMinutes + sessionMins) * 10) / 10;
      const newTodayMins = Math.round((prev.todayMinutesPracticed + sessionMins) * 10) / 10;

      // Update streaks
      let newStreak = prev.currentStreak;
      if (prev.lastActiveDate !== today) {
        newStreak += 1;
      }
      const newLongestStreak = Math.max(prev.longestStreak, newStreak);

      // Mistakes tracking
      const newKeyMistakes = { ...prev.keyMistakeCount };
      Object.entries(result.mistakesByKey).forEach(([key, count]) => {
        newKeyMistakes[key] = (newKeyMistakes[key] || 0) + count;
      });

      const newXP = prev.xp + xpGained;
      const newLevel = Math.floor(newXP / 500) + 1;

      return {
        ...prev,
        totalSessions: newTotalSessions,
        totalCharactersTyped: newTotalChars,
        totalErrors: newTotalErrors,
        totalBackspaces: newTotalBackspaces,
        overallAccuracy: newOverallAcc,
        bestAccuracy: newBestAcc,
        totalTimeMinutes: newTotalMins,
        todayMinutesPracticed: newTodayMins,
        lastActiveDate: today,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        keyMistakeCount: newKeyMistakes,
        xp: newXP,
        level: newLevel,
      };
    });

    // Auto submit to leaderboard if passed
    if (result.passed && result.accuracy >= 70) {
      submitScoreToLeaderboard({
        user_name: userProfile.name,
        avatar: userProfile.avatar,
        accuracy: result.accuracy,
        score: result.score,
        mode: result.mode,
        language: result.language,
        difficulty: result.difficulty,
        backspaces: result.backspaceCount,
        wpm: result.wpm,
      }).catch((e) => console.warn('Leaderboard submit failed', e));
    }
  };

  const openResultModal = () => setIsResultModalOpen(true);
  const closeResultModal = () => setIsResultModalOpen(false);

  return (
    <AppContext.Provider
      value={{
        userProfile,
        userStats,
        settings,
        currentMode,
        selectedLanguage,
        selectedDifficulty,
        selectedDrill,
        activeHearts,
        maxHearts,
        lastSessionResult,
        isResultModalOpen,
        isAnalyticsModalOpen,
        isSettingsModalOpen,
        isProfileModalOpen,
        updateProfile,
        completeOnboarding,
        updateSettings,
        setMode,
        setLanguage,
        setDifficulty,
        setDrill,
        recordSessionResult,
        loseHeart,
        resetHearts,
        openResultModal,
        closeResultModal,
        setIsAnalyticsModalOpen,
        setIsSettingsModalOpen,
        setIsProfileModalOpen,
        resetOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
