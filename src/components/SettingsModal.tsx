import React, { useState } from 'react';
import {
  Check,
  Eye,
  Heart,
  Keyboard,
  RotateCcw,
  Sliders,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../lib/audio';
import { SoundSwitchType } from '../types';
import TextGeneratorSettings from './TextGeneratorSettings';

export const SettingsModal: React.FC = () => {
  const {
    settings,
    updateSettings,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    resetOnboarding,
  } = useApp();
  const [isTextGeneratorOpen, setIsTextGeneratorOpen] = useState(false);

  if (!isSettingsModalOpen) return null;

  const switchProfiles: { id: SoundSwitchType; name: string; desc: string; sample: string }[] = [
    {
      id: 'thock',
      name: 'Thock (Lubed Linear)',
      desc: 'Deep, satisfying low-frequency acoustic clack',
      sample: 'Deep',
    },
    {
      id: 'clicky',
      name: 'Clicky (Cherry MX Blue)',
      desc: 'Crisp, tactile double-click sound',
      sample: 'Crisp',
    },
    {
      id: 'creamy',
      name: 'Creamy (Holy Panda)',
      desc: 'Smooth, poppy medium-pitched sound',
      sample: 'Poppy',
    },
    {
      id: 'silent',
      name: 'Muted / Silent',
      desc: 'No keypress audio, error chimes only',
      sample: 'Mute',
    },
  ];

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-xl bg-[#0f0f12] border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Audio & Practice Settings</h2>
              <p className="text-xs text-slate-400">
                Configure mechanical sound synthesis, TTS speech, and difficulty modes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playThock();
              setIsSettingsModalOpen(false);
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mechanical Switch Sound Profile */}
        <div className="space-y-3">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Mechanical Key Switch Profile
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {switchProfiles.map((sw) => {
              const isSelected = settings.soundProfile === sw.id;
              return (
                <button
                  key={sw.id}
                  id={`switch-profile-${sw.id}`}
                  type="button"
                  onClick={() => {
                    updateSettings({ soundProfile: sw.id });
                    soundEngine.playKeyStroke(sw.id);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                      : 'bg-black/40 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-blue-300' : 'text-white'
                      }`}
                    >
                      {sw.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">{sw.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Volume & Audio Feedback */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-blue-400" /> Sound FX Volume
              </span>
              <span className="font-mono text-blue-400 font-bold">
                {Math.round(settings.soundVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                updateSettings({ soundVolume: vol });
                soundEngine.setVolume(vol);
                soundEngine.playThock();
              }}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div>
              <div className="text-xs font-semibold text-white">Typo Error Chime</div>
              <div className="text-[11px] text-slate-400">Play instant warning tone on error</div>
            </div>
            <input
              type="checkbox"
              checked={settings.enableErrorChime}
              onChange={(e) => updateSettings({ enableErrorChime: e.target.checked })}
              className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Gamification & Health Rules */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-red-400" /> Zen Mode (Unlimited Hearts)
              </div>
              <div className="text-[11px] text-slate-400">
                Disable session failure; practice at your own relaxed pace
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.zenMode}
              onChange={(e) => updateSettings({ zenMode: e.target.checked })}
              className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
            />
          </div>

          {!settings.zenMode && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-red-400" /> Max Hearts / Lives
                </span>
                <span className="font-mono text-red-400 font-bold">
                  {settings.maxHearts} ❤️
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={settings.maxHearts}
                onChange={(e) => {
                  const hearts = parseInt(e.target.value);
                  updateSettings({ maxHearts: hearts });
                }}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <p className="text-[11px] text-slate-400">
                Set how many typo errors allowed before session fails (1-10)
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div>
              <div className="text-xs font-semibold text-white">Strict Backspace Penalty</div>
              <div className="text-[11px] text-slate-400">
                Penalize backspace usage to enforce deliberate muscle memory
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.strictBackspaceMode}
              onChange={(e) => updateSettings({ strictBackspaceMode: e.target.checked })}
              className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Custom Text Practice */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Use Custom Text
              </div>
              <div className="text-[11px] text-slate-400">
                Practice with your own text instead of built-in wordlists
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.useCustomText}
              onChange={(e) => updateSettings({ useCustomText: e.target.checked })}
              className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
            />
          </div>

          {settings.useCustomText && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Your Custom Practice Text
              </label>
              <textarea
                value={settings.customText}
                onChange={(e) => updateSettings({ customText: e.target.value })}
                placeholder="Type or paste your custom text here... (e.g., code snippet, quote, sentence you want to master)"
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-xs resize-none"
                rows={4}
              />
              <p className="text-[11px] text-slate-400">
                💡 Tip: This text will be used in both Precision and Blind modes
              </p>
            </div>
          )}
        </div>

        {/* Display Toggles */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-blue-400" /> Virtual Keyboard Guide
              </div>
              <div className="text-[11px] text-slate-400">
                Show visual keyboard with tactile home nubs
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.showVirtualKeyboard}
              onChange={(e) => updateSettings({ showVirtualKeyboard: e.target.checked })}
              className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div>
              <div className="text-xs font-semibold text-white">Finger Color Hints</div>
              <div className="text-[11px] text-slate-400">
                Highlight recommended finger for each key
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.showFingerGuides}
              onChange={(e) => updateSettings({ showFingerGuides: e.target.checked })}
              className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Re-run Onboarding */}
        <div className="pt-2 flex justify-between items-center text-xs">
          <button
            type="button"
            onClick={() => {
              if (confirm('Re-take the onboarding placement and diagnostic test?')) {
                resetOnboarding();
                setIsSettingsModalOpen(false);
              }
            }}
            className="text-slate-400 hover:text-red-400 underline transition-colors cursor-pointer"
          >
            Re-take Diagnostic Test & Onboarding
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playThock();
              setIsSettingsModalOpen(false);
            }}
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs uppercase tracking-widest shadow-xl transition-all cursor-pointer"
          >
            Save & Close
          </button>
        </div>

        {/* AI Text Generator Button */}
        <div className="pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setIsTextGeneratorOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 text-purple-300 font-semibold text-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            AI Text Generator Settings
          </button>
        </div>
      </div>

      {/* Text Generator Modal */}
      <TextGeneratorSettings
        isOpen={isTextGeneratorOpen}
        onClose={() => setIsTextGeneratorOpen(false)}
      />
    </div>
  );
};
