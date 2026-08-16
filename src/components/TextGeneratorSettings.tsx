import { Sparkles, RefreshCw, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Difficulty, Language } from '../types';
import { wordListManager } from '../lib/wordlists';
import { textGeneratorService } from '../lib/textGenerator';

interface TextGeneratorSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TextGeneratorSettings({ isOpen, onClose }: TextGeneratorSettingsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('id');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleRefreshTexts = async () => {
    setIsGenerating(true);
    setMessage(null);

    try {
      await wordListManager.refreshWordList(selectedLanguage, selectedDifficulty);
      setMessage({
        type: 'success',
        text: `Berhasil generate teks baru untuk ${selectedLanguage.toUpperCase()} - ${selectedDifficulty}!`,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Gagal generate teks: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefreshAll = async () => {
    setIsGenerating(true);
    setMessage(null);

    const languages: Language[] = ['id', 'en'];
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'code'];
    let successCount = 0;
    let failCount = 0;

    for (const lang of languages) {
      for (const diff of difficulties) {
        try {
          await wordListManager.refreshWordList(lang, diff);
          successCount++;
        } catch (error) {
          console.error(`Failed to generate ${lang}-${diff}:`, error);
          failCount++;
        }
      }
    }

    setMessage({
      type: successCount > 0 ? 'success' : 'error',
      text: `Selesai! Berhasil: ${successCount}, Gagal: ${failCount}`,
    });
    setIsGenerating(false);
  };

  const handleClearCache = () => {
    textGeneratorService.clearCache();
    wordListManager.clearCache();
    setMessage({
      type: 'success',
      text: 'Cache berhasil dibersihkan!',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Text Generator</h2>
              <p className="text-sm text-zinc-400">Powered by Google Gemini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <span className="text-2xl text-zinc-400">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Message */}
          {message && (
            <div
              className={`flex items-center gap-3 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/20'
                  : 'bg-red-500/10 border border-red-500/20'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <p
                className={`text-sm ${
                  message.type === 'success' ? 'text-green-300' : 'text-red-300'
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong>ℹ️ Info:</strong> Teks latihan akan di-generate menggunakan Google Gemini AI
              dengan bahasa akademis dan syntax code yang bervariasi. Hasil akan di-cache selama 1
              jam.
            </p>
          </div>

          {/* Language & Difficulty Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Bahasa</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as Language)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isGenerating}
              >
                <option value="id">Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isGenerating}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="code">Code</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleRefreshTexts}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-purple-800 disabled:to-pink-800 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'Generate Teks untuk Pilihan Di Atas'}
            </button>

            <button
              onClick={handleRefreshAll}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/50 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed border border-zinc-700"
            >
              <Sparkles className="w-5 h-5" />
              {isGenerating ? 'Generating All...' : 'Generate Semua Kombinasi (8 total)'}
            </button>

            <button
              onClick={handleClearCache}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-red-900/30 hover:bg-red-900/50 disabled:bg-red-900/20 text-red-400 font-medium rounded-lg transition-all disabled:cursor-not-allowed border border-red-800/50"
            >
              <Trash2 className="w-5 h-5" />
              Hapus Cache
            </button>
          </div>

          {/* Technical Info */}
          <div className="pt-4 border-t border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-300 mb-2">Prompt Guidelines:</h3>
            <ul className="text-xs text-zinc-500 space-y-1">
              <li>• Easy: 8-15 kata, kosakata umum, tone akademis</li>
              <li>• Medium: 15-25 kata, terminologi profesional, struktur kompleks</li>
              <li>• Hard: 20-35 kata + angka, simbol, akronim, data statistik</li>
              <li>• Code: JavaScript/TypeScript/PHP/Laravel syntax, 60-120 karakter</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="w-full px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
