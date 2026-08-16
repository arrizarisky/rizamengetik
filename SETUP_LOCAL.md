# Setup Project BlindType V2

## Prerequisites
- Node.js (v18 atau lebih tinggi) ✅ Terinstall: v24.14.1
- npm (biasanya sudah terinstall bersama Node.js)

## Langkah Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
File `.env` sudah dibuat. Anda perlu mengisi:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
```

**Cara mendapatkan Gemini API Key:**
1. Kunjungi: https://ai.google.dev/gemini-api
2. Login dengan Google Account
3. Buat API Key baru
4. Copy dan paste ke file `.env`

### 3. Jalankan Development Server
```bash
npm run dev
```

Server akan berjalan di: **http://localhost:3000**

### 4. Build untuk Production (opsional)
```bash
npm run build
```

### 5. Preview Production Build (opsional)
```bash
npm run preview
```

## Fitur Project

BlindType V2 adalah aplikasi typing practice dengan fitur:
- **Blind Mode**: Latihan mengetik tanpa melihat
- **Precision Mode**: Mode akurasi tinggi
- **Practice Drills**: Latihan khusus
- **Leaderboard**: Skor pemain (dengan Supabase backend)
- **Virtual Keyboard**: Keyboard visual
- **Analytics**: Statistik performa
- **Multi-language**: Support Bahasa Indonesia & English

## Troubleshooting

### Port 3000 sudah digunakan?
Edit file `package.json` dan ubah port di script `dev`:
```json
"dev": "vite --port=3001 --host=0.0.0.0"
```

### Error saat npm install?
Coba hapus folder `node_modules` dan file `package-lock.json`, lalu install ulang:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Tech Stack
- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Supabase (Database & Auth)
- Google Gemini AI
- Framer Motion
