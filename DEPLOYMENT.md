# 🚀 Deployment Guide - BlindType V2 ke Vercel

## Prerequisites

1. **Akun Vercel** - Daftar di [vercel.com](https://vercel.com)
2. **Akun GitHub** - Project harus sudah di-push ke GitHub repository
3. **Supabase Project** - Setup database dan authentication
4. **Gemini API Key** - Untuk AI text generation

---

## 📋 Langkah-langkah Deployment

### 1. Persiapan Environment Variables

Sebelum deploy, pastikan Anda memiliki environment variables berikut:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 2. Setup di Vercel

#### A. Via Vercel Dashboard (Recommended)

1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik **"Add New Project"**
3. Import repository GitHub Anda
4. Vercel akan otomatis mendeteksi framework Vite
5. Konfigurasi project:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

6. Tambahkan Environment Variables:
   - Buka tab **"Environment Variables"**
   - Tambahkan semua variabel di atas (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GEMINI_API_KEY)
   - Pilih environment: **Production**, **Preview**, dan **Development**

7. Klik **"Deploy"**

#### B. Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy project
vercel

# Atau langsung ke production
vercel --prod
```

### 3. Setup Environment Variables via CLI

```bash
# Tambahkan environment variables
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_GEMINI_API_KEY production

# Pull environment variables untuk development lokal
vercel env pull
```

### 4. Konfigurasi Domain (Optional)

1. Buka project di Vercel Dashboard
2. Pergi ke **Settings → Domains**
3. Tambahkan custom domain Anda
4. Update DNS records sesuai instruksi Vercel

---

## 🔧 Troubleshooting

### Build Failed

**Problem:** Build gagal dengan error TypeScript

**Solution:**
```bash
# Jalankan build secara lokal untuk debugging
npm run build

# Cek type errors
npm run lint
```

### Environment Variables Tidak Terdeteksi

**Problem:** API keys tidak berfungsi di production

**Solution:**
- Pastikan semua environment variables diawali dengan `VITE_`
- Redeploy project setelah menambahkan env vars
- Clear cache dengan menggunakan "Redeploy" di Vercel Dashboard

### 404 Error pada Route Refresh

**Problem:** Halaman mengembalikan 404 saat refresh

**Solution:** File `vercel.json` sudah dikonfigurasi dengan rewrites untuk SPA routing. Jika masih bermasalah, pastikan file `vercel.json` ada di root project.

---

## 📊 Performance Optimization

Project ini sudah dikonfigurasi dengan optimasi berikut:

- ✅ **Code Splitting** - Vendor chunks terpisah (React, Supabase, Gemini)
- ✅ **Minification** - Terser dengan drop console & debugger
- ✅ **Asset Caching** - Static assets di-cache 1 tahun
- ✅ **No Source Maps** - Source maps dinonaktifkan di production

---

## 🔐 Security Checklist

- [ ] Environment variables tidak di-commit ke Git
- [ ] `.env` sudah ada di `.gitignore`
- [ ] Supabase RLS (Row Level Security) sudah diaktifkan
- [ ] API keys menggunakan prefix `VITE_` untuk public exposure yang aman
- [ ] CORS dikonfigurasi di Supabase untuk domain Vercel

---

## 📱 Testing Production Build

```bash
# Build locally
npm run build

# Preview production build
npm run preview

# Test di localhost:4173
```

---

## 🔄 Auto-Deploy

Vercel otomatis akan:
- Deploy setiap push ke branch `main` → Production
- Deploy setiap push ke branch lain → Preview deployment
- Deploy setiap Pull Request → Preview deployment

---

## 📞 Support

Jika mengalami masalah:
1. Cek Vercel deployment logs
2. Cek browser console untuk errors
3. Verifikasi environment variables
4. Review Supabase connection

---

## 🎯 Post-Deployment

Setelah berhasil deploy:

1. **Test semua fitur:**
   - Authentication (Login/Register)
   - Blind Mode
   - Precision Mode
   - Leaderboard
   - Analytics

2. **Monitor performance:**
   - Buka Vercel Analytics
   - Track loading times
   - Monitor error rates

3. **Setup Custom Domain (Optional):**
   - Tambah domain di Vercel
   - Update DNS records

---

**Happy Typing! 🎯✨**
