import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Flame,
  Globe,
  Heart,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../lib/audio';
import { WORD_LISTS } from '../lib/wordlists';
import { Difficulty, Language, SessionResult } from '../types';

export const BlindMode: React.FC = () => {
  const {
    userProfile,
    settings,
    activeHearts,
    selectedLanguage,
    setLanguage,
    recordSessionResult,
    loseHeart,
    resetHearts,
    isResultModalOpen,
    isAnalyticsModalOpen,
    isSettingsModalOpen,
    isProfileModalOpen,
  } = useApp();

  // Target Text & State
  const [targetText, setTargetText] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [charStatuses, setCharStatuses] = useState<('correct' | 'error' | 'pending')[]>([]);

  // Blind Curtain State (Conceals text)
  const [isCurtainClosed, setIsCurtainClosed] = useState<boolean>(true);
  const [isHomeRowReady, setIsHomeRowReady] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Metrics
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalStrokes, setTotalStrokes] = useState<number>(0);
  const [correctStrokes, setCorrectStrokes] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [backspaceCount, setBackspaceCount] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [mistakesByKey, setMistakesByKey] = useState<Record<string, number>>({});

  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isGameFailed, setIsGameFailed] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load new phrase for blind typing
  const loadNewBlindSentence = (lang: Language = selectedLanguage) => {
    let text: string;
    
    // Check if custom text is enabled and available
    if (settings.useCustomText && settings.customText && settings.customText.trim()) {
      text = settings.customText.trim();
    } else {
      // Pick simple or medium phrases suitable for speech recitation
      const list = WORD_LISTS[lang]['easy'].concat(WORD_LISTS[lang]['medium'].slice(0, 3));
      const randomIdx = Math.floor(Math.random() * list.length);
      text = list[randomIdx];
    }

    setTargetText(text);
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
    setMaxStreak(0);
    setCurrentStreak(0);
    setMistakesByKey({});
    resetHearts();

    // Auto speak the phrase - always use Indonesian for blind mode
    speakCurrentText(text, 'id');

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const speakCurrentText = async (textToSpeak: string = targetText, lang: Language = 'id') => {
    setIsSpeaking(true);
    await soundEngine.speakText(textToSpeak, lang, settings.ttsRate, settings.ttsPitch);
    setIsSpeaking(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    loadNewBlindSentence(selectedLanguage);
  }, [selectedLanguage, settings.useCustomText, settings.customText]);

  const anyModalOpen =
    isResultModalOpen || isAnalyticsModalOpen || isSettingsModalOpen || isProfileModalOpen;

  // Process keystroke for blind typing
  const processKeyInput = (key: string) => {
    if (isGameOver || isGameFailed || anyModalOpen) return;

    // Hotkey: Tab to replay audio
    if (key === 'Tab') {
      speakCurrentText();
      return;
    }

    if (key === 'Escape') {
      loadNewBlindSentence();
      return;
    }

    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(key)) {
      return;
    }

    if (!startTime) {
      setStartTime(Date.now());
    }

    // Backspace
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
      const expectedChar = targetText[currentIndex];
      setTotalStrokes((prev) => prev + 1);

      const isMatch = key === expectedChar;

      if (isMatch) {
        // Correct Mechanical Clack
        soundEngine.playKeyStroke(settings.soundProfile);
        setCorrectStrokes((prev) => prev + 1);
        setCurrentStreak((prev) => {
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

        if (nextIdx >= targetText.length) {
          finishBlindSession(true);
        }
      } else {
        // ERROR CHIME: Pure Auditory Feedback for blind typists
        soundEngine.playErrorChime();
        setErrorCount((prev) => prev + 1);
        setCurrentStreak(0);

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

        if (nextIdx >= targetText.length) {
          finishBlindSession(true);
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
    targetText,
    charStatuses,
    typedChars,
    startTime,
    settings,
    totalStrokes,
    correctStrokes,
    errorCount,
    backspaceCount,
    currentStreak,
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

  const finishBlindSession = (passed: boolean) => {
    const end = Date.now();
    setIsGameOver(true);

    const timeSpent = startTime ? Math.max(1, Math.round((end - startTime) / 1000)) : 1;
    const rawAcc =
      totalStrokes > 0 ? Math.round((correctStrokes / totalStrokes) * 1000) / 10 : 100;
    const backspacePenalty = settings.strictBackspaceMode ? backspaceCount * 0.4 : 0;
    const finalAccuracy = Math.max(0, Math.min(100, Math.round((rawAcc - backspacePenalty) * 10) / 10));

    const minutes = timeSpent / 60;
    const wpm = Math.round(correctStrokes / 5 / minutes) || 0;
    const cpm = Math.round(correctStrokes / minutes) || 0;

    // Blind mode gets +20% score bonus for pure sensory mastery
    const baseScore = Math.round(finalAccuracy * 100);
    const comboScore = maxStreak * 30;
    const finalScore = Math.max(
      150,
      baseScore + comboScore - backspaceCount * 15 - errorCount * 30
    );

    soundEngine.playSuccessFanfare();

    const result: SessionResult = {
      id: 'blind-session-' + Date.now(),
      mode: 'blind',
      language: selectedLanguage,
      difficulty: 'medium',
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

  const liveAccuracy =
    totalStrokes > 0
      ? Math.max(
          0,
          Math.min(100, Math.round(((totalStrokes - errorCount) / totalStrokes) * 1000) / 10)
        )
      : 100;

  return (
    <div id="blind-mode-view" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Controls & Preparation */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#0f0f12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5">
          <Globe className="w-4 h-4 ml-2 text-slate-400" />
          <button
            id="blind-lang-id"
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
            id="blind-lang-en"
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

        {/* Audio Replay & Curtain Toggle */}
        <div className="flex items-center gap-2">
          {/* Spoken Text Audio Replay Button */}
          <button
            id="blind-replay-audio-btn"
            type="button"
            onClick={() => speakCurrentText()}
            disabled={isSpeaking}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-blue-500/20 border-blue-400 text-blue-300 animate-pulse'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
            }`}
            title="Hotkey: Press Tab to re-listen"
          >
            <Volume2 className="w-4 h-4 text-blue-400" />
            <span>{isSpeaking ? 'Speaking...' : 'Replay Audio (Tab)'}</span>
          </button>

          {/* Curtain / Peek Toggle */}
          <button
            id="blind-curtain-toggle-btn"
            type="button"
            onClick={() => {
              soundEngine.playThock();
              setIsCurtainClosed(!isCurtainClosed);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isCurtainClosed
                ? 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            }`}
          >
            {isCurtainClosed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isCurtainClosed ? 'Blackout ON' : 'Peek Text'}</span>
          </button>

          {/* Reload Sentence */}
          <button
            id="blind-reload-btn"
            type="button"
            onClick={() => {
              soundEngine.playThock();
              loadNewBlindSentence();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all cursor-pointer"
            title="Next Phrase"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Text Indicator */}
        {settings.useCustomText && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            Mode Teks Custom
          </div>
        )}
      </div>

      {/* Tactile Positioning Instruction Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#0f0f12] to-slate-950/40 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-lg shrink-0 font-bold border border-blue-500/30 font-mono shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            F & J
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              Anchor on Home Row
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                Tactile Nub Check
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Feel the tactile nubs on <strong>F</strong> (Left Index) and <strong>J</strong> (Right Index). Close eyes and type pure auditory cues!
            </p>
          </div>
        </div>
        <button
          id="blind-home-row-anchor-btn"
          type="button"
          onClick={() => {
            soundEngine.playThock();
            setIsHomeRowReady(true);
            inputRef.current?.focus();
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            isHomeRowReady
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
          }`}
        >
          {isHomeRowReady ? '✓ Fingers Anchored' : 'Touch F & J to Start'}
        </button>
      </div>

      {/* Main Blind Workspace Container */}
      <div className="relative p-6 sm:p-8 rounded-[32px] bg-[#0f0f12]/95 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Audio Accuracy</div>
              <div className="text-3xl font-light text-white font-mono mt-0.5">{liveAccuracy}<span className="text-xl text-blue-400 font-normal">%</span></div>
            </div>
            <span className="text-xl">🧘‍♂️</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Audio Streak</div>
              <div className="text-3xl font-light text-amber-400 font-mono mt-0.5">{currentStreak}<span className="text-xl font-normal text-amber-400/80">x</span></div>
            </div>
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Audio Typos</div>
              <div className="text-3xl font-light text-red-400 font-mono mt-0.5">{errorCount}</div>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400">Chime</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Characters</div>
              <div className="text-3xl font-light text-blue-400 font-mono mt-0.5">
                {currentIndex}<span className="text-lg text-slate-500 font-normal">/{targetText.length}</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">Strokes</span>
          </div>
        </div>

        {/* Hidden Input field */}
        <input
          ref={inputRef}
          id="blind-hidden-input"
          type="text"
          value=""
          onChange={() => {}}
          className="opacity-0 fixed -top-40 -left-40 w-1 h-1 pointer-events-none"
          tabIndex={-1}
          aria-hidden="true"
        />

        {/* Blind Typing Stage */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="relative min-h-[180px] p-8 rounded-2xl bg-black/60 border border-white/10 flex flex-col justify-center items-center text-center cursor-text select-none overflow-hidden"
        >
          {isCurtainClosed ? (
            /* Blackout / Blindfold Curtain */
            <div className="space-y-4 py-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl text-blue-400 shadow-inner">
                🙈
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-white tracking-tight">
                  Eyes Closed • Listen & Type
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Type each spoken letter from memory. Wrong strokes trigger an instant{' '}
                  <strong className="text-red-400">Error Chime</strong> sound.
                </p>
              </div>

              {/* Typed Progress Dots */}
              <div className="flex items-center justify-center gap-1.5 max-w-xs mx-auto pt-2 flex-wrap">
                {targetText.split('').map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i < currentIndex
                        ? charStatuses[i] === 'correct'
                          ? 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]'
                          : 'bg-red-500'
                        : i === currentIndex
                        ? 'bg-blue-400 animate-ping'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Revealed Text (When peek mode is active) */
            <div className="font-mono text-xl sm:text-2xl leading-relaxed text-left w-full">
              {targetText.split('').map((char, index) => {
                const status = charStatuses[index];
                const isCurrent = index === currentIndex;

                let styleClass = 'text-slate-600';
                if (status === 'correct') styleClass = 'text-white font-medium';
                else if (status === 'error') styleClass = 'text-red-300 bg-red-500/30 rounded px-0.5 underline';

                return (
                  <span
                    key={index}
                    className={`${styleClass} ${
                      isCurrent ? 'bg-blue-500/20 text-white rounded px-0.5 ring-2 ring-blue-500' : ''
                    }`}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                );
              })}
            </div>
          )}

          {/* Bottom Progress Line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
            <div
              className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] transition-all duration-100"
              style={{ width: `${(currentIndex / (targetText.length || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Audio helper tips */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono text-[11px]">
              TAB
            </span>
            <span>Replay audio voice</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono text-[11px]">
              BACKSPACE
            </span>
            <span>Correct typo with audio feedback</span>
          </div>
        </div>

        {/* Failed Game Overlay */}
        {isGameFailed && (
          <div className="absolute inset-0 bg-[#0a0a0c]/95 rounded-[32px] flex flex-col items-center justify-center p-6 text-center z-20 backdrop-blur-xl space-y-5 border border-red-500/20">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center text-3xl shadow-lg shadow-red-500/20">
              💔
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-bold text-white tracking-tight">Auditory Memory Failed</h3>
              <p className="text-sm text-slate-400 max-w-md">
                You lost all 3 hearts. In Blind Mode, take a deep breath, press Tab to hear the
                phrase again, and type steadily.
              </p>
            </div>
            <button
              id="blind-fail-retry-btn"
              type="button"
              onClick={() => loadNewBlindSentence()}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs uppercase tracking-widest shadow-xl transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
