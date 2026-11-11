# Tahap 00: Setup repo
Status: Selesai
Branch: tahap-00-setup-repo
Prasyarat: Tidak ada

## Tujuan
Menyiapkan struktur direktori awal proyek, konfigurasi Node.js (package.json), dependensi dasar, template environment (.env & .env.example), .gitignore, dan file server awal (app.js) yang dapat berjalan dengan Express dan EJS.

## Cakupan (boleh dikerjakan)
- Inisialisasi `package.json` dan instalasi dependensi:
  - Runtime: `express`, `ejs`, `better-sqlite3`, `dotenv`, `express-validator`, `express-session`, `bcrypt`
  - Dev/Ops: `nodemon` (opsional untuk kemudahan development)
- Pembuatan file konfigurasi: `.gitignore`, `.env.example`, `.env`
- Pembuatan struktur folder dasar:
  - `issue/` (dokumentasi pengerjaan)
  - `db/` (file query & skema database)
  - `public/` (`css/`, `js/`)
  - `views/` (`partials/`)
  - `routes/`
- Pembuatan file entrypoint `app.js` sederhana untuk memastikan server berjalan dengan baik.

## Di luar cakupan (jangan disentuh)
- Skema tabel database lengkap dan migration (dikerjakan di Tahap 01)
- Alur otentikasi login/register/session logic (dikerjakan di Tahap 02)
- Fitur tiket, komentar, dashboard report
- Menambah framework frontend di luar Bootstrap 5 & vanilla JS

## Checklist tugas
- [x] Buat file issue `issue/00-setup-repo.md`, `issue/README.md`, dan `issue/BACKLOG.md`
- [x] Inisialisasi `package.json` dengan dependensi yang dibutuhkan
- [x] Buat file `.gitignore`
- [x] Buat file `.env.example` dan salin ke `.env`
- [x] Buat struktur folder proyek (`db`, `public/css`, `public/js`, `views/partials`, `routes`)
- [x] Buat `app.js` dan halaman pengujian sederhana (`views/index.ejs`)
- [x] Jalankan tes manual server berjalan di port lokal

## Cara tes manual
1. Jalankan `npm install` (jika belum selesai).
2. Jalankan `npm run dev` atau `node app.js`.
3. Buka browser ke `http://localhost:3000`.
4. Pastikan muncul halaman sambutan E-Ticket IT Helpdesk dengan tampilan Bootstrap 5 yang rapi.

## Kriteria selesai
- Server Express dapat menyala tanpa error.
- Halaman root (`/`) merespons dengan kode status 200 dan merender view EJS dengan styling Bootstrap.
- Semua dependensi yang disyaratkan terpasang di `package.json`.

## Catatan hasil (file diubah, pesan commit, masalah)
- **File dibuat/diubah**:
  - `issue/00-setup-repo.md`
  - `issue/README.md`
  - `issue/BACKLOG.md`
  - `.gitignore`
  - `.env.example`
  - `.env`
  - `package.json`
  - `app.js`
  - `views/index.ejs`
  - `views/partials/header.ejs`
  - `views/partials/footer.ejs`
  - `public/css/style.css`
  - `public/js/main.js`
  - `db/README.md`
  - `routes/README.md`
- **Pesan commit yang disarankan**:
  `feat(setup): inisialisasi repositori dan fondasi server express tahap 00`
- **Masalah & Solusi**:
  - Pada lingkungan Node.js v24 di Windows, instalasi `better-sqlite3` versi lama membutuhkan kompilasi native C++ yang gagal karena keterbatasan toolchain Visual Studio. Solusinya: menggunakan rilis terbaru `better-sqlite3@13.0.3` yang menyediakan prebuilt binary untuk runtime target sehingga instalasi berjalan lancar tanpa error build.

## Evaluasi (yang baik, yang sulit, bug, ide ke BACKLOG, waktu pengerjaan)
- **Yang baik**: Struktur dasar folder dan arsitektur Express + EJS tersusun bersih, pemisahan partials rapi, Bootstrap 5 dan Bootstrap Icons terintegrasi dengan CDN resmi tanpa beban asset lokal yang besar.
- **Yang sulit**: Penyesuaian versi pustaka native Node.js (`better-sqlite3` dan `bcrypt`) di Windows x64 dengan Node v24.
- **Bug ditemukan**: Tidak ada. Server berjalan dan merespons HTTP 200.
- **Ide ke BACKLOG**: Pengaturan konfigurasi SSL/TLS lokal (HTTPS) jika dibutuhkan di masa mendatang.
- **Waktu pengerjaan**: ~15 menit.

