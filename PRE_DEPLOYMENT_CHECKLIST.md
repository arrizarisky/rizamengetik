# ✅ Pre-Deployment Checklist - BlindType V2

Gunakan checklist ini sebelum melakukan deployment ke Vercel untuk memastikan semua konfigurasi sudah benar.

---

## 🔐 1. Environment Variables

### Pastikan Anda memiliki credentials berikut:

- [ ] **Supabase Project URL** - Dapatkan dari Supabase Dashboard → Settings → API
- [ ] **Supabase Anon Key** - Dapatkan dari Supabase Dashboard → Settings → API  
- [ ] **Gemini API Key** - Dapatkan dari [Google AI Studio](https://makersuite.google.com/app/apikey)

### Update file `.env` lokal Anda:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

⚠️ **PENTING:** Jangan commit file `.env` ke Git! File ini sudah ada di `.gitignore`.

---

## 🗄️ 2. Database Setup (Supabase)

- [ ] Supabase project sudah dibuat
- [ ] Table `leaderboard` sudah dibuat (jalankan script dari `supabase-setup.sql`)
- [ ] Row Level Security (RLS) sudah dikonfigurasi dengan benar
- [ ] Public access untuk read sudah diaktifkan
- [ ] Authentication (jika diperlukan) sudah disetup

### Jalankan SQL Setup:

```sql
-- Buka Supabase Dashboard → SQL Editor
-- Copy paste isi dari file: supabase-setup.sql
-- Atau ikuti instruksi di SUPABASE_SETUP.md
```

---

## 🔧 3. Code Verification

- [ ] Semua import menggunakan environment variables dengan prefix `VITE_`
- [ ] Tidak ada hardcoded API keys di source code
- [ ] File `vercel.json` sudah dibuat dan dikonfigurasi
- [ ] Build script di `package.json` sudah include TypeScript check: `"build": "tsc && vite build"`

### Test Build Locally:

```bash
# Install dependencies
npm install

# Run TypeScript check
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

Jika semua berhasil tanpa error, Anda siap deploy! 🚀

---

## 📦 4. Git Repository

- [ ] Project sudah di-init sebagai Git repository
- [ ] File `.env` **TIDAK** ada di Git (cek dengan `git status`)
- [ ] Semua perubahan sudah di-commit
- [ ] Repository sudah di-push ke GitHub/GitLab/Bitbucket

```bash
# Initialize git (jika belum)
git init

# Add files
git add .

# Commit
git commit -m "chore: prepare for production deployment"

# Add remote (ganti dengan URL repo Anda)
git remote add origin https://github.com/username/blindtype-v2.git

# Push to main branch
git push -u origin main
```

---

## 🚀 5. Vercel Configuration

### Option A: Deploy via Vercel Dashboard (Recommended)

1. [ ] Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. [ ] Klik "Add New Project"
3. [ ] Import Git repository Anda
4. [ ] Vercel akan auto-detect framework sebagai **Vite**
5. [ ] Tambahkan Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`
6. [ ] Pilih environment: **Production**, **Preview**, dan **Development**
7. [ ] Klik **"Deploy"**

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Set Environment Variables via CLI:**

```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_GEMINI_API_KEY production
```

---

## 🧪 6. Post-Deployment Testing

Setelah deployment selesai, test fitur-fitur berikut:

### Core Features:
- [ ] Homepage loading dengan benar
- [ ] Virtual keyboard ditampilkan
- [ ] Audio feedback berfungsi (error chime, typing sounds)

### Blind Mode:
- [ ] Text-to-speech berfungsi
- [ ] Lives/Hearts system bekerja
- [ ] Error detection dan feedback

### Precision Mode:
- [ ] Difficulty selection (Easy, Medium, Hard, Code)
- [ ] Language selection (EN, ID)
- [ ] Backspace penalty bekerja
- [ ] WPM calculation akurat

### Leaderboard:
- [ ] Data loading dari Supabase
- [ ] Filter by mode (All, Blind, Precision)
- [ ] Score submission berhasil
- [ ] Local fallback bekerja jika Supabase down

### Analytics:
- [ ] Session history ditampilkan
- [ ] Charts dan graphs render dengan benar
- [ ] Export data berfungsi

### Profile & Settings:
- [ ] Username dan avatar dapat diubah
- [ ] Settings disimpan ke localStorage
- [ ] Dark mode toggle (jika ada)

---

## 🔍 7. Performance & SEO

- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] Meta tags sudah disetup di `index.html`
- [ ] Favicon sudah ada dan loading
- [ ] Font loading tidak blocking render

### Check Lighthouse:

1. Buka deployed site
2. Open Chrome DevTools (F12)
3. Navigate to **Lighthouse** tab
4. Run audit untuk **Mobile** dan **Desktop**

---

## 🎯 8. Security Checklist

- [ ] `.env` file **TIDAK** di-commit ke repository
- [ ] Supabase RLS policies sudah aktif
- [ ] API keys tidak exposed di client-side source code
- [ ] CORS settings di Supabase sudah dikonfigurasi untuk domain Vercel
- [ ] No sensitive data di error messages

---

## 📱 9. Cross-Browser Testing

Test di berbagai browser dan devices:

- [ ] Chrome/Edge (Desktop & Mobile)
- [ ] Firefox (Desktop & Mobile)
- [ ] Safari (Desktop & Mobile - iOS)
- [ ] Responsive design bekerja di semua screen sizes

---

## 🎨 10. Final Polish

- [ ] Update `README.md` dengan live demo URL
- [ ] Add screenshot atau GIF demo ke repository
- [ ] Update package.json metadata (name, version, description)
- [ ] Create GitHub releases/tags (optional)

---

## 🆘 Troubleshooting Common Issues

### Build Failed on Vercel

**Solution:**
```bash
# Test build locally first
npm run build

# Fix TypeScript errors
npm run lint
```

### Environment Variables Not Working

**Solution:**
- Pastikan semua env vars menggunakan prefix `VITE_`
- Redeploy setelah menambahkan env vars di Vercel
- Clear cache: Vercel Dashboard → Deployments → Redeploy

### 404 on Page Refresh

**Solution:**
- File `vercel.json` dengan rewrites sudah dikonfigurasi dengan benar
- Jika masih error, cek Vercel logs

### Supabase Connection Failed

**Solution:**
- Verifikasi URL dan Anon Key di Vercel env vars
- Cek CORS settings di Supabase Dashboard
- Test connection dengan browser DevTools console

---

## ✅ Ready to Deploy!

Jika semua checklist di atas sudah ✅, Anda siap untuk production deployment!

```bash
# Final check
npm run lint && npm run build

# If all pass, deploy!
vercel --prod
```

**Selamat! 🎉 BlindType V2 Anda sekarang live di production!**

---

**Next Steps:**
1. Share URL dengan users untuk testing
2. Monitor Vercel Analytics untuk performance insights
3. Collect user feedback
4. Iterate and improve

**Happy Typing! ⌨️✨**
