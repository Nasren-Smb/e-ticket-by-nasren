# Tahap 01: Server layout & halaman beranda
Status: Sedang dikerjakan
Branch: tahap-01-server-layout
Prasyarat: Tahap 00: Setup repo

## Tujuan
Menyiapkan server Express, konfigurasi view engine EJS, layout dasar menggunakan Bootstrap 5 dan Bootstrap Icons, serta halaman beranda awal.

## Cakupan (boleh dikerjakan)
- Inisialisasi Express server di `app.js`
- Konfigurasi file statis (`public/css/style.css`, `public/js/main.js`)
- Penyiapan layout dan views (`views/index.ejs`, `views/partials/header.ejs`, `views/partials/footer.ejs`)
- Modul router placeholder di `routes/`
- Dependensi di `package.json` dan `package-lock.json`

## Di luar cakupan (jangan disentuh)
- Koneksi dan skema database SQLite (users, categories, tickets, dll.)
- Logika otentikasi login/register
- Fitur helpdesk dan admin

## Checklist tugas
- [x] Siapkan server Express di `app.js`
- [x] Buat layout Bootstrap 5 dan template beranda di `views/`
- [x] Buat styling dan skrip statis di `public/`
- [x] Daftarkan dependensi di `package.json`

## Cara tes manual
1. Jalankan `npm run dev` atau `node app.js`.
2. Buka `http://localhost:3000` di browser.
3. Pastikan halaman beranda tampil dengan layout Bootstrap 5.

## Kriteria selesai
- Server berjalan di port yang ditentukan.
- Halaman beranda dapat diakses dengan respons HTTP 200.

## Catatan hasil (file diubah, pesan commit, masalah)
*(Akan diisi setelah konfirmasi selesai)*

## Evaluasi (yang baik, yang sulit, bug, ide ke BACKLOG, waktu pengerjaan)
*(Akan diisi setelah konfirmasi selesai)*

