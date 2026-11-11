# Tahap 02: Database SQLite
Status: Sedang dikerjakan
Branch: tahap-02-database
Prasyarat: Tahap 01: Server layout & halaman beranda

## Tujuan
Membuat database SQLite dengan 5 tabel relasional melalui skrip migrasi, serta mengisi data awal (seed) 3 pengguna dan 5 kategori yang aman dijalankan berulang kali.

## Cakupan (boleh dikerjakan)
- Instalasi dependensi `better-sqlite3` dan `bcrypt` (sudah terpasang di package.json)
- Penambahan variabel `DB_PATH=./db/eticket.db` pada `.env.example` dan `.env`
- Pembuatan file modul koneksi SQLite: `db/connection.js`
- Pembuatan file migrasi SQL: `db/migrations/001_init.sql` (5 tabel: users, categories, tickets, ticket_comments, ticket_status_history)
- Pembuatan migration runner: `db/migrate.js`
- Pembuatan seed runner: `db/seed.js`
- Penambahan npm scripts di `package.json`: `db:migrate` dan `db:seed`

## Di luar cakupan (jangan disentuh)
- Login, session, route atau halaman baru, query tiket, form, report
- Mengubah `app.js`, `routes/`, `views/`, `public/`
- Menggunakan ORM atau framework frontend

## File yang BOLEH dibaca
- `package.json`
- `.env.example`
- `.gitignore`

## File yang akan dibuat/diubah
- `issue/02-database.md` (dibuat)
- `.env.example` (diubah jika perlu)
- `.env` (diubah jika perlu)
- `package.json` (diubah - tambah scripts db:migrate & db:seed)
- `db/connection.js` (dibuat)
- `db/migrations/001_init.sql` (dibuat)
- `db/migrate.js` (dibuat)
- `db/seed.js` (dibuat)

## Checklist tugas
- [x] Buat file issue `issue/02-database.md`
- [ ] Verifikasi instalasi `better-sqlite3` dan `bcrypt`
- [ ] Pastikan `DB_PATH=./db/eticket.db` ada di `.env.example` dan `.env`
- [ ] Buat `db/connection.js` dengan `PRAGMA foreign_keys = ON`
- [ ] Buat `db/migrations/001_init.sql` untuk 5 tabel sesuai skema spesifikasi
- [ ] Buat `db/migrate.js` membaca dan mengeksekusi semua file `.sql` di `db/migrations/`
- [ ] Buat `db/seed.js` meng-hash password dan mengisi 3 user serta 5 kategori (idempotent / tidak duplikat)
- [ ] Tambahkan scripts `db:migrate` dan `db:seed` di `package.json`
- [ ] Jalankan `npm run db:migrate` dan `npm run db:seed`
- [ ] Verifikasi data di SQLite

## Cara tes manual
1. Jalankan migrasi: `npm run db:migrate`
2. Jalankan seeder: `npm run db:seed` (jalankan 2x untuk pastikan tidak duplikat)
3. Jalankan query tes singkat menghitung baris tabel dan melihat email serta role user.

## Kriteria selesai
- `npm run db:migrate` membuat `db/eticket.db` dengan 5 tabel.
- `npm run db:seed` mengisi 3 user dan 5 kategori; dijalankan dua kali tidak membuat duplikat.
- `password_hash` di database tersimpan berupa hash bcrypt, bukan plaintext.
- `npm run dev` tetap berjalan normal seperti sebelumnya.

## Catatan hasil (file diubah, pesan commit, masalah)
*(Akan diisi setelah konfirmasi selesai)*

## Evaluasi (yang baik, yang sulit, bug, ide ke BACKLOG, waktu pengerjaan)
*(Akan diisi setelah konfirmasi selesai)*
