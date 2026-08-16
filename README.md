<div align="center">

  <!-- Logo Project -->
  <img src="public/logo.png" alt="AccuType Logo" width="140" />

  <h1>🎯 AccuType</h1>

  <p><b>Type. Refine. Master Accuracy.</b></p>
  <p>Platform gamifikasi latihan mengetik yang berfokus pada <b>akurasi, memori otot (blind typing)</b>, dan presisi pengetikan tanpa bergantung pada kecepatan (WPM).</p>

  <!-- Badges -->
  <p>
    <a href="#"><img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js"></a>
    <a href="#"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
    <a href="#"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"></a>
    <a href="#"><img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion"></a>
    <a href="#"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License"></a>
  </p>

  <!-- Quick Links -->
  <p>
    <a href="#-overview">Overview</a> •
    <a href="#-fitur-utama">Fitur Utama</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-instalasi--cara-menjalankan">Cara Instalasi</a> •
    <a href="#-lisensi">Lisensi</a>
  </p>

</div>

---

## 📌 Overview

> [!NOTE]
> **AccuType** dirancang khusus untuk membangun *muscle memory* dan meminimalisir *typo*, bukan sekadar mengejar kecepatan WPM (Words Per Minute).

Berbeda dengan platform pengetikan tradisional seperti Monkeytype atau TypingClub, AccuType mengusung konsep **gamifikasi interaktif ala Duolingo**. Platform ini memandu pengguna melalui latihan pejam mata (*blind typing*) menggunakan *audio feedback* real-time serta latihan presisi kata (*precision mode*).

---

## 🚀 Fitur Utama

| Fitur | Deskripsi |
| :--- | :--- |
| **🙈 Blind Typing Mode** | Pengguna diinstruksikan memejamkan mata. Teks dibacakan via TTS/Audio cue dan suara mekanikal/error chime memberikan feedback instan saat terjadi kesalahan. |
| **🎯 Precision Mode** | Latihan berdasarkan tingkat kesulitan (Easy, Medium, Hard/Code Snippets) dan bahasa dengan penalti khusus untuk *backspace* & kesalahan. |
| **🎮 Gamification Engine** | Sistem nyawa (*Hearts/Lives*), *streak* harian, serta *leaderboard* yang disusun berdasarkan persentase akurasi tertinggi. |
| **📱 Duolingo-style Onboarding** | Alur pendaftaran bertahap dengan animasi interaktif untuk personalisasi target harian dan tes penempatan awal. |

> [!TIP]
> Pastikan volume/audio komputer Anda aktif untuk mendengarkan *error chime* dan cue suara saat berada di **Blind Typing Mode**.

---

## 🛠️ Tech Stack

*   **Framework:** Next.js 14 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Animations:** Framer Motion
*   **Audio Engine:** Howler.js / Web Audio API
*   **Database & Auth:** Supabase / Firebase

---

## 📂 Struktur Direktori

<details>
<summary><b>🔍 Klik di sini untuk melihat Struktur Folder Proyek</b></summary>

```text
accutype/
├── src/
│   ├── app/              # Next.js App Router (Onboarding, Dashboard, Game Modes)
│   ├── components/       # UI Components (VirtualKeyboard, AccuracyMeter, Hearts)
│   ├── hooks/            # Custom Hooks (useTypingEngine, useSoundFX)
│   ├── lib/              # Utility Functions & Audio Setup
│   └── styles/           # Global Styles & Tailwind Configuration
├── public/               # Sound Effects, Icons, and Logos
└── README.md
