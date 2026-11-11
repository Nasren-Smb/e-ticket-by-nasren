# Tahap 04: Tiket untuk Karyawan
Status: Selesai
Branch: tahap-04-tiket-karyawan
Prasyarat: Tahap 03: Login, Logout, Session, dan Proteksi Role

## Hasil Tahap Sebelumnya (PROJECT_MAP)
- Autentikasi sesi aktif dengan `express-session`, login terverifikasi via bcrypt hash, dan proteksi peran via `requireLogin` dan `requireRole`.
- Pengguna dengan peran `employee`, `helpdesk`, dan `admin` dapat login dan diarahkan ke `/dashboard`.
- Skema database 5 tabel dan seeder data awal telah siap.

## Tujuan
Karyawan (`employee`) dapat membuat tiket kendala baru, melihat daftar tiket miliknya sendiri, dan membuka detail tiket miliknya. Karyawan tidak dapat melihat tiket milik karyawan lain (terisolasi aman).

## Cakupan (boleh dikerjakan)
- Memastikan dependensi `express-validator` terpasang
- Modul query kategori: `db/categories.js` (`listAll`)
- Modul query tiket: `db/tickets.js` (`createTicket`, `listByUser`, `findByIdForUser`) dengan penomoran transaksi kode `TKT-XXXX`
- Rute tiket karyawan: `routes/tickets.js` (`GET /tickets`, `GET /tickets/new`, `POST /tickets`, `GET /tickets/:id`) terproteksi `requireRole('employee')`
- Halaman tampilan tiket:
  - `views/tickets/index.ejs`: tabel tiket sendiri dengan status dan badge warna, state kosong
  - `views/tickets/new.ejs`: formulir pengajuan tiket dengan error validation & value retention
  - `views/tickets/show.ejs`: detail lengkap tiket dengan tombol kembali
  - `views/404.ejs`: halaman penanganan not found
- Modifikasi `app.js` untuk mendaftarkan rute tiket
- Modifikasi `views/partials/header.ejs` menampilkan link "Tiket Saya" khusus peran `employee`
- Modifikasi `db/seed.js` menambah 1 user employee kedua untuk pengujian isolasi data tiket

## Di luar cakupan (jangan disentuh)
- Edit atau hapus tiket
- Komentar tiket dan catatan internal helpdesk
- Ubah status tiket dan alur proses helpdesk/admin
- Filter, pencarian, dan paginasi tiket
- Lampiran file (upload dokumen/gambar)
- Riwayat status tiket (`ticket_status_history`)
- Laporan & analitik (Chart.js)
- Proteksi CSRF token

## File yang BOLEH dibaca
- `docs/PROJECT_MAP.md`
- `app.js`
- `middleware/auth.js`
- `routes/dashboard.js`
- `views/partials/header.ejs`
- `views/dashboard.ejs`
- `db/connection.js`
- `db/users.js`
- `db/migrations/001_init.sql`
- `db/seed.js`
- `package.json`

## File yang akan dibuat/diubah
- `issue/04-tiket-karyawan.md` (dibuat)
- `db/categories.js` (dibuat)
- `db/tickets.js` (dibuat)
- `routes/tickets.js` (dibuat)
- `views/tickets/index.ejs` (dibuat)
- `views/tickets/new.ejs` (dibuat)
- `views/tickets/show.ejs` (dibuat)
- `views/404.ejs` (dibuat)
- `views/partials/header.ejs` (diubah)
- `app.js` (diubah)
- `db/seed.js` (diubah - tambah 1 user employee kedua)
- `docs/PROJECT_MAP.md` (diubah setelah pengujian)

## Checklist tugas
- [x] Buat file issue `issue/04-tiket-karyawan.md`
- [x] Perbarui `db/seed.js` dengan employee kedua dan jalankan `npm run db:seed`
- [x] Buat modul database `db/categories.js` (`listAll`)
- [x] Buat modul database `db/tickets.js` (`createTicket` dengan transaksi format `TKT-0001`, `listByUser`, `findByIdForUser`)
- [x] Buat `views/404.ejs` untuk halaman tidak ditemukan
- [x] Buat rute `routes/tickets.js` lengkap dengan validasi `express-validator` dan proteksi `requireRole('employee')`
- [x] Buat template views `views/tickets/index.ejs`, `views/tickets/new.ejs`, dan `views/tickets/show.ejs` (dengan escaping `<%= %>`)
- [x] Daftarkan rute tiket di `app.js`
- [x] Perbarui `views/partials/header.ejs` menambahkan menu "Tiket Saya" khusus role `employee`
- [x] Jalankan pengujian isolasi tiket antar dua akun employee serta hak akses helpdesk/admin

## Cara tes manual
1. Login akun Employee 1 (`budi@perusahaan.local` / `password123`).
2. Masuk ke menu "Tiket Saya" -> halaman tabel kosong.
3. Klik "Buat Tiket Baru" (`/tickets/new`), buat tiket: Judul "Printer Paper Jam", Kategori "Hardware", Prioritas "Tinggi", Deskripsi "Kertas tersangkut".
4. Tiket berhasil dibuat dan dialihkan ke `/tickets/1` dengan kode `TKT-0001`.
5. Buka `/tickets` -> tiket `TKT-0001` tampil di daftar.
6. Logout dan login akun Employee 2 (`dewi@perusahaan.local` / `password123`).
7. Buka `/tickets` -> tabel tiket Dewi kosong (tidak melihat tiket milik Budi).
8. Coba buka langsung URL tiket Budi (`/tickets/1`) -> muncul halaman 404 (bukan 403) agar keberadaan tiket tidak bocor.
9. Buat tiket baru oleh Dewi -> mendapat kode `TKT-0002`.
10. Login akun Helpdesk (`siti@perusahaan.local`) dan Admin (`admin@perusahaan.local`), buka `/tickets` -> mendapat 403 Akses Ditolak.

## Kriteria selesai
- Employee membuat tiket, diarahkan ke detail tiket dengan format kode `TKT-0001`.
- Tiket berikutnya otomatis berkode `TKT-0002`, dan seterusnya dalam transaksi database.
- Daftar tiket hanya menampilkan tiket milik pengguna yang sedang login.
- Employee kedua yang membuka tiket employee pertama mendapat halaman 404.
- Helpdesk dan admin yang membuka `/tickets` mendapat halaman 403.
- Pengguna belum login diarahkan ke `/login`.
- Form dengan input tidak valid menampilkan pesan error per field dan mempertahankan isi input sebelumnya.
- Input berisi tag HTML/script ditampilkan sebagai teks biasa tanpa dieksekusi (ter-escape).
- Link "Tiket Saya" di header hanya muncul untuk peran `employee`.

## Catatan hasil (file diubah, pesan commit, masalah)
- **File dibuat/diubah**:
  - `db/categories.js` (dibuat)
  - `db/tickets.js` (dibuat)
  - `routes/tickets.js` (dibuat)
  - `views/tickets/index.ejs` (dibuat)
  - `views/tickets/new.ejs` (dibuat)
  - `views/tickets/show.ejs` (dibuat)
  - `views/404.ejs` (dibuat)
  - `app.js` (diubah)
  - `views/partials/header.ejs` (diubah)
  - `db/seed.js` (diubah)
  - `docs/PROJECT_MAP.md` (diubah)
  - `issue/04-tiket-karyawan.md` (dibuat)
  - `issue/README.md` (diubah)
- **Pesan commit yang disarankan**:
  `feat(tickets): implementasi pembuatan dan daftar tiket untuk peran employee`
- **Masalah & Solusi**:
  Penomoran kode tiket otomatis `TKT-XXXX` dibungkus dalam `db.transaction()` agar nomor urut terjamin unik dan tidak tumpang tindih. Penggunaan status HTTP 404 pada tiket orang lain mencegah kebocoran informasi (IDOR). Seluruh output data pengguna ditampilkan menggunakan `<%= %>` agar karakter berbahaya otomatis ter-escape dari XSS.

## Evaluasi (yang baik, yang sulit, bug, ide ke BACKLOG, waktu pengerjaan)
*(Akan diisi oleh pengguna)*
