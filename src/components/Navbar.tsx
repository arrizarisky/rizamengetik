import React from 'react';
import {
  BarChart3,
  Flame,
  Heart,
  Keyboard,
  Settings as SettingsIcon,
  Trophy,
  Volume2,
  Zap,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../lib/audio';
import { GameMode, SoundSwitchType } from '../types';
import { AvatarDisplay } from '../lib/avatarUtils';

export const Navbar: React.FC = () => {
  const {
    userProfile,
    userStats,
    settings,
    currentMode,
    activeHearts,
    maxHearts,
    setMode,
    updateSettings,
    setIsAnalyticsModalOpen,
    setIsSettingsModalOpen,
    setIsProfileModalOpen,
  } = useApp();

  const handleSoundCycle = () => {
    const profiles: SoundSwitchType[] = ['thock', 'clicky', 'creamy', 'silent'];
    const nextIdx = (profiles.indexOf(settings.soundProfile) + 1) % profiles.length;
    const nextProfile = profiles[nextIdx];
    updateSettings({ soundProfile: nextProfile });
    soundEngine.playKeyStroke(nextProfile);
  };

  const navModes: { id: GameMode; label: string; icon: React.ReactNode }[] = [
    { id: 'precision', label: 'Precision Mode', icon: <Keyboard className="w-4 h-4" /> },
    { id: 'blind', label: 'Blind Mode', icon: <EyeOff className="w-4 h-4" /> },
    { id: 'drills', label: 'Finger Drills', icon: <Zap className="w-4 h-4" /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
  ];

  const goalPercent = Math.min(
    100,
    Math.round((userStats.todayMinutesPracticed / (userProfile.dailyGoalMinutes || 10)) * 100)
  );

  return (
    <header id="main-navbar" className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0f0f12]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <button
            id="navbar-brand-logo"
            type="button"
            onClick={() => setMode('precision')}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <img
              src="assets/Logo.png"
              alt="BlindType Logo"
              className="w-8 h-8 rounded-lg group-hover:scale-105 transition-transform object-cover"
            />
            <div>
              <div className="flex items-center gap-2 font-semibold text-lg tracking-tight text-white">
                BlindType
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                  Acc-First
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Center Mode Switcher Tabs */}
        <nav id="nav-mode-selector" className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          {navModes.map((m) => {
            const isActive = currentMode === m.id;
            return (
              <button
                key={m.id}
                id={`nav-tab-${m.id}`}
                type="button"
                title={m.label}
                onClick={() => {
                  soundEngine.playThock();
                  setMode(m.id);
                }}
                className={`flex items-center justify-center p-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {m.icon}
              </button>
            );
          })}
        </nav>

        {/* Right Gamification and User Status */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Daily Streak Indicator */}
          <div
            id="streak-badge-tracker"
            title={`Active Streak: ${userStats.currentStreak} days`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-orange-400 text-xs font-bold font-mono"
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>{userStats.currentStreak}D</span>
          </div>

          {/* Health Hearts */}
          <div
            id="health-hearts-container"
            title={settings.zenMode ? 'Zen Mode: Unlimited Hearts' : `${activeHearts} Lives Remaining`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-red-400 text-xs font-mono font-bold"
          >
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>{settings.zenMode ? '∞' : `${activeHearts}/${maxHearts}`}</span>
          </div>

          {/* Daily Practice Target Bar */}
          <div
            id="daily-goal-progress"
            title={`Today: ${userStats.todayMinutesPracticed}m / ${userProfile.dailyGoalMinutes}m target (${goalPercent}%)`}
            className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs"
          >
            <div className="text-right">
              <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] rounded-full transition-all"
                  style={{ width: `${goalPercent}%` }}
                />
              </div>
            </div>
            <span className="font-mono text-slate-300 text-[11px] font-semibold">
              {userStats.todayMinutesPracticed}/{userProfile.dailyGoalMinutes}m
            </span>
          </div>

          {/* Switch Sound Switcher */}
          <button
            id="sound-switcher-btn"
            type="button"
            onClick={handleSoundCycle}
            title={`Switch Sound: ${settings.soundProfile.toUpperCase()} (Click to change)`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 transition-all cursor-pointer"
          >
            <Volume2 className={`w-3.5 h-3.5 ${settings.soundProfile === 'silent' ? 'text-slate-600' : 'text-blue-400'}`} />
            <span className="font-mono text-[11px] uppercase hidden xl:inline text-slate-300">
              {settings.soundProfile}
            </span>
          </button>

          {/* Analytics Modal Button */}
          <button
            id="open-analytics-btn"
            type="button"
            onClick={() => {
              soundEngine.playThock();
              setIsAnalyticsModalOpen(true);
            }}
            title="Muscle Memory Analytics"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          {/* Settings Modal Button */}
          <button
            id="open-settings-btn"
            type="button"
            onClick={() => {
              soundEngine.playThock();
              setIsSettingsModalOpen(true);
            }}
            title="Settings"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* User Profile Avatar Pill */}
          <button
            id="open-profile-btn"
            type="button"
            onClick={() => {
              soundEngine.playThock();
              setIsProfileModalOpen(true);
            }}
            title={`${userProfile.name} - Level ${userStats.level}`}
            className="flex items-center gap-2 p-1 pl-1 pr-3 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm"
          >
            <AvatarDisplay userProfile={userProfile} size="small" />
            <span className="hidden sm:inline max-w-[70px] truncate">{userProfile.name}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/30 font-mono text-blue-200">
              Lv.{userStats.level}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Mode Tabs (visible on small screens) */}
      <div className="flex md:hidden border-t border-white/5 px-3 py-2 bg-[#0a0a0c] overflow-x-auto gap-1.5">
        {navModes.map((m) => {
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              title={m.label}
              onClick={() => {
                soundEngine.playThock();
                setMode(m.id);
              }}
              className={`flex items-center justify-center p-2.5 rounded-full text-xs font-medium ${
                isActive
                  ? 'bg-white text-black font-bold'
                  : 'text-slate-400 hover:text-slate-200 bg-white/5 border border-white/10'
              }`}
            >
              {m.icon}
            </button>
          );
        })}
      </div>
    </header>
  );
};
