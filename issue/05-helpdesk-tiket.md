# Tahap 05: Tiket untuk Helpdesk
Status: Selesai
Branch: tahap-05-helpdesk-tiket
Prasyarat: Tahap 04: Tiket untuk Karyawan

## Hasil Tahap Sebelumnya (PROJECT_MAP)
- Karyawan (`employee`) dapat membuat tiket dengan kode urut otomatis `TKT-0001`, `TKT-0002` dalam transaksi database, melihat daftar tiket miliknya sendiri, dan melihat detail tiketnya.
- Isolasi tiket antar-karyawan teruji aman (mencoba membuka tiket karyawan lain menghasilkan respons 404).
- Database 5 tabel, seeder 4 user (2 employee, 1 helpdesk, 1 admin), serta middleware session dan role telah beroperasi.

## Tujuan
Petugas helpdesk dapat melihat seluruh tiket dari semua karyawan, memfilter berdasarkan status dan mencari berdasarkan kode atau judul, mengambil tiket (menetapkan diri sebagai petugas `assigned_to` dan mengubah status ke 'Diproses'), serta mengubah status sesuai alur transisi resmi (`ALLOWED_TRANSITIONS`). Setiap perubahan status tercatat secara otomatis ke tabel `ticket_status_history`.

## Cakupan (boleh dikerjakan)
- Menambahkan fungsi di `db/tickets.js`:
  - `listAll({ status, q })`: mengambil semua tiket dengan join kategori, pembuat, dan petugas; mendukung filter status dan pencarian q (LIKE dengan parameter binding); urut terbaru; LIMIT 200.
  - `findById(id)`: satu tiket dengan join yang sama + divisi pembuat.
  - `assignToUser(id, userId)`: transaksi database mengambil tiket jika belum diambil dan status 'Baru', mengubah status ke 'Diproses', dan mencatat history.
  - `changeStatus(id, newStatus, userId)`: transaksi database mengubah status jika user adalah petugas tiket dan status baru valid sesuai `ALLOWED_TRANSITIONS`, mengisi `closed_at` saat 'Ditutup', dan mencatat history.
  - Constant `ALLOWED_TRANSITIONS`:
    - `Baru` -> `['Diproses']`
    - `Diproses` -> `['Selesai']`
    - `Selesai` -> `['Ditutup', 'Diproses']`
    - `Ditutup` -> `[]`
- Membuat modul query riwayat: `db/ticketHistory.js` dengan fungsi `listByTicket(ticketId)`.
- Membuat modul rute helpdesk: `routes/helpdesk.js`:
  - `GET /helpdesk/tickets` (daftar tiket dengan query `status` dan `q`)
  - `GET /helpdesk/tickets/:id` (detail tiket + riwayat status)
  - `POST /helpdesk/tickets/:id/assign` (ambil tiket)
  - `POST /helpdesk/tickets/:id/status` (ubah status)
  - Semua rute terproteksi `requireRole('helpdesk')`.
- Membuat views:
  - `views/helpdesk/index.ejs`: tabel daftar tiket, form filter (status + pencarian q + tombol cari & reset), badge warna status & prioritas, tampilan kosong jika tidak ada tiket.
  - `views/helpdesk/show.ejs`: detail tiket, timeline riwayat status, tombol "Ambil tiket" (jika belum ada petugas), form dropdown status (hanya status yang diizinkan, hanya untuk petugas pemilik tiket), dan pesan flash.
- Memperbarui `app.js`: daftarkan `routes/helpdesk.js` dan middleware flash kecil (`req.session.flash` ke `res.locals.flash`).
- Memperbarui `views/partials/header.ejs`: link "Semua Tiket" (`/helpdesk/tickets`) hanya untuk peran `helpdesk`.
- Memperbarui `db/seed.js`: menambah 1 user helpdesk kedua (`eko@perusahaan.local`) agar pengujian proteksi antar-petugas dapat diverifikasi.

## Di luar cakupan (jangan disentuh)
- Komentar dan catatan internal (Tahap 06)
- Melepas atau mengoper tiket ke petugas lain
- Mengubah prioritas atau kategori
- Paginasi daftar tiket
- Akses admin ke antrean tiket (atau modifikasi `requireRole` di luar 'helpdesk')
- Laporan dan grafik analitik Chart.js (Tahap 07)
- CSRF token
- Mengubah `db/migrations/`, skema database, `routes/tickets.js`, atau `views/tickets/`

## File yang BOLEH dibaca
- `docs/PROJECT_MAP.md`
- `app.js`
- `middleware/auth.js`
- `routes/tickets.js`
- `db/tickets.js`
- `db/connection.js`
- `db/migrations/001_init.sql`
- `db/seed.js`
- `views/partials/header.ejs`
- `views/tickets/index.ejs`
- `package.json`

## File yang akan dibuat/diubah
- `issue/05-helpdesk-tiket.md` (dibuat)
- `db/ticketHistory.js` (dibuat)
- `routes/helpdesk.js` (dibuat)
- `views/helpdesk/index.ejs` (dibuat)
- `views/helpdesk/show.ejs` (dibuat)
- `db/tickets.js` (diubah)
- `db/seed.js` (diubah)
- `app.js` (diubah)
- `views/partials/header.ejs` (diubah)
- `docs/PROJECT_MAP.md` (diubah setelah pengujian)
- `issue/README.md` (diubah setelah pengujian)

## Checklist tugas
- [x] Buat file issue `issue/05-helpdesk-tiket.md`
- [x] Perbarui `db/seed.js` dengan helpdesk kedua (`eko@perusahaan.local`) dan jalankan `npm run db:seed`
- [x] Buat modul database `db/ticketHistory.js` (`listByTicket`)
- [x] Perbarui `db/tickets.js` (`ALLOWED_TRANSITIONS`, `listAll`, `findById`, `assignToUser`, `changeStatus`)
- [x] Buat rute `routes/helpdesk.js` terproteksi `requireRole('helpdesk')` dan penanganan flash message
- [x] Buat tampilan `views/helpdesk/index.ejs` dan `views/helpdesk/show.ejs`
- [x] Perbarui `app.js` dengan middleware flash dan registrasi `routes/helpdesk.js`
- [x] Perbarui `views/partials/header.ejs` dengan link "Semua Tiket" khusus helpdesk
- [x] Lakukan verifikasi pengujian: filter & pencarian, ambil tiket, tolak ambil tiket yang sudah diambil helpdesk lain, perubahan status sah/tidak sah, pencatatan status history, pengisian `closed_at`, dan proteksi akses employee/admin

## Cara tes manual
1. Login akun Helpdesk 1 (`siti@perusahaan.local` / `password123`):
   - Buka menu "Semua Tiket" (`/helpdesk/tickets`) -> tampil tiket milik Budi dan Dewi.
   - Coba filter status (misal: "Baru") dan cari kode/judul tiket -> hasil filter akurat.
   - Buka tiket status 'Baru' yang belum ada petugas -> tombol "Ambil tiket" muncul.
   - Klik "Ambil tiket" -> status menjadi 'Diproses', petugas menjadi 'Siti Helpdesk', tercatat di riwayat.
   - Pada dropdown status, hanya opsi "Selesai" yang muncul. Ubah ke "Selesai" -> status berubah dan history bertambah.
2. Login akun Helpdesk 2 (`eko@perusahaan.local` / `password123`):
   - Buka tiket yang sedang ditangani Siti -> tombol "Ambil tiket" dan dropdown status TIDAK muncul.
   - Coba kirim POST assign atau status langsung -> server menolak aksi.
3. Helpdesk 1 (`siti@perusahaan.local`):
   - Ubah tiket dari "Selesai" ke "Ditutup" -> kolom `closed_at` terisi dan riwayat status tercatat lengkap.
4. Login akun Employee (`budi@perusahaan.local`) atau Admin (`admin@perusahaan.local`):
   - Buka `/helpdesk/tickets` -> mendapat respon 403 Akses Ditolak.
   - Halaman employee (`/tickets`) tetap berfungsi normal.

## Kriteria selesai
- Petugas helpdesk dapat melihat seluruh tiket dari semua employee.
- Filter status dan pencarian bekerja baik secara terpisah maupun gabungan.
- Aksi "Ambil tiket" mengubah status menjadi 'Diproses', menetapkan petugas, dan mencatat riwayat di `ticket_status_history`.
- Petugas lain tidak dapat mengambil tiket yang sudah diambil dan tidak dapat mengubah statusnya.
- Transisi status yang tidak sesuai `ALLOWED_TRANSITIONS` ditolak oleh server.
- Mengubah status ke 'Ditutup' mengisi kolom `closed_at`.
- Linimasa riwayat status tampil berurutan di halaman detail tiket.
- Akses `/helpdesk/*` hanya untuk peran `helpdesk` (role lain mendapat 403, tamu diarahkan ke `/login`).
- Halaman `/tickets` untuk karyawan tetap berjalan seperti semula.
- Menu "Semua Tiket" hanya tampil di navbar untuk peran `helpdesk`.

## Catatan hasil (file diubah, pesan commit, masalah)
- **File dibuat/diubah**:
  - `issue/05-helpdesk-tiket.md` (dibuat)
  - `db/ticketHistory.js` (dibuat)
  - `routes/helpdesk.js` (dibuat)
  - `views/helpdesk/index.ejs` (dibuat)
  - `views/helpdesk/show.ejs` (dibuat)
  - `db/tickets.js` (diubah)
  - `db/seed.js` (diubah)
  - `app.js` (diubah)
  - `views/partials/header.ejs` (diubah)
  - `routes/tickets.js` (diubah)
  - `docs/PROJECT_MAP.md` (diubah)
  - `issue/README.md` (diubah)
- **Pesan commit yang disarankan**:
  `feat(helpdesk): implementasi antrean tiket, penugasan, filter, dan perubahan status helpdesk`
- **Masalah & Solusi**:
  Semua operasi transaksi penugasan (`assignToUser`) dan pembaruan status (`changeStatus`) berjalan secara atomic menggunakan `db.transaction()` sehingga integritas data dan pencatatan ke `ticket_status_history` selalu sinkron. Pemisahan middleware pada rute spesifik menjamin isolasi hak akses peran `helpdesk` dan `employee` tetap akurat.

## Evaluasi (yang baik, yang sulit, bug, ide ke BACKLOG, waktu pengerjaan)
*(Akan diisi oleh pengguna)*
