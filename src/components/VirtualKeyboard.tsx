import React from 'react';
import { KEY_FINGER_MAPPING } from '../lib/wordlists';

interface VirtualKeyboardProps {
  activeTargetKey?: string;
  lastPressedKey?: string;
  showFingerHints?: boolean;
  onKeyPress?: (key: string) => void;
}

const KEYBOARD_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
  ['Space'],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  activeTargetKey = '',
  lastPressedKey = '',
  showFingerHints = true,
  onKeyPress,
}) => {
  // Normalize target key
  const normalizedTarget = activeTargetKey.toLowerCase();
  const normalizedPressed = lastPressedKey.toLowerCase();

  const fingerInfo = KEY_FINGER_MAPPING[activeTargetKey] || KEY_FINGER_MAPPING[normalizedTarget];

  return (
    <div id="virtual-keyboard-container" className="w-full max-w-4xl mx-auto select-none">
      {/* Active Finger Hint Indicator */}
      {showFingerHints && fingerInfo && (
        <div id="finger-hint-badge" className="flex items-center justify-between mb-2.5 px-4 py-2 rounded-xl bg-black/40 border border-white/5 text-xs backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Target Key:</span>
            <span className="font-mono px-2.5 py-0.5 rounded-lg bg-blue-600/20 text-blue-300 font-bold border border-blue-500/30 text-xs">
              {activeTargetKey === ' ' ? 'SPACE' : activeTargetKey || '—'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Recommended Finger:</span>
            <span className={`px-3 py-0.5 rounded-full font-semibold border text-xs ${fingerInfo.color}`}>
              {fingerInfo.label}
            </span>
          </div>
        </div>
      )}

      {/* Keyboard Matrix */}
      <div className="p-4 rounded-2xl bg-[#0f0f12]/95 border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="space-y-1.5">
          {KEYBOARD_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1.5">
              {row.map((key, kIdx) => {
                const isSpace = key === 'Space';
                const isBackspace = key === 'Backspace';
                const isTab = key === 'Tab';
                const isCaps = key === 'Caps';
                const isEnter = key === 'Enter';
                const isShift = key === 'Shift';
                const isModifier = isBackspace || isTab || isCaps || isEnter || isShift;

                const isTarget =
                  (!isModifier && (key.toLowerCase() === normalizedTarget || (isSpace && activeTargetKey === ' '))) ||
                  (isBackspace && activeTargetKey === 'Backspace');

                const isPressed =
                  (!isModifier && (key.toLowerCase() === normalizedPressed || (isSpace && lastPressedKey === ' '))) ||
                  (isBackspace && lastPressedKey === 'Backspace');

                const isHomeNub = key === 'f' || key === 'j';

                // Finger Color coding
                const keyMapping = KEY_FINGER_MAPPING[key.toLowerCase()];
                const baseColorClass = keyMapping
                  ? 'text-slate-300 border-white/5 bg-white/[0.04] hover:border-white/20 active:scale-95'
                  : 'text-slate-400 border-white/5 bg-white/[0.02] hover:border-white/20 active:scale-95';

                // Size variations
                let widthClass = 'w-10 h-10 sm:w-11 sm:h-11';
                if (isSpace) widthClass = 'w-64 sm:w-80 h-10 sm:h-11';
                else if (isBackspace) widthClass = 'w-16 sm:w-20 h-10 sm:h-11';
                else if (isTab) widthClass = 'w-12 sm:w-14 h-10 sm:h-11';
                else if (isCaps) widthClass = 'w-14 sm:w-16 h-10 sm:h-11';
                else if (isEnter) widthClass = 'w-16 sm:w-20 h-10 sm:h-11';
                else if (isShift) widthClass = 'w-16 sm:w-20 h-10 sm:h-11';

                const handleKeyClick = () => {
                  if (!onKeyPress) return;
                  if (isSpace) onKeyPress(' ');
                  else if (isBackspace) onKeyPress('Backspace');
                  else if (!isModifier) onKeyPress(key);
                };

                return (
                  <button
                    type="button"
                    key={`${rIdx}-${kIdx}`}
                    id={`key-${key.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                    onClick={handleKeyClick}
                    className={`
                      relative flex flex-col items-center justify-center font-mono font-medium rounded-xl text-xs sm:text-sm
                      transition-all duration-75 border cursor-pointer
                      ${widthClass}
                      ${
                        isTarget
                          ? 'bg-blue-600 text-white font-bold border-blue-400 shadow-[0_0_16px_rgba(59,130,246,0.8)] ring-2 ring-blue-400/50 scale-105 z-10'
                          : isPressed
                          ? 'bg-blue-700/60 text-blue-100 border-blue-500 scale-95'
                          : baseColorClass
                      }
                    `}
                  >
                    {isSpace ? (
                      <span className="text-[10px] text-slate-400 tracking-wider">SPACEBAR (THUMB)</span>
                    ) : (
                      <span className="uppercase">{key}</span>
                    )}

                    {/* Home Row Tactile Nodule Indicator */}
                    {isHomeNub && (
                      <span
                        className={`absolute bottom-1 w-2.5 h-0.5 rounded-full ${
                          isTarget ? 'bg-white shadow-[0_0_6px_#fff]' : 'bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.8)]'
                        }`}
                        title="Tactile Home Row Nodule"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend / Finger Color Map */}
        {showFingerHints && (
          <div className="mt-3.5 pt-3 border-t border-white/5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
            <span className="font-medium text-slate-300">Finger Alignment:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
              Pinky (A, Q, Z / P, ;)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Ring (S, W / L, O)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Middle (D, E / K, I)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Index Left (F, R, V, G)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
              Index Right (J, U, M, H)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
