import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronRight,
  Flame,
  Heart,
  Layers,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../lib/audio';

export const SessionResultModal: React.FC = () => {
  const {
    lastSessionResult,
    isResultModalOpen,
    closeResultModal,
    setMode,
    setDrill,
  } = useApp();

  useEffect(() => {
    if (isResultModalOpen && lastSessionResult && lastSessionResult.accuracy >= 95) {
      // Trigger festive celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
      });
    }
  }, [isResultModalOpen, lastSessionResult]);

  if (!isResultModalOpen || !lastSessionResult) return null;

  const {
    mode,
    accuracy,
    rawAccuracy,
    score,
    wpm,
    totalStrokes,
    correctStrokes,
    errorCount,
    backspaceCount,
    timeSpentSeconds,
    streakBonus,
    mistakesByKey,
    passed,
  } = lastSessionResult;

  const isFlawless = errorCount === 0 && backspaceCount === 0;
  const mistypedKeys = Object.keys(mistakesByKey);

  return (
    <div
      id="session-result-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-lg bg-[#0f0f12] border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          id="close-result-modal-btn"
          type="button"
          onClick={() => {
            soundEngine.playThock();
            closeResultModal();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div
            className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center text-3xl shadow-xl ${
              isFlawless
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-blue-500/20'
                : accuracy >= 95
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isFlawless ? '👑' : accuracy >= 95 ? '🎯' : '🦾'}
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
              {mode === 'blind' ? 'Blind Mode' : mode === 'drills' ? 'Practice Drill' : 'Precision Mode'} Complete
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
              {isFlawless ? 'Flawless 100% Run!' : accuracy >= 95 ? 'Exceptional Accuracy!' : 'Session Completed'}
            </h2>
          </div>
        </div>

        {/* Score & Accuracy Hero */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center space-y-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Final Accuracy Score</div>
          <div
            className={`text-4xl sm:text-5xl font-mono font-light tracking-tight ${
              accuracy >= 98
                ? 'text-white'
                : accuracy >= 90
                ? 'text-blue-400'
                : 'text-amber-400'
            }`}
          >
            {accuracy.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {score.toLocaleString()} Points • {timeSpentSeconds}s Duration
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Backspaces</div>
            <div className={`text-base font-mono font-bold ${backspaceCount === 0 ? 'text-white' : 'text-amber-400'}`}>
              {backspaceCount}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Typos</div>
            <div className={`text-base font-mono font-bold ${errorCount === 0 ? 'text-white' : 'text-red-400'}`}>
              {errorCount}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Clean Streak</div>
            <div className="text-base font-mono font-bold text-amber-400">
              {streakBonus}x
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Speed</div>
            <div className="text-base font-mono font-bold text-blue-400">
              {wpm} <span className="text-[10px] text-slate-500 font-normal">WPM</span>
            </div>
          </div>
        </div>

        {/* Muscle Memory Weak Keys Insight */}
        {mistypedKeys.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                Muscle Memory Weak Spots
              </span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playThock();
                  closeResultModal();
                  setDrill('custom');
                  setMode('drills');
                }}
                className="text-[11px] font-bold text-red-400 hover:text-red-300 underline cursor-pointer"
              >
                Drill These Keys →
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {mistypedKeys.map((key) => (
                <span
                  key={key}
                  className="px-2 py-0.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 font-mono text-xs font-bold"
                >
                  '{key === ' ' ? 'SPACE' : key}': {mistakesByKey[key]}x miss
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            id="result-modal-leaderboard-btn"
            type="button"
            onClick={() => {
              soundEngine.playThock();
              closeResultModal();
              setMode('leaderboard');
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            Leaderboard
          </button>

          <button
            id="result-modal-continue-btn"
            type="button"
            onClick={() => {
              soundEngine.playThock();
              closeResultModal();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            Next Exercise
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
