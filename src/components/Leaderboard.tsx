import React, { useEffect, useState } from 'react';
import {
  Award,
  Crown,
  EyeOff,
  Flame,
  Globe,
  Keyboard,
  RefreshCw,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../lib/audio';
import { checkSupabaseConnection, fetchLeaderboardScores } from '../lib/supabase';
import { LeaderboardEntry } from '../types';

export const Leaderboard: React.FC = () => {
  const { userProfile } = useApp();
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<string>('all');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');

  const loadScores = async (mode: string = filterMode) => {
    setIsLoading(true);
    
    // Check Supabase connection status
    const connected = await checkSupabaseConnection();
    setIsOnline(connected);
    
    // Pass mode directly - filtering is done in processLeaderboardData in supabase.ts
    const data = await fetchLeaderboardScores(mode === 'all' ? undefined : mode);
    
    setScores(data);
    setLastUpdateTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    setIsLoading(false);
  };

  useEffect(() => {
    loadScores(filterMode);
    
    // Auto-refresh leaderboard every 10 seconds to show latest scores
    const refreshInterval = setInterval(() => {
      loadScores(filterMode);
    }, 10000);
    
    return () => clearInterval(refreshInterval);
  }, [filterMode]);

  return (
    <div id="leaderboard-view" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header & Filter */}
      <div className="p-6 rounded-[32px] bg-[#0f0f12]/95 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Trophy className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Global Leaderboard
            </h2>
            {!isLoading && (
              <div className="flex items-center gap-1.5 ml-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-amber-400'} animate-pulse`} />
                <span className="text-[10px] text-slate-400 font-mono">
                  {isOnline ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isOnline 
              ? filterMode === 'all'
                ? '🌐 Cumulative total points from all modes • Best overall typists'
                : '🌐 Highest single score in this mode • Pure skill ranking'
              : filterMode === 'all'
                ? '💾 Showing cumulative local scores • Connect to see global rankings'
                : '💾 Showing best local scores • Connect to see global rankings'
            }
          </p>
          {lastUpdateTime && (
            <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
              Last updated: {lastUpdateTime}
            </p>
          )}
        </div>

        {/* Mode Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5">
          <button
            type="button"
            onClick={() => {
              soundEngine.playThock();
              setFilterMode('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Modes
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playThock();
              setFilterMode('blind');
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterMode === 'blind'
                ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" /> Blind Mode
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playThock();
              setFilterMode('precision');
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterMode === 'precision'
                ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" /> Precision Mode
          </button>

          <button
            type="button"
            onClick={() => loadScores(filterMode)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="rounded-[32px] bg-[#0f0f12]/95 border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 mx-auto border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs">Fetching verified accuracy rankings...</p>
          </div>
        ) : scores.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="text-5xl mb-3">🏆</div>
            <p className="text-base font-semibold text-white">No records found for this mode yet.</p>
            <p className="text-xs">Be the first to claim #1 on the global leaderboard!</p>
            <p className="text-xs text-slate-500 mt-4">
              Complete a typing session with 70%+ accuracy to appear here
            </p>
            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-xs text-blue-300 font-semibold mb-1">💡 Scoring System</p>
              <p className="text-[10px] text-slate-400">
                Easy: 1.0x • Medium: 1.3x • Hard: 1.6x • Code: 2.0x
              </p>
            </div>
            {!isOnline && (
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <p className="text-xs text-amber-400">
                  ⚠️ You're offline. Your scores are saved locally and will sync when reconnected.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/40 text-[10px] uppercase tracking-wider text-slate-500 border-b border-white/10 font-bold">
                <tr>
                  <th className="py-3.5 px-4 text-center w-14">Rank</th>
                  <th className="py-3.5 px-4 font-semibold">Typist</th>
                  <th className="py-3.5 px-4 font-semibold">Mode</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Accuracy</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Backspaces</th>
                  <th className="py-3.5 px-4 font-semibold text-right">WPM</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {scores.map((entry, index) => {
                  const isUser = entry.user_name === userProfile.name;
                  const isTop1 = index === 0;
                  const isTop2 = index === 1;
                  const isTop3 = index === 2;

                  return (
                    <tr
                      key={entry.id || index}
                      className={`transition-colors ${
                        isUser
                          ? 'bg-blue-600/10 hover:bg-blue-600/15'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      {/* Rank Medal */}
                      <td className="py-3.5 px-4 text-center font-bold font-mono">
                        {isTop1 ? (
                          <span className="text-lg">🥇</span>
                        ) : isTop2 ? (
                          <span className="text-lg">🥈</span>
                        ) : isTop3 ? (
                          <span className="text-lg">🥉</span>
                        ) : (
                          <span className="text-slate-500 text-xs">#{index + 1}</span>
                        )}
                      </td>

                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-lg overflow-hidden">
                            {entry.avatar && entry.avatar.startsWith('data:image') ? (
                              <img src={entry.avatar} alt={entry.user_name} className="w-full h-full object-cover" />
                            ) : entry.avatar && entry.avatar.startsWith('http') ? (
                              <img src={entry.avatar} alt={entry.user_name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{entry.avatar || '🎯'}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              {entry.user_name}
                              {isUser && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono font-semibold">
                                  YOU
                                </span>
                              )}
                              {entry.accuracy === 100 && (
                                <span
                                  className="text-xs"
                                  title="Flawless 100% Accuracy Master"
                                >
                                  ✨
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {new Date(entry.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Mode Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          {filterMode === 'all' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize border bg-gradient-to-r from-purple-500/15 to-blue-500/15 text-blue-300 border-blue-500/30">
                              <Trophy className="w-3 h-3" />
                              All Modes
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize border ${
                                entry.mode === 'blind'
                                  ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                                  : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                              }`}
                            >
                              {entry.mode === 'blind' ? <EyeOff className="w-3 h-3" /> : <Keyboard className="w-3 h-3" />}
                              {entry.mode}
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              entry.difficulty === 'code'
                                ? 'bg-red-500/15 text-red-300'
                                : entry.difficulty === 'hard'
                                ? 'bg-orange-500/15 text-orange-300'
                                : entry.difficulty === 'medium'
                                ? 'bg-amber-500/15 text-amber-300'
                                : 'bg-green-500/15 text-green-300'
                            }`}
                          >
                            {entry.difficulty}
                            {entry.difficulty === 'code' && ' (2.0x)'}
                            {entry.difficulty === 'hard' && ' (1.6x)'}
                            {entry.difficulty === 'medium' && ' (1.3x)'}
                            {entry.difficulty === 'easy' && ' (1.0x)'}
                          </span>
                        </div>
                      </td>

                      {/* Accuracy % */}
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-mono font-bold text-base ${
                            entry.accuracy >= 99
                              ? 'text-white'
                              : entry.accuracy >= 95
                              ? 'text-blue-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {entry.accuracy.toFixed(1)}%
                        </span>
                      </td>

                      {/* Backspaces */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400 text-xs">
                        {entry.backspaces || 0}
                      </td>

                      {/* WPM */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400 text-xs">
                        {entry.wpm || 0} wpm
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="font-mono font-bold text-white text-sm">
                            {entry.score.toLocaleString()}
                          </span>
                          {filterMode === 'all' && (
                            <span className="text-[9px] text-slate-500 font-mono">
                              cumulative
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
