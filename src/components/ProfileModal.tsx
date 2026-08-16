import React, { useState } from 'react';
import {
  Award,
  Calendar,
  Check,
  Flame,
  Heart,
  Save,
  Sparkles,
  User,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../lib/audio';

const AVATAR_OPTIONS = ['🎯', '⚡', '🦉', '🦾', '🧘‍♀️', '🚀', '🔥', '🦊', '🐱', '🧠', '🎧', '💎'];

export const ProfileModal: React.FC = () => {
  const {
    userProfile,
    userStats,
    isProfileModalOpen,
    setIsProfileModalOpen,
    updateProfile,
  } = useApp();

  const [name, setName] = useState(userProfile.name);
  const [avatar, setAvatar] = useState(userProfile.avatar);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(userProfile.dailyGoalMinutes);

  if (!isProfileModalOpen) return null;

  const handleSave = () => {
    soundEngine.playThock();
    updateProfile({
      name: name.trim() || userProfile.name,
      avatar,
      dailyGoalMinutes,
    });
    setIsProfileModalOpen(false);
  };

  const nextLevelXP = userStats.level * 500;
  const currentLevelProgress = userStats.xp % 500;
  const progressPercent = Math.min(100, Math.round((currentLevelProgress / 500) * 100));

  return (
    <div
      id="profile-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-lg bg-[#0f0f12] border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Typist Profile</h2>
              <p className="text-xs text-slate-400">
                Personalize your identity and daily practice parameters.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playThock();
              setIsProfileModalOpen(false);
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level & XP card */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">{avatar}</span>
              <div>
                <div className="font-bold text-white text-base">{name}</div>
                <div className="text-xs text-blue-400 font-mono">
                  Level {userStats.level} Precision Typist
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total XP</span>
              <div className="font-mono font-bold text-white text-sm">
                {userStats.xp.toLocaleString()} XP
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Level Progress</span>
              <span className="font-mono">{currentLevelProgress} / 500 XP</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Avatar Picker */}
        <div className="space-y-2">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Choose Avatar
          </label>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setAvatar(emoji);
                  soundEngine.playThock();
                }}
                className={`text-2xl h-11 flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
                  avatar === emoji
                    ? 'bg-blue-600/20 border-blue-400 scale-105 shadow-md shadow-blue-500/20'
                    : 'bg-black/40 border-white/5 hover:border-white/20'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Nickname Input */}
        <div className="space-y-2">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Nickname
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-medium text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Daily Goal Setting */}
        <div className="space-y-2">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Daily Goal
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 15].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => {
                  setDailyGoalMinutes(mins);
                  soundEngine.playThock();
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  dailyGoalMinutes === mins
                    ? 'bg-blue-600/20 border-blue-400 text-blue-300'
                    : 'bg-black/40 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {mins} Minutes
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
};
