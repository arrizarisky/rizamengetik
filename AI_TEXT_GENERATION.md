# AI Text Generation dengan Google Gemini

## 📖 Overview

BlindType V2 sekarang menggunakan **Google Gemini AI** untuk menghasilkan teks latihan mengetik yang bervariasi dan berkualitas tinggi. Sistem ini secara otomatis menghasilkan:

- **Kalimat akademis** untuk level Easy, Medium, dan Hard
- **Code snippets** dalam JavaScript, TypeScript, PHP, dan Laravel
- **Drill texts** untuk latihan home row, top row, bottom row, numbers, dan symbols

## 🚀 Fitur Utama

### 1. **Dynamic Text Generation**
- Teks latihan di-generate secara real-time menggunakan Gemini 1.5 Flash
- Setiap kombinasi bahasa & difficulty menghasilkan 5-8 variasi teks
- Cache otomatis selama 1 jam untuk efisiensi

### 2. **Bahasa Akademis**
- Tone formal dan profesional
- Kosakata yang tepat untuk setiap level kesulitan
- Struktur kalimat yang progresif

### 3. **Code Syntax yang Bervariasi**
- Modern ES6+ JavaScript/TypeScript
- React Hooks dan async/await patterns
- PHP Laravel 10+ syntax
- Mix frontend dan backend code

### 4. **Smart Caching System**
- LocalStorage cache untuk mengurangi API calls
- Auto-expire setelah 1 jam
- Manual refresh untuk generate teks baru

## 🔧 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Konfigurasi API Key

Edit file `.env` dan tambahkan Gemini API key:

```env
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

Dapatkan API key gratis di: https://ai.google.dev/gemini-api

### 3. Build & Run

```bash
npm run dev
```

## 🎯 Cara Menggunakan

### Via UI (Recommended)

1. Buka aplikasi BlindType
2. Klik tombol **Settings** (⚙️) di navbar
3. Scroll ke bawah dan klik **AI Text Generator Settings**
4. Pilih kombinasi Bahasa dan Difficulty
5. Klik **Generate Teks** atau **Generate Semua Kombinasi**

### Programmatic Usage

```typescript
import { wordListManager } from './lib/wordlists';

// Get word list dengan auto-generation
const texts = await wordListManager.getWordList('id', 'medium');

// Force refresh (bypass cache)
const freshTexts = await wordListManager.refreshWordList('en', 'code');

// Clear all cache
wordListManager.clearCache();
```

## 📋 Prompt Guidelines

### Easy Level
- **Panjang**: 8-15 kata
- **Kosakata**: Umum, sehari-hari
- **Struktur**: Sederhana, direct
- **Topik**: Kebiasaan kerja, belajar, fokus, disiplin

**Contoh Output:**
```
Latihan rutin lima menit sehari melatih memori otot secara alami.
```

### Medium Level
- **Panjang**: 15-25 kata
- **Kosakata**: Profesional, teknis
- **Struktur**: Compound sentences
- **Topik**: Produktivitas, teknologi, skill development

**Contoh Output:**
```
Memori otot terbentuk ketika jari kita terbiasa menekan tombol tanpa perlu melirik layar atau keyboard.
```

### Hard Level
- **Panjang**: 20-35 kata
- **Kompleksitas**: Angka, tanggal, persentase, simbol
- **Kosakata**: Teknis, akronim, jargon
- **Topik**: Spesifikasi teknis, data statistik, fakta historis

**Contoh Output:**
```
PT Teknologi Nusantara (Persero) mencatat pertumbuhan 24.8% pada Q3-2025; total transaksi capai Rp 18.500.000!
```

### Code Level
- **Panjang**: 60-120 karakter per line
- **Bahasa**: JavaScript, TypeScript, PHP, Laravel
- **Pattern**: Functions, interfaces, async/await, hooks

**Contoh Output:**
```typescript
const calculateAccuracy = (correct: number, total: number): number => Math.round((correct / total) * 100);
```

## 🧩 Architecture

```
src/
├── lib/
│   ├── gemini.ts              # Gemini API client & generator
│   ├── textGenerator.ts       # Cache & service layer
│   └── wordlists.ts           # WordListManager & exports
├── components/
│   └── TextGeneratorSettings.tsx  # UI untuk manage generation
```

### Flow Diagram

```
User Action → WordListManager → TextGeneratorService → Gemini API
                    ↓                     ↓
              Check Cache          Save to Cache
                    ↓                     ↓
              Return Texts          LocalStorage
```

## 🔒 API Security

⚠️ **Important**: API key disimpan di environment variables dan di-expose ke client-side code. Untuk production:

1. Gunakan server-side proxy untuk API calls
2. Implement rate limiting
3. Restrict API key dengan domain restrictions di Google Cloud Console

## 🎨 Customization

### Menambah Prompt Baru

Edit `src/lib/gemini.ts`:

```typescript
private getPromptForDifficulty(options: GenerateTextOptions): string {
  const basePrompts = {
    yourNewLevel: `Your custom prompt here...`,
    // ...
  };
  return basePrompts[difficulty];
}
```

### Mengubah Cache Duration

Edit `src/lib/textGenerator.ts`:

```typescript
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour (in milliseconds)
```

### Mengatur Model Gemini

Edit `src/lib/gemini.ts`:

```typescript
constructor(config: GeminiConfig) {
  this.model = config.model || 'gemini-1.5-flash'; // Change model here
}
```

## 🐛 Troubleshooting

### Error: "Gemini API key not configured"

**Solusi**: Pastikan file `.env` ada dan berisi `GEMINI_API_KEY`

### Text tidak berubah setelah generate

**Solusi**: 
1. Clear cache via UI: Settings → AI Text Generator → Hapus Cache
2. Atau force refresh browser (Ctrl + Shift + R)

### API Rate Limit Exceeded

**Solusi**: 
1. Tunggu beberapa menit
2. Cache akan mengurangi jumlah API calls
3. Upgrade ke Gemini API paid tier jika perlu

### Generated text tidak sesuai

**Solusi**: Klik **Generate** lagi untuk mendapat variasi baru

## 📊 Cost Estimation

Gemini 1.5 Flash (Free Tier):
- **Limit**: 15 requests/minute, 1500 requests/day
- **Tokens**: ~500-1000 tokens per request
- **Usage**: 8 kombinasi × 8 tokens = ~64 requests untuk full generation

✅ **Free tier lebih dari cukup untuk penggunaan normal!**

## 🤝 Contributing

Jika ingin menambahkan fitur:

1. Fork repository
2. Buat branch baru: `git checkout -b feature/new-prompt-type`
3. Commit changes: `git commit -m 'Add new prompt type'`
4. Push: `git push origin feature/new-prompt-type`
5. Open Pull Request

## 📝 License

Same as main project license.

---

**Built with ❤️ using Google Gemini AI**
