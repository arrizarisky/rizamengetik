import React from 'react';
import {
  Activity,
  Award,
  BarChart2,
  Calendar,
  Flame,
  PieChart,
  ShieldCheck,
  Sparkles,
  Target,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../lib/audio';

export const AnalyticsModal: React.FC = () => {
  const {
    userStats,
    userProfile,
    isAnalyticsModalOpen,
    setIsAnalyticsModalOpen,
    setDrill,
    setMode,
  } = useApp();

  if (!isAnalyticsModalOpen) return null;

  const topMistakes = (Object.entries(userStats.keyMistakeCount) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const goalPercent = Math.min(
    100,
    Math.round((userStats.todayMinutesPracticed / (userProfile.dailyGoalMinutes || 10)) * 100)
  );

  return (
    <div
      id="analytics-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl bg-[#0f0f12] border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Muscle Memory Analytics</h2>
              <p className="text-xs text-slate-400">
                Data-driven breakdown of your typing accuracy and problematic keys.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playThock();
              setIsAnalyticsModalOpen(false);
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High-level stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Overall Accuracy</div>
            <div className="text-2xl font-mono font-light text-white mt-0.5">
              {userStats.overallAccuracy.toFixed(1)}<span className="text-base text-blue-400">%</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">All-time average</div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Current Streak</div>
            <div className="text-2xl font-mono font-light text-amber-400 mt-0.5 flex items-center gap-1">
              <Flame className="w-5 h-5 fill-amber-400" />
              {userStats.currentStreak}d
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Best: {userStats.longestStreak} days
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Practice</div>
            <div className="text-2xl font-mono font-light text-blue-400 mt-0.5">
              {userStats.totalTimeMinutes.toFixed(1)}m
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {userStats.totalSessions} sessions
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Keystrokes</div>
            <div className="text-2xl font-mono font-light text-slate-200 mt-0.5">
              {userStats.totalCharactersTyped.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {userStats.totalErrors} total typos
            </div>
          </div>
        </div>

        {/* Daily Goal Progress Bar */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Today's Muscle Memory Target
            </span>
            <span className="font-mono text-blue-400 font-bold">
              {userStats.todayMinutesPracticed} / {userProfile.dailyGoalMinutes} min ({goalPercent}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] rounded-full transition-all duration-300"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
        </div>

        {/* Top Problematic Keys Heatmap */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Target className="w-4 h-4 text-red-400" />
              Top Mistyped Keys (Typo Frequency)
            </h3>
            {topMistakes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playThock();
                  setIsAnalyticsModalOpen(false);
                  setDrill('custom');
                  setMode('drills');
                }}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer"
              >
                Launch Targeted Drill →
              </button>
            )}
          </div>

          {topMistakes.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              No frequent errors recorded yet! Continue practicing to generate finger precision analytics.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {topMistakes.map(([key, count]) => (
                <div
                  key={key}
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-red-500/20 text-red-300 font-mono font-bold flex items-center justify-center border border-red-500/40 text-sm">
                      {key === ' ' ? 'SPC' : key}
                    </span>
                    <div className="text-xs text-slate-300 font-medium">Key '{key}'</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-red-400">{count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
