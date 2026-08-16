import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  ChevronRight,
  Gamepad2,
  Heart,
  Sparkles,
  Zap,
  User,
  Upload,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { soundEngine } from '../../lib/audio';
import { AVATAR_ICONS } from '../../lib/avatarUtils';

const TYPO_OPTIONS = [
  {
    id: 'constant',
    title: 'Constantly (Auto-correct saves me)',
    desc: 'I often hit wrong adjacent keys when typing quickly.',
    icon: '🚨',
  },
  {
    id: 'frequent',
    title: 'Frequently on complex words or code',
    desc: 'I have to look down at my keyboard frequently to find symbols.',
    icon: '👀',
  },
  {
    id: 'sometimes',
    title: 'Occasionally when typing at high speed',
    desc: 'Decent speed, but want rock-solid consistency and 0% typos.',
    icon: '🎯',
  },
  {
    id: 'rare',
    title: 'Rarely, looking for pure blind muscle memory',
    desc: 'I want full subconscious accuracy without ever glancing down.',
    icon: '🧘‍♂️',
  },
];

const DAILY_GOAL_OPTIONS = [
  { minutes: 5, label: 'Casual', desc: '5 min / day — Light muscle warm-up' },
  { minutes: 10, label: 'Regular (Recommended)', desc: '10 min / day — Steady muscle memory formation' },
  { minutes: 15, label: 'Serious', desc: '15 min / day — Intensive blind typing mastery' },
];

const DIAGNOSTIC_SENTENCE =
  'Place your fingers on home row keys F and J. Focus on precision and hit every key cleanly.';

export const OnboardingWizard: React.FC = () => {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState<number>(1);

  // Form State
  const [name, setName] = useState('Typing Master');
  const [avatar, setAvatar] = useState('User');
  const [avatarType, setAvatarType] = useState<'icon' | 'upload'>('icon');
  const [typoFrequency, setTypoFrequency] = useState('sometimes');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Diagnostic Test State
  const [testInput, setTestInput] = useState('');
  const [testTimeLeft, setTestTimeLeft] = useState(30);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [totalKeyStrokes, setTotalKeyStrokes] = useState(0);
  const [testErrors, setTestErrors] = useState(0);
  const [testBackspaces, setTestBackspaces] = useState(0);
  const testInputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically on step 4
  useEffect(() => {
    if (step === 4 && testInputRef.current) {
      testInputRef.current.focus();
    }
  }, [step]);

  // Timer logic for step 4
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTestRunning && testTimeLeft > 0 && !testCompleted) {
      timer = setInterval(() => {
        setTestTimeLeft((prev) => {
          if (prev <= 1) {
            finishDiagnostic();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTestRunning, testTimeLeft, testCompleted]);

  const finishDiagnostic = () => {
    setIsTestRunning(false);
    setTestCompleted(true);
    soundEngine.playSuccessFanfare();
  };

  const handleTestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (testCompleted) return;

    if (!isTestRunning && e.key.length === 1) {
      setIsTestRunning(true);
    }

    if (e.key === 'Backspace') {
      soundEngine.playBackspaceSound();
      setTestBackspaces((prev) => prev + 1);
      return;
    }

    if (e.key.length === 1) {
      const nextIdx = testInput.length;
      const expectedChar = DIAGNOSTIC_SENTENCE[nextIdx];

      setTotalKeyStrokes((prev) => prev + 1);

      if (e.key === expectedChar) {
        soundEngine.playThock();
      } else {
        soundEngine.playErrorChime();
        setTestErrors((prev) => prev + 1);
      }

      // Check if finished full sentence
      if (nextIdx + 1 >= DIAGNOSTIC_SENTENCE.length) {
        finishDiagnostic();
      }
    }
  };

  // Calculate diagnostic accuracy
  const computedAccuracy =
    totalKeyStrokes > 0
      ? Math.max(
          10,
          Math.min(
            100,
            Math.round(
              ((totalKeyStrokes - testErrors) / totalKeyStrokes) * 100 - testBackspaces * 0.5
            )
          )
        )
      : 95;

  const handleFinishOnboarding = () => {
    completeOnboarding(
      {
        name: name.trim() || 'Typist',
        avatar,
        avatarType,
        typoFrequency,
        dailyGoalMinutes,
      },
      computedAccuracy
    );
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setAvatar(imageUrl);
        setAvatarType('upload');
        soundEngine.playThock();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIconSelect = (iconName: string) => {
    setAvatar(iconName);
    setAvatarType('icon');
    soundEngine.playThock();
  };

  const getAvatarDisplay = () => {
    if (avatarType === 'upload') {
      return (
        <img
          src={avatar}
          alt="Avatar"
          className="w-full h-full object-cover rounded-3xl"
        />
      );
    } else {
      const IconComponent = AVATAR_ICONS.find((i) => i.name === avatar)?.Icon || User;
      return <IconComponent className="w-10 h-10 text-blue-400" />;
    }
  };

  return (
    <div id="onboarding-wizard-wrapper" className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-xl bg-[#0f0f12]/95 border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Step Progress Bar */}
        <div className="flex items-center justify-between gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]' : 'bg-white/5'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Nickname & Avatar */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Step 1 of 4 • Identity
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Welcome to BlindType
                </h1>
                <p className="text-slate-400 text-sm">
                  Master typing accuracy, muscle memory, and blind keyboard mastery.
                </p>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Choose Your Avatar
                </label>
                
                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Upload Your Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />

                {/* Icon Selector */}
                <div className="space-y-1.5">
                  <p className="text-[10px] text-slate-500 text-center">Or choose an icon</p>
                  <div className="grid grid-cols-6 gap-2.5">
                    {AVATAR_ICONS.map(({ name, Icon }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleIconSelect(name)}
                        className={`h-12 flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
                          avatar === name && avatarType === 'icon'
                            ? 'bg-blue-600/20 border-blue-400 scale-105 shadow-md shadow-blue-500/20'
                            : 'bg-black/40 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${avatar === name && avatarType === 'icon' ? 'text-blue-400' : 'text-slate-400'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nickname Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Your Nickname
                </label>
                <input
                  id="onboarding-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-base"
                />
              </div>

              <button
                id="onboarding-step1-next-btn"
                type="button"
                onClick={() => {
                  soundEngine.playThock();
                  setStep(2);
                }}
                disabled={!name.trim()}
                className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: Motivation Survey */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="text-center space-y-2">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Step 2 of 4 • Diagnostic Survey
                </span>
                <h2 className="text-2xl font-bold text-white">How often do you make typos?</h2>
                <p className="text-slate-400 text-sm">
                  We customize audio feedback cues and precision drills to match your muscle memory.
                </p>
              </div>

              <div className="space-y-2.5">
                {TYPO_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    id={`typo-option-${opt.id}`}
                    type="button"
                    onClick={() => {
                      setTypoFrequency(opt.id);
                      soundEngine.playThock();
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                      typoFrequency === opt.id
                        ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-black/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">{opt.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-all cursor-pointer border border-white/10"
                >
                  Back
                </button>
                <button
                  id="onboarding-step2-next-btn"
                  type="button"
                  onClick={() => {
                    soundEngine.playThock();
                    setStep(3);
                  }}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  Set Daily Target
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Daily Target */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Step 3 of 4 • Daily Habit
                </span>
                <h2 className="text-2xl font-bold text-white">Choose your daily practice goal</h2>
                <p className="text-slate-400 text-sm">
                  Short daily muscle memory sessions build everlasting finger instincts.
                </p>
              </div>

              <div className="space-y-3">
                {DAILY_GOAL_OPTIONS.map((g) => (
                  <button
                    key={g.minutes}
                    id={`daily-goal-${g.minutes}`}
                    type="button"
                    onClick={() => {
                      setDailyGoalMinutes(g.minutes);
                      soundEngine.playThock();
                    }}
                    className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      dailyGoalMinutes === g.minutes
                        ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-black/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold font-mono">
                        {g.minutes}m
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-white text-sm">{g.label}</div>
                        <div className="text-xs text-slate-400">{g.desc}</div>
                      </div>
                    </div>
                    {dailyGoalMinutes === g.minutes && (
                      <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-all cursor-pointer border border-white/10"
                >
                  Back
                </button>
                <button
                  id="onboarding-step3-next-btn"
                  type="button"
                  onClick={() => {
                    soundEngine.playThock();
                    setStep(4);
                  }}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  Start Diagnostic Test
                  <Zap className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: 30-Second Diagnostic Accuracy Test */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="text-center space-y-1.5">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Step 4 of 4 • Baseline Diagnostic Test
                </span>
                <h2 className="text-2xl font-bold text-white">Measure Initial Accuracy</h2>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Type the phrase below. Prioritize hitting 100% clean keys over speed.
                </p>
              </div>

              {/* Status Header */}
              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-black/40 border border-white/5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Time Left:</span>
                  <span className="font-mono font-bold text-blue-400 text-sm">
                    {testTimeLeft}s
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">Errors: <strong className="text-red-400">{testErrors}</strong></span>
                  <span className="text-slate-400">Backspaces: <strong className="text-amber-400">{testBackspaces}</strong></span>
                </div>
              </div>

              {/* Target Text Box */}
              <div className="p-5 rounded-xl bg-black/60 border border-white/10 font-mono text-base sm:text-lg leading-relaxed relative">
                {DIAGNOSTIC_SENTENCE.split('').map((char, index) => {
                  let statusColor = 'text-slate-600';
                  let isCurrent = false;

                  if (index < testInput.length) {
                    statusColor =
                      testInput[index] === char
                        ? 'text-white font-medium'
                        : 'text-red-300 bg-red-500/20 rounded px-0.5 underline';
                  } else if (index === testInput.length) {
                    isCurrent = true;
                    statusColor = 'text-white bg-blue-500/20 rounded px-0.5 ring-2 ring-blue-500 animate-pulse';
                  }

                  return (
                    <span
                      key={index}
                      className={`${statusColor} ${isCurrent ? 'bg-blue-500/20 font-bold' : ''}`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>

              {/* Hidden/Active Input */}
              {!testCompleted ? (
                <div className="space-y-2">
                  <input
                    ref={testInputRef}
                    id="diagnostic-input"
                    type="text"
                    value={testInput}
                    onChange={(e) => {
                      if (e.target.value.length <= DIAGNOSTIC_SENTENCE.length) {
                        setTestInput(e.target.value);
                      }
                    }}
                    onKeyDown={handleTestKeyDown}
                    placeholder="Start typing to begin 30s timer..."
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <p className="text-center text-[11px] text-slate-500">
                    💡 Tip: Keep eyes focused on home row nubs on F and J.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center space-y-2">
                  <div className="text-blue-400 font-bold flex items-center justify-center gap-1.5 text-base">
                    <CheckCircle2 className="w-5 h-5" />
                    Diagnostic Complete!
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">
                    Initial Accuracy: <span className="text-blue-400">{computedAccuracy}%</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {computedAccuracy >= 95
                      ? 'Exceptional muscle control! You are ready for Blind Mode.'
                      : 'Great foundation! We will calibrate drills to eliminate typo friction.'}
                  </p>
                </div>
              )}

              {testCompleted && (
                <button
                  id="diagnostic-finish-btn"
                  type="button"
                  onClick={() => setStep(5)}
                  className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  View Calibration Summary
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )}

          {/* STEP 5: Calibration Summary & Enter BlindType */}
          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shadow-xl shadow-blue-500/20 overflow-hidden">
                {getAvatarDisplay()}
              </div>

              <div className="space-y-1.5">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Ready for Precision
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Welcome aboard, {name}!
                </h2>
                <p className="text-slate-400 text-sm">
                  Your baseline accuracy has been recorded and sound engines calibrated.
                </p>
              </div>

              {/* Stats highlights */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Baseline Acc</div>
                  <div className="text-2xl font-mono font-light text-blue-400 mt-0.5">
                    {computedAccuracy}%
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Daily Target</div>
                  <div className="text-2xl font-mono font-light text-white mt-0.5">
                    {dailyGoalMinutes}m
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Lives / Hearts</div>
                  <div className="text-2xl font-mono font-light text-red-400 mt-0.5 flex items-center justify-center gap-1">
                    <Heart className="w-4 h-4 fill-red-500" /> 3
                  </div>
                </div>
              </div>

              <button
                id="enter-blindtype-dashboard-btn"
                type="button"
                onClick={handleFinishOnboarding}
                className="w-full py-4 px-6 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4" />
                Enter Training Center
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
