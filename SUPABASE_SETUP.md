# 🗃️ Supabase Setup Guide - BlindType V2

Panduan lengkap untuk mengaktifkan **Global Leaderboard** yang kompetitif dengan menggunakan Supabase sebagai backend database.

---

## 📋 Prerequisites

- Akun Supabase (gratis) - [Daftar di sini](https://supabase.com)
- Project BlindType V2 sudah running locally

---

## 🚀 Step-by-Step Setup

### 1️⃣ Buat Project Supabase Baru

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Klik **"New Project"**
3. Isi detail project:
   - **Name**: `blindtype-v2` (atau nama sesukamu)
   - **Database Password**: Simpan password ini dengan aman
   - **Region**: Pilih region terdekat (e.g., Southeast Asia)
4. Klik **"Create new project"** dan tunggu ~2 menit

---

### 2️⃣ Setup Database Table

1. Di Supabase Dashboard, buka **SQL Editor** (menu sebelah kiri)
2. Klik **"New Query"**
3. Buka file `supabase-setup.sql` di project ini
4. Copy **seluruh isi file** tersebut
5. Paste ke SQL Editor di Supabase
6. Klik **"Run"** atau tekan `Ctrl+Enter`
7. ✅ Kamu akan melihat pesan "Success. No rows returned"

**Apa yang dilakukan script ini?**
- ✅ Membuat tabel `leaderboard` dengan semua kolom yang dibutuhkan
- ✅ Menambahkan validasi data (constraints)
- ✅ Membuat indexes untuk query yang cepat
- ✅ Setup Row Level Security (RLS) untuk akses publik
- ✅ Insert data seed (6 dummy champions untuk referensi)

---

### 3️⃣ Verifikasi Table Sudah Dibuat

1. Buka **Table Editor** di menu kiri
2. Pilih table **"leaderboard"**
3. Kamu akan melihat 6 baris data dummy (seed data)
4. ✅ Table berhasil dibuat!

---

### 4️⃣ Dapatkan API Credentials

1. Di Supabase Dashboard, buka **Settings** → **API**
2. Salin kredensial berikut:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: String panjang seperti `eyJhbGciOiJIUz...`

---

### 5️⃣ Update Kredensial di Project

Buka file `src/lib/supabase.ts` dan update baris berikut:

```typescript
const SUPABASE_URL = 'https://YOUR_PROJECT_URL.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
```

**⚠️ PENTING untuk Production:**
Jangan hardcode kredensial di production! Gunakan environment variables:

1. Buka file `.env`:
```env
VITE_SUPABASE_URL="https://YOUR_PROJECT_URL.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_ANON_KEY_HERE"
```

2. Update `src/lib/supabase.ts`:
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
```

---

### 6️⃣ Test Connection

1. Restart development server:
```bash
npm run dev
```

2. Buka aplikasi di browser
3. Pergi ke **Leaderboard** tab
4. Lihat di header, seharusnya ada badge **🟢 LIVE** (bukan OFFLINE)
5. Kamu akan melihat 6 dummy champions dari seed data

---

### 7️⃣ Test Submit Score

1. Bermain di **Precision Mode** atau **Blind Mode**
2. Selesaikan dengan accuracy ≥70%
3. Setelah selesai, buka **Leaderboard**
4. Score kamu seharusnya muncul di leaderboard!
5. Buka browser console (F12) → Console tab
6. Cari pesan: `✅ Score successfully submitted to Supabase leaderboard!`

---

## 🎮 Cara Kerja Global Leaderboard

### Automatic Score Submission
Setiap kali user menyelesaikan sesi typing dengan **accuracy ≥70%**, score otomatis dikirim ke Supabase:

```typescript
// Di AppContext.tsx - recordSessionResult()
if (result.passed && result.accuracy >= 70) {
  submitScoreToLeaderboard({
    user_name: userProfile.name,
    avatar: userProfile.avatar,
    accuracy: result.accuracy,
    score: result.score,
    mode: result.mode,
    language: result.language,
    difficulty: result.difficulty,
    backspaces: result.backspaceCount,
    wpm: result.wpm,
  });
}
```

### Ranking System
Leaderboard di-rank berdasarkan:
1. **Primary**: Accuracy % (descending)
2. **Secondary**: Score (descending)
3. **Tertiary**: Created At (newest first)

### Offline Support
- Jika koneksi Supabase gagal, scores tetap tersimpan **local storage**
- UI menampilkan badge **🟡 OFFLINE**
- Saat online lagi, user bisa klik refresh untuk sync

---

## 🔒 Security & Privacy

### Row Level Security (RLS)
Table sudah dikonfigurasi dengan RLS policies:

✅ **Read (SELECT)**: Semua orang bisa melihat leaderboard
✅ **Insert**: Semua orang bisa submit scores
❌ **Update**: Tidak bisa edit scores yang sudah ada
❌ **Delete**: Hanya admin (service role) yang bisa delete

### Data Yang Disimpan
- Username (yang user set di profile)
- Avatar emoji atau icon name
- Score statistics (accuracy, WPM, backspaces, dll)
- **TIDAK menyimpan**: Email, password, IP address, atau PII lainnya

---

## 🧪 Testing & Debugging

### Check Connection Status
Buka browser console dan jalankan:
```javascript
// Di browser console
const { checkSupabaseConnection } = await import('./src/lib/supabase.ts');
const isConnected = await checkSupabaseConnection();
console.log('Connected:', isConnected);
```

### View All Scores in Supabase
```sql
-- Di Supabase SQL Editor
SELECT 
  user_name, 
  accuracy, 
  score, 
  mode, 
  created_at 
FROM leaderboard 
ORDER BY accuracy DESC, score DESC 
LIMIT 20;
```

### Clear Local Scores (for testing)
```javascript
// Di browser console
localStorage.removeItem('blindtype_local_leaderboard');
location.reload();
```

---

## 🛠️ Troubleshooting

### ❌ Badge menunjukkan "OFFLINE"

**Solusi:**
1. Pastikan kredensial Supabase sudah benar di `src/lib/supabase.ts`
2. Check browser console untuk error messages
3. Verifikasi table `leaderboard` ada di Supabase Dashboard
4. Pastikan RLS policies sudah enabled

### ❌ Score tidak muncul di leaderboard

**Solusi:**
1. Pastikan accuracy ≥70% (requirement untuk masuk leaderboard)
2. Check browser console untuk error messages
3. Buka Supabase Table Editor → `leaderboard` table
4. Lihat apakah ada entry baru dengan timestamp terbaru
5. Klik refresh button di leaderboard UI

### ❌ Error "relation 'public.leaderboard' does not exist"

**Solusi:**
1. Table belum dibuat, jalankan lagi `supabase-setup.sql`
2. Pastikan menjalankan query di **SQL Editor**, bukan di tempat lain

---

## 📊 Database Schema

```sql
CREATE TABLE public.leaderboard (
  id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  accuracy NUMERIC(5,2) NOT NULL,    -- e.g., 98.50
  score INTEGER NOT NULL,
  mode TEXT NOT NULL,                -- 'blind' | 'precision' | 'drills'
  language TEXT NOT NULL,            -- 'id' | 'en'
  difficulty TEXT NOT NULL,          -- 'easy' | 'medium' | 'hard' | 'code'
  backspaces INTEGER NOT NULL,
  wpm INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);
```

---

## 🎯 Next Steps (Optional Enhancements)

### 1. Add User Authentication
- Implement Supabase Auth (Google, Email, etc.)
- Link scores to authenticated users
- Add profile pages

### 2. Add Leaderboard Filters
- Filter by date range (today, this week, all-time)
- Filter by language
- Filter by difficulty

### 3. Add Real-time Updates
- Use Supabase Realtime subscriptions
- Show live updates when new scores come in
- Add toast notifications

### 4. Add Analytics Dashboard
- Track total players
- Show average accuracy trends
- Visualize difficulty distribution

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## 💬 Support

Jika ada pertanyaan atau masalah:
1. Check browser console untuk error messages
2. Check Supabase logs di Dashboard → Logs
3. Baca troubleshooting section di atas
4. Open issue di GitHub repository

---

**✅ Setup Complete! Sekarang semua user yang bermain akan bersaing di Global Leaderboard yang sama!** 🏆
