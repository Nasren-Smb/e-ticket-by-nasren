# Issue 07: Halaman Report dengan Chart.js

## Status
Selesai

## Branch
`tahap-07-dashboard-reporting`

## Prasyarat
Tahap 06 selesai (fitur komentar dan catatan internal sudah berjalan dan terisolasi dengan aman).

## Hasil Tahap Sebelumnya (dari PROJECT_MAP)
- Sistem komentar tiket publik untuk employee dan helpdesk.
- Catatan internal khusus staf helpdesk terisolasi di level database query (`is_internal = 0` untuk employee).
- Audit trail transisi status lengkap di `ticket_status_history`.

## Tujuan
Helpdesk dan admin dapat melihat metrik ringkasan tiket (KPI), grafik distribusi tiket menggunakan Chart.js, beban kerja petugas, serta mendeteksi tiket lama yang belum selesai di rute `/reports`. Karyawan (`employee`) dilarang mengakses halaman ini (HTTP 403), dan tamu diarahkan ke `/login`.

## Cakupan
1. Membuat modul query `db/reports.js` dengan fungsi:
   - `getSummary()`: menghitung total tiket, jumlah per status, dan rata-rata waktu penyelesaian tiket (jam).
   - `countByStatus()`: menghitung tiket per status (urutan tetap: Baru, Diproses, Selesai, Ditutup; default 0 jika kosong).
   - `countByCategory()`: menghitung tiket per kategori (termasuk kategori tanpa tiket).
   - `countByMonthLast12()`: menghitung tren tiket masuk 12 bulan terakhir.
   - `workloadByAgent()`: menghitung beban kerja per petugas helpdesk (tiket Diproses, Selesai, Ditutup).
   - `listStale(limit)`: daftar tiket berstatus Baru/Diproses yang belum selesai lebih dari 7 hari.
2. Membuat rute `routes/reports.js` (`GET /reports`) dengan proteksi `requireLogin` dan `requireRole('helpdesk', 'admin')`.
3. Mendaftarkan rute laporan di `app.js`.
4. Menambahkan tautan navigasi "Report" di `views/partials/header.ejs` khusus untuk peran `helpdesk` dan `admin`.
5. Membuat tampilan `views/reports/index.ejs`:
   - Kartu metrik ringkasan (Total, Baru, Diproses, Selesai, Ditutup, Rata-rata Waktu Penyelesaian).
   - 3 canvas grafik: Status (Doughnut), Kategori (Horizontal Bar), Tren Bulanan (Line/Bar).
   - Tabel Beban Kerja Petugas.
   - Tabel Tiket Lama (> 7 hari belum selesai).
   - Penanganan kondisi jika belum ada tiket sama sekali (`total === 0`).
6. Membuat `public/js/report.js` untuk membaca data canvas via atribut `data-*` dan menginisialisasi Chart.js (dengan `maintainAspectRatio: false`).
7. Memuat Chart.js CDN versi tersemat (pinned version: `chart.js@4.4.7`) hanya pada halaman report.
8. Membuat skrip seed data demo `db/seed-demo.js` (~30 tiket dengan prefix `[DEMO]`) beserta script npm `"db:seed-demo"`.

## Di Luar Cakupan
- Ekspor laporan ke PDF/Excel/CSV.
- Pengaturan filter kustom rentang tanggal dinamis.
- Akses halaman report untuk peran `employee`.

## File yang BOLEH Dibaca
- `AGENTS.md`
- `docs/PROJECT_MAP.md`
- `issue/06-komentar.md`
- `app.js`
- `routes/tickets.js`
- `routes/helpdesk.js`
- `middleware/auth.js`
- `db/connection.js`
- `db/tickets.js`
- `db/categories.js`
- `db/users.js`
- `views/partials/header.ejs`
- `views/partials/footer.ejs`

## File yang Akan Dibuat/Diubah
- `issue/07-report.md` (Dibuat)
- `db/reports.js` (Dibuat)
- `routes/reports.js` (Dibuat)
- `views/reports/index.ejs` (Dibuat)
- `public/js/report.js` (Dibuat)
- `db/seed-demo.js` (Dibuat)
- `package.json` (Diubah)
- `app.js` (Diubah)
- `views/partials/header.ejs` (Diubah)
- `issue/README.md` (Diubah)
- `docs/PROJECT_MAP.md` (Diubah)

## Checklist
- [x] Buat file issue `issue/07-report.md`
- [x] Implementasikan query statistik di `db/reports.js`
- [x] Buat skrip data demo di `db/seed-demo.js` dan tambahkan script npm di `package.json`
- [x] Jalankan skrip demo `npm run db:seed-demo`
- [x] Buat router `routes/reports.js` dan proteksi role `helpdesk`, `admin`
- [x] Daftarkan router di `app.js`
- [x] Perbarui `views/partials/header.ejs` untuk menu Report
- [x] Buat view `views/reports/index.ejs` dan client script `public/js/report.js`
- [x] Lakukan pengujian otomatis (auth check, render data, penanganan 0 data)
- [x] Perbarui dokumentasi `docs/PROJECT_MAP.md` dan `issue/README.md`

## Cara Tes
1. Pastikan database memiliki data dengan menjalankan `npm run db:seed-demo`.
2. Login sebagai employee (`budi@perusahaan.local` / `password123`), akses `/reports` -> pastikan mendapat HTTP 403 Forbidden.
3. Login sebagai helpdesk (`siti@perusahaan.local` / `password123`), akses `/reports` -> pastikan ringkasan angka, 3 grafik Chart.js, tabel beban kerja, dan tabel tiket lama tampil dengan baik. Klik salah satu tiket lama, pastikan diarahkan ke `/helpdesk/tickets/:id`.
4. Login sebagai admin (`admin@perusahaan.local` / `password123`), akses `/reports` -> pastikan halaman terbuka dengan normal dan tautan tiket lama tidak berupa link aktif.
5. Akses `/reports` tanpa login -> pastikan diarahkan ke `/login`.

## Kriteria Selesai
1. Halaman `/reports` hanya dapat diakses oleh peran `helpdesk` dan `admin`.
2. Seluruh metrik KPI dan data grafik dihitung secara akurat lewat query database dengan parameter binding.
3. Chart.js dimuat dari CDN pinned version dan grafik ter-render tanpa error console.
4. Semua data pengguna di-escape (`<%= %>`) pada atribut data canvas.
5. Server development tidak dibiarkan berjalan di background setelah pengujian.

## Catatan Hasil
1. **File yang Dibuat**:
   - `db/reports.js`: Modul query data statistik dan metrik analitik reporting.
   - `db/seed-demo.js`: Skrip pembuat 32 data tiket demo untuk grafik pelaporan.
   - `routes/reports.js`: Rute `GET /reports` terproteksi untuk helpdesk & admin.
   - `views/reports/index.ejs`: Template tampilan dashboard analitik & Chart.js canvas.
   - `public/js/report.js`: Client JS pembuat grafik Doughnut, Bar, dan Line Chart.
2. **File yang Diubah**:
   - `package.json`: Menambahkan script `"db:seed-demo"`.
   - `app.js`: Mendaftarkan middleware `reportRoutes`.
   - `views/partials/header.ejs`: Menambahkan tautan menu "Report" bagi helpdesk & admin.
   - `docs/PROJECT_MAP.md`: Memperbarui peta arsitektur dan status Tahap 07.
   - `issue/README.md`: Memperbarui status pengerjaan Tahap 07 menjadi Selesai.
3. **Pesan Commit yang Disarankan**:
   - `feat(report): tambahkan dashboard pelaporan dan visualisasi grafik chart.js`

## Evaluasi
(Diisi oleh pengguna)
