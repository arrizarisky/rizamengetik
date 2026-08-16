import React from 'react';
import { AnalyticsModal } from './components/AnalyticsModal';
import { BlindMode } from './components/BlindMode';
import { Leaderboard } from './components/Leaderboard';
import { Navbar } from './components/Navbar';
import { OnboardingWizard } from './components/Onboarding/OnboardingWizard';
import { PracticeDrills } from './components/PracticeDrills';
import { PrecisionMode } from './components/PrecisionMode';
import { ProfileModal } from './components/ProfileModal';
import { SessionResultModal } from './components/SessionResultModal';
import { SettingsModal } from './components/SettingsModal';
import { AppProvider, useApp } from './context/AppContext';

const MainApp: React.FC = () => {
  const { userProfile, currentMode } = useApp();

  // If user has not finished onboarding wizard, present the Duolingo-style flow
  if (!userProfile.onboardingCompleted) {
    return <OnboardingWizard />;
  }

  return (
    <div id="blindtype-app-root" className="min-h-screen flex flex-col bg-[#0a0a0c] text-slate-200 selection:bg-blue-600 selection:text-white font-sans">
      {/* Ambient background decoration */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(37,99,235,0.09),rgba(255,255,255,0))] pointer-events-none" />

      {/* Top Navbar */}
      <Navbar />

      {/* Main Mode View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10 flex flex-col justify-start">
        {currentMode === 'precision' && <PrecisionMode />}
        {currentMode === 'blind' && <BlindMode />}
        {currentMode === 'drills' && <PracticeDrills />}
        {currentMode === 'leaderboard' && <Leaderboard />}
      </main>

      {/* Footer info & Hotkey hints */}
      <footer className="w-full border-t border-white/5 bg-[#0a0a0c]/90 py-4 px-4 text-center text-xs text-slate-500 relative z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-medium">BlindType</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="hidden sm:inline text-slate-500">Precision Muscle Memory & Blind Key Typing</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="hidden sm:inline text-slate-500">Tactile Home Row (F & J)</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
            <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10"><strong className="text-slate-300">Tab:</strong> Replay Voice</span>
            <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10"><strong className="text-slate-300">Esc:</strong> Reset / Next Text</span>
          </div>
        </div>
      </footer>

      {/* Overlay Modals */}
      <SessionResultModal />
      <AnalyticsModal />
      <SettingsModal />
      <ProfileModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
