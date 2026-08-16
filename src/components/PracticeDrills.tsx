import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Flame,
  Layers,
  RotateCcw,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../lib/audio';
import { DRILLS } from '../lib/wordlists';
import { DrillType, SessionResult } from '../types';
import { VirtualKeyboard } from './VirtualKeyboard';

export const PracticeDrills: React.FC = () => {
  const {
    userProfile,
    userStats,
    settings,
    selectedDrill,
    setDrill,
    recordSessionResult,
    loseHeart,
    resetHearts,
    activeHearts,
    isResultModalOpen,
    isAnalyticsModalOpen,
    isSettingsModalOpen,
    isProfileModalOpen,
  } = useApp();

  const [drillText, setDrillText] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [charStatuses, setCharStatuses] = useState<('correct' | 'error' | 'pending')[]>([]);
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isGameFailed, setIsGameFailed] = useState<boolean>(false);

  const [totalStrokes, setTotalStrokes] = useState<number>(0);
  const [correctStrokes, setCorrectStrokes] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [backspaceCount, setBackspaceCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [lastPressedKey, setLastPressedKey] = useState<string>('');
  const [mistakesByKey, setMistakesByKey] = useState<Record<string, number>>({});

  const inputRef = useRef<HTMLInputElement>(null);

  // Generate dynamic custom drill if user chooses 'custom' (Weak Keys)
  const getDrillWords = (type: DrillType): string[] => {
    if (type === 'custom') {
      const topMistakes = (Object.entries(userStats.keyMistakeCount) as [string, number][])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([k]) => k);

      if (topMistakes.length > 0) {
        // Construct repetition patterns for weak keys
        const k1 = topMistakes[0] || 'f';
        const k2 = topMistakes[1] || 'j';
        const k3 = topMistakes[2] || 'd';
        return [
          `${k1}${k2} ${k2}${k1} ${k1}${k3}${k2} ${k2}${k3}${k1} ${k1}${k1} ${k2}${k2} ${k3}${k3} ${k1}${k2}${k3}`,
          `focus on ${k1} and ${k2} rhythm: ${k1}f ${k2}j ${k3}k ${k1}${k2} ${k2}${k1}`,
        ];
      }
      return ['fjfj dkdk slsl a;a; fa jada fall flask salad'];
    }
    return DRILLS[type].words;
  };

  const loadDrill = (type: DrillType = selectedDrill) => {
    const words = getDrillWords(type);
    const text = words[Math.floor(Math.random() * words.length)];

    setDrillText(text);
    setCurrentIndex(0);
    setTypedChars([]);
    setCharStatuses(new Array(text.length).fill('pending'));
    setStartTime(null);
    setIsGameOver(false);
    setIsGameFailed(false);
    setTotalStrokes(0);
    setCorrectStrokes(0);
    setErrorCount(0);
    setBackspaceCount(0);
    setStreak(0);
    setMaxStreak(0);
    setMistakesByKey({});
    setLastPressedKey('');
    resetHearts();

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  useEffect(() => {
    loadDrill(selectedDrill);
  }, [selectedDrill]);

  const anyModalOpen =
    isResultModalOpen || isAnalyticsModalOpen || isSettingsModalOpen || isProfileModalOpen;

  const processKeyInput = (key: string) => {
    if (isGameOver || isGameFailed || anyModalOpen) return;

    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(key)) {
      return;
    }

    if (key === 'Escape') {
      loadDrill();
      return;
    }

    setLastPressedKey(key);

    if (!startTime) {
      setStartTime(Date.now());
    }

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

    if (key.length === 1) {
      const expectedChar = drillText[currentIndex];
      setTotalStrokes((prev) => prev + 1);

      const isMatch = key === expectedChar;

      if (isMatch) {
        soundEngine.playKeyStroke(settings.soundProfile);
        setCorrectStrokes((prev) => prev + 1);
        setStreak((prev) => {
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

        if (nextIdx >= drillText.length) {
          finishDrill(true);
        }
      } else {
        if (settings.enableErrorChime) {
          soundEngine.playErrorChime();
        }
        setErrorCount((prev) => prev + 1);
        setStreak(0);

        setMistakesByKey((prev) => ({
          ...prev,
          [expectedChar]: (prev[expectedChar] || 0) + 1,
        }));

        const isDead = loseHeart();
        if (isDead) {
          setIsGameFailed(true);
          soundEngine.playHeartLost();
          return;
        }

        const newStatuses = [...charStatuses];
        newStatuses[currentIndex] = 'error';
        setCharStatuses(newStatuses);

        const newTyped = [...typedChars, key];
        setTypedChars(newTyped);

        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);

        if (nextIdx >= drillText.length) {
          finishDrill(true);
        }
      }
    }
  };

  // Global window keydown listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
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
    drillText,
    charStatuses,
    typedChars,
    startTime,
    settings,
    totalStrokes,
    correctStrokes,
    errorCount,
    backspaceCount,
    streak,
    maxStreak,
  ]);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (!isGameOver && !isGameFailed && !anyModalOpen) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [isGameOver, isGameFailed, anyModalOpen]);

  const finishDrill = (passed: boolean) => {
    const end = Date.now();
    setIsGameOver(true);

    const timeSpent = startTime ? Math.max(1, Math.round((end - startTime) / 1000)) : 1;
    const rawAcc =
      totalStrokes > 0 ? Math.round((correctStrokes / totalStrokes) * 1000) / 10 : 100;
    const finalAccuracy = Math.max(0, Math.min(100, Math.round((rawAcc - backspaceCount * 0.2) * 10) / 10));

    const minutes = timeSpent / 60;
    const wpm = Math.round(correctStrokes / 5 / minutes) || 0;
    const cpm = Math.round(correctStrokes / minutes) || 0;

    const baseScore = Math.round(finalAccuracy * 70);
    const finalScore = Math.max(80, baseScore + maxStreak * 20 - backspaceCount * 10 - errorCount * 25);

    soundEngine.playSuccessFanfare();

    const result: SessionResult = {
      id: 'drill-session-' + Date.now(),
      mode: 'drills',
      language: 'en',
      difficulty: 'easy',
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
      targetTextLength: drillText.length,
    };

    recordSessionResult(result);
  };

  const liveAccuracy =
    totalStrokes > 0
      ? Math.max(
          0,
          Math.min(100, Math.round(((totalStrokes - errorCount) / totalStrokes) * 1000) / 10)
        )
      : 100;

  const nextChar = drillText[currentIndex] || '';

  const drillTabs: { id: DrillType; label: string; icon: string }[] = [
    { id: 'home_row', label: 'Home Row (ASDF JKL;)', icon: '⚓' },
    { id: 'top_row', label: 'Top Row (QWERTY)', icon: '⬆️' },
    { id: 'bottom_row', label: 'Bottom Row (ZXCVB)', icon: '⬇️' },
    { id: 'number_row', label: 'Numbers (0-9)', icon: '🔢' },
    { id: 'symbols', label: 'Code & Symbols', icon: '⚡' },
    { id: 'custom', label: 'Weak Key Focus', icon: '🎯' },
  ];

  return (
    <div id="drills-view" className="w-full max-w-5xl mx-auto space-y-6">
      {/* Drill Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {drillTabs.map((tab) => {
          const isSelected = selectedDrill === tab.id;
          return (
            <button
              key={tab.id}
              id={`drill-tab-${tab.id}`}
              type="button"
              onClick={() => {
                soundEngine.playThock();
                setDrill(tab.id);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10'
                  : 'bg-[#0f0f12]/90 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-xl mb-1">{tab.icon}</div>
              <div
                className={`text-xs font-bold leading-snug ${
                  isSelected ? 'text-blue-300' : 'text-slate-300'
                }`}
              >
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Drill Main Stage */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#0f0f12]/95 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {DRILLS[selectedDrill].title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {DRILLS[selectedDrill].subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playThock();
              loadDrill();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 cursor-pointer transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reload Drill
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Drill Accuracy</div>
            <div className="text-3xl font-light text-white font-mono mt-0.5">{liveAccuracy}<span className="text-xl text-blue-400 font-normal">%</span></div>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Combo Streak</div>
            <div className="text-3xl font-light text-amber-400 font-mono mt-0.5">{streak}<span className="text-xl font-normal text-amber-400/80">x</span></div>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Typos</div>
            <div className="text-3xl font-light text-red-400 font-mono mt-0.5">{errorCount}</div>
          </div>
        </div>

        {/* Hidden Input */}
        <input
          ref={inputRef}
          id="drills-hidden-input"
          type="text"
          value=""
          onChange={() => {}}
          className="opacity-0 fixed -top-40 -left-40 w-1 h-1 pointer-events-none"
          tabIndex={-1}
          aria-hidden="true"
        />

        {/* Typing Display Box */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="p-6 sm:p-8 rounded-2xl bg-black/60 border border-white/10 font-mono text-xl sm:text-2xl leading-relaxed tracking-wider min-h-[140px] select-none cursor-text relative overflow-hidden flex items-center group"
        >
          <div className="flex flex-wrap items-center w-full">
            {drillText.split('').map((char, index) => {
              const status = charStatuses[index];
              const isCurrent = index === currentIndex;

              let styleClass = 'text-slate-600';
              if (status === 'correct') styleClass = 'text-white font-medium';
              else if (status === 'error') styleClass = 'text-red-300 bg-red-500/30 rounded px-0.5 underline';

              return (
                <span
                  key={index}
                  className={`inline-block transition-colors ${styleClass} ${
                    isCurrent
                      ? 'bg-blue-500/20 text-white font-bold rounded px-0.5 ring-2 ring-blue-500'
                      : ''
                  }`}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
            <div
              className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] transition-all duration-100"
              style={{ width: `${(currentIndex / (drillText.length || 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Virtual Keyboard */}
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
