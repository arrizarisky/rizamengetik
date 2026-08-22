import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Code,
  Flame,
  Globe,
  Heart,
  HelpCircle,
  Layers,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../lib/audio';
import { WORD_LISTS, wordListManager } from '../lib/wordlists';
import { Difficulty, Language, SessionResult } from '../types';
import { VirtualKeyboard } from './VirtualKeyboard';

export const PrecisionMode: React.FC = () => {
  const {
    userProfile,
    settings,
    activeHearts,
    selectedLanguage,
    selectedDifficulty,
    setLanguage,
    setDifficulty,
    recordSessionResult,
    loseHeart,
    resetHearts,
    isResultModalOpen,
    isAnalyticsModalOpen,
    isSettingsModalOpen,
    isProfileModalOpen,
  } = useApp();

  // Target text & typing state
  const [targetText, setTargetText] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [charStatuses, setCharStatuses] = useState<('correct' | 'error' | 'pending')[]>([]);

  // Session metrics
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isGameFailed, setIsGameFailed] = useState<boolean>(false);

  // Accuracy & error tracking
  const [totalStrokes, setTotalStrokes] = useState<number>(0);
  const [correctStrokes, setCorrectStrokes] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [backspaceCount, setBackspaceCount] = useState<number>(0);
  const [streakCombo, setStreakCombo] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [mistakesByKey, setMistakesByKey] = useState<Record<string, number>>({});
  const [lastPressedKey, setLastPressedKey] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize new phrase
  const loadNewSentence = async (lang: Language = selectedLanguage, diff: Difficulty = selectedDifficulty) => {
    let chosen: string;
    
    // Check if custom text is enabled and available
    if (settings.useCustomText && settings.customText && settings.customText.trim()) {
      chosen = settings.customText.trim();
    } else {
      try {
        // Try to get AI-generated texts first
        const generatedList = await wordListManager.getWordList(lang, diff);
        const randomIndex = Math.floor(Math.random() * generatedList.length);
        chosen = generatedList[randomIndex];
      } catch (error) {
        console.error('Failed to load word list, using fallback:', error);
        // Fallback to static lists
        const list = WORD_LISTS[lang][diff] || WORD_LISTS['en']['easy'];
        const randomIndex = Math.floor(Math.random() * list.length);
        chosen = list[randomIndex];
      }
    }

    setTargetText(chosen);
    setCurrentIndex(0);
    setTypedChars([]);
    setCharStatuses(new Array(chosen.length).fill('pending'));
    setStartTime(null);
    setEndTime(null);
    setIsSessionActive(false);
    setIsGameOver(false);
    setIsGameFailed(false);
    setTotalStrokes(0);
    setCorrectStrokes(0);
    setErrorCount(0);
    setBackspaceCount(0);
    setStreakCombo(0);
    setMaxStreak(0);
    setMistakesByKey({});
    setLastPressedKey('');
    resetHearts();

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Load when language or difficulty changes
  useEffect(() => {
    loadNewSentence(selectedLanguage, selectedDifficulty);
  }, [selectedLanguage, selectedDifficulty, settings.useCustomText, settings.customText]);

  const anyModalOpen =
    isResultModalOpen || isAnalyticsModalOpen || isSettingsModalOpen || isProfileModalOpen;

  // Process a key stroke (from physical keyboard or virtual keyboard)
  const processKeyInput = (key: string) => {
    if (isGameOver || isGameFailed || anyModalOpen) return;

    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(key)) {
      return;
    }

    if (key === 'Escape') {
      loadNewSentence();
      return;
    }

    setLastPressedKey(key);

    // Start session timer on first stroke
    if (!startTime) {
      setStartTime(Date.now());
      setIsSessionActive(true);
    }

    // Handle Backspace
    if (key === 'Backspace') {
      soundEngine.playBackspaceSound();
      setBackspaceCount((prev) => prev + 1);

      if (currentIndex > 0) {
        const prevIdx = currentIndex - 1;
        setCurrentIndex(prevIdx);

        const newStatuses = [...charStatuses];
        newStatuses[prevIdx] = 'pending';
        setCharStatuses(newStatuses);

        const newTyped = [...typedChars];
        newTyped.pop();
        setTypedChars(newTyped);
      }
      return;
    }

    // Only accept single character keys
    if (key.length === 1) {
      const expectedChar = targetText[currentIndex];
      setTotalStrokes((prev) => prev + 1);

      const isMatch = key === expectedChar;

      if (isMatch) {
        // Correct Key
        soundEngine.playKeyStroke(settings.soundProfile);
        setCorrectStrokes((prev) => prev + 1);
        setStreakCombo((prev) => {
          const next = prev + 1;
          setMaxStreak((m) => Math.max(m, next));
          return next;
        });

        const newStatuses = [...charStatuses];
        newStatuses[currentIndex] = 'correct';
        setCharStatuses(newStatuses);

        const newTyped = [...typedChars, key];
        setTypedChars(newTyped);

        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);

        // Completed sentence!
        if (nextIdx >= targetText.length) {
          finishSession(true);
        }
      } else {
        // Error / Typo
        if (settings.enableErrorChime) {
          soundEngine.playErrorChime();
        }
        setErrorCount((prev) => prev + 1);
        setStreakCombo(0); // Reset combo

        // Visual error shake
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);

        // Record key mistake for muscle memory analytics
        setMistakesByKey((prev) => ({
          ...prev,
          [expectedChar]: (prev[expectedChar] || 0) + 1,
        }));

        // Lose a Heart
        const isDead = loseHeart();
        if (isDead) {
          handleSessionFailed();
          return;
        }

        const newStatuses = [...charStatuses];
        newStatuses[currentIndex] = 'error';
        setCharStatuses(newStatuses);

        const newTyped = [...typedChars, key];
        setTypedChars(newTyped);

        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);

        if (nextIdx >= targetText.length) {
          finishSession(true);
        }
      }
    }
  };

  // Global window keydown listener for instant interactivity without needing manual focus
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input or textarea (like in modals)
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
        target !== inputRef.current
      ) {
        return;
      }

      if (e.key === ' ' || e.key === 'Backspace' || e.key === 'Tab') {
        if (!anyModalOpen && !isGameOver && !isGameFailed) {
          e.preventDefault();
        }
      }

      processKeyInput(e.key);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    anyModalOpen,
    isGameOver,
    isGameFailed,
    currentIndex,
    targetText,
    charStatuses,
    typedChars,
    startTime,
    settings,
    totalStrokes,
    correctStrokes,
    errorCount,
    backspaceCount,
    streakCombo,
    maxStreak,
  ]);

  // Keep hidden input focused on click anywhere (supports mobile virtual keyboard)
  useEffect(() => {
    const handleClickAnywhere = () => {
      if (!isGameOver && !isGameFailed && !anyModalOpen) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener('click', handleClickAnywhere);
    return () => window.removeEventListener('click', handleClickAnywhere);
  }, [isGameOver, isGameFailed, anyModalOpen]);

  const handleSessionFailed = () => {
    setIsGameFailed(true);
    setIsSessionActive(false);
    soundEngine.playHeartLost();
  };

  const finishSession = (passed: boolean) => {
    const end = Date.now();
    setEndTime(end);
    setIsGameOver(true);
    setIsSessionActive(false);

    const timeSpent = startTime ? Math.max(1, Math.round((end - startTime) / 1000)) : 1;

    // Accuracy calculations
    const rawAcc =
      totalStrokes > 0 ? Math.round((correctStrokes / totalStrokes) * 1000) / 10 : 100;

    // Strict accuracy penalty formula
    const backspacePenalty = settings.strictBackspaceMode ? backspaceCount * 0.3 : 0;
    const finalAccuracy = Math.max(0, Math.min(100, Math.round((rawAcc - backspacePenalty) * 10) / 10));

    // WPM calculation (standard: 5 chars = 1 word)
    const minutes = timeSpent / 60;
    const wpm = Math.round(correctStrokes / 5 / minutes) || 0;
    const cpm = Math.round(correctStrokes / minutes) || 0;

    // Difficulty multiplier
    const difficultyMultipliers: Record<Difficulty, number> = {
      easy: 1.0,
      medium: 1.3,
      hard: 1.6,
      code: 2.0,
    };
    const difficultyMultiplier = difficultyMultipliers[selectedDifficulty] || 1.0;

    // Accuracy-First Score
    const baseScore = Math.round(finalAccuracy * 80);
    const comboScore = maxStreak * 25;
    const backspaceDeduction = backspaceCount * 15;
    const errorDeduction = errorCount * 30;
    const rawScore = Math.max(100, baseScore + comboScore - backspaceDeduction - errorDeduction);
    const finalScore = Math.round(rawScore * difficultyMultiplier);

    soundEngine.playSuccessFanfare();

    const result: SessionResult = {
      id: 'session-' + Date.now(),
      mode: 'precision',
      language: selectedLanguage,
      difficulty: selectedDifficulty,
      accuracy: finalAccuracy,
      rawAccuracy: rawAcc,
      wpm,
      cpm,
      score: finalScore,
      totalStrokes,
      correctStrokes,
      errorCount,
      backspaceCount,
      timeSpentSeconds: timeSpent,
      completedAt: new Date().toISOString(),
      heartsRemaining: activeHearts,
      passed,
      mistakesByKey,
      streakBonus: maxStreak,
      targetTextLength: targetText.length,
    };

    recordSessionResult(result);
  };

  // Compute live accuracy gauge
  const liveAccuracy =
    totalStrokes > 0
      ? Math.max(
          0,
          Math.min(100, Math.round(((totalStrokes - errorCount) / totalStrokes) * 1000) / 10)
        )
      : 100;

  const nextChar = targetText[currentIndex] || '';

  return (
    <div id="precision-mode-view" className="w-full max-w-5xl mx-auto space-y-6">
      {/* Mode Controls & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#0f0f12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5">
          <Globe className="w-4 h-4 ml-2 text-slate-400" />
          <button
            id="lang-btn-id"
            type="button"
            onClick={() => setLanguage('id')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedLanguage === 'id'
                ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bahasa Indonesia
          </button>
          <button
            id="lang-btn-en"
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedLanguage === 'en'
                ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            English
          </button>
        </div>

        {/* Difficulty Levels */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/5">
          {(['easy', 'medium', 'hard', 'code'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              id={`diff-btn-${diff}`}
              type="button"
              onClick={() => setDifficulty(diff)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                selectedDifficulty === diff
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {diff === 'code' ? 'Code / Syntax' : diff}
            </button>
          ))}
        </div>

        {/* Reset / New phrase button */}
        <button
          id="precision-reload-sentence-btn"
          type="button"
          onClick={() => {
            soundEngine.playThock();
            loadNewSentence();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {settings.useCustomText ? 'Reset (Esc)' : 'New Text (Esc)'}
        </button>

        {/* Custom Text Indicator */}
        {settings.useCustomText && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            Custom Text Mode
          </div>
        )}
      </div>

      {/* Main Workspace Card */}
      <div
        ref={containerRef}
        className={`relative p-6 sm:p-8 rounded-[32px] bg-[#0f0f12]/95 border border-white/10 shadow-2xl backdrop-blur-xl transition-all ${
          isShaking ? 'animate-error-shake border-red-500/50' : ''
        }`}
      >
        {/* Top HUD: Real-time Accuracy Meter & Streak & Penalties */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {/* Live Accuracy Meter */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Live Accuracy</div>
              <div className="text-3xl font-light text-white tracking-tight mt-0.5 font-mono">
                {liveAccuracy}<span className="text-xl text-blue-400 font-normal">%</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center font-mono text-base bg-blue-500/10 text-blue-400">
              🎯
            </div>
          </div>

          {/* Clean Streak Multiplier */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Clean Streak</div>
              <div className="text-3xl font-light text-amber-400 font-mono mt-0.5">
                {streakCombo}<span className="text-xl font-normal text-amber-400/80">x</span>
              </div>
            </div>
            <Flame
              className={`w-6 h-6 ${
                streakCombo > 10 ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-600'
              }`}
            />
          </div>

          {/* Backspace Penalty */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Backspaces</div>
              <div className="text-3xl font-light text-slate-300 font-mono mt-0.5">
                {backspaceCount}
              </div>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">-15pt</span>
          </div>

          {/* Error Count */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Typos</div>
              <div className="text-3xl font-light text-red-400 font-mono mt-0.5">{errorCount}</div>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400">-30pt</span>
          </div>
        </div>

        {/* Hidden Input field capturing keystrokes */}
        <input
          ref={inputRef}
          id="precision-hidden-input"
          type="text"
          value=""
          onChange={() => {}}
          className="opacity-0 fixed -top-40 -left-40 w-1 h-1 pointer-events-none"
          tabIndex={-1}
          aria-hidden="true"
        />

        {/* Interactive Text Display */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="p-6 sm:p-8 rounded-2xl bg-black/60 border border-white/10 font-mono text-xl sm:text-2xl leading-relaxed tracking-wide min-h-[160px] select-none cursor-text transition-all relative overflow-hidden flex items-center group"
        >
          {/* Target Text with Character State Highlights */}
          <div className="flex flex-wrap items-center w-full">
            {targetText.split('').map((char, index) => {
              const status = charStatuses[index];
              const isCurrent = index === currentIndex;

              let styleClass = 'text-slate-600'; // pending
              if (status === 'correct') {
                styleClass = 'text-white font-medium';
              } else if (status === 'error') {
                styleClass = 'text-red-300 bg-red-500/30 rounded px-0.5 underline font-bold';
              }

              return (
                <span
                  key={index}
                  className={`relative inline-block transition-colors duration-75 ${styleClass} ${
                    isCurrent
                      ? 'bg-blue-500/20 text-white font-bold rounded px-0.5 ring-2 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                      : ''
                  }`}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
            <div
              className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] transition-all duration-100"
              style={{ width: `${(currentIndex / (targetText.length || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Session Failed Overlay */}
        {isGameFailed && (
          <div className="absolute inset-0 bg-[#0a0a0c]/95 rounded-[32px] flex flex-col items-center justify-center p-6 text-center z-20 backdrop-blur-xl space-y-5 border border-red-500/20">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center text-3xl shadow-lg shadow-red-500/20">
              💔
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-bold text-white tracking-tight">Out of Hearts!</h3>
              <p className="text-sm text-slate-400 max-w-md">
                You made 3 errors in this session. Remember: In BlindType, precision and calm
                pacing always beat fast rushed typing.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                id="precision-fail-retry-btn"
                type="button"
                onClick={() => loadNewSentence()}
                className="px-6 py-3 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs uppercase tracking-widest shadow-xl transition-all cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Virtual Keyboard with finger guides */}
      {settings.showVirtualKeyboard && (
        <VirtualKeyboard
          activeTargetKey={nextChar}
          lastPressedKey={lastPressedKey}
          showFingerHints={settings.showFingerGuides}
          onKeyPress={processKeyInput}
        />
      )}
    </div>
  );
};
