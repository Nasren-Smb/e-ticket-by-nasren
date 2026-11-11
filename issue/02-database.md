# Tahap 02: Database SQLite
Status: Selesai
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
- [x] Verifikasi instalasi `better-sqlite3` dan `bcrypt`
- [x] Pastikan `DB_PATH=./db/eticket.db` ada di `.env.example` dan `.env`
- [x] Buat `db/connection.js` dengan `PRAGMA foreign_keys = ON`
- [x] Buat `db/migrations/001_init.sql` untuk 5 tabel sesuai skema spesifikasi
- [x] Buat `db/migrate.js` membaca dan mengeksekusi semua file `.sql` di `db/migrations/`
- [x] Buat `db/seed.js` meng-hash password dan mengisi 3 user serta 5 kategori (idempotent / tidak duplikat)
- [x] Tambahkan scripts `db:migrate` dan `db:seed` di `package.json`
- [x] Jalankan `npm run db:migrate` dan `npm run db:seed`
- [x] Verifikasi data di SQLite

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
- **File dibuat/diubah**:
  - `issue/02-database.md` (dokumen pelacakan tugas)
  - `package.json` (menambahkan scripts `db:migrate` dan `db:seed`)
  - `db/connection.js` (koneksi database SQLite dengan penegakan foreign keys)
  - `db/migrations/001_init.sql` (skema DDL 5 tabel: users, categories, tickets, ticket_comments, ticket_status_history)
  - `db/migrate.js` (skrip migrasi)
  - `db/seed.js` (skrip seeder dengan hashing password via bcrypt)
  - `db/README.md` (dihapus/dibersihkan)
- **Pesan commit yang disarankan**:
  `feat(db): setup koneksi sqlite, skema migrasi 5 tabel, dan seeder data awal`
- **Masalah & Solusi**: Tidak ada kendala. Skema menggunakan DDL SQL standar dengan `CREATE TABLE IF NOT EXISTS` dan seeder menggunakan `INSERT OR IGNORE` sehingga aman dijalankan berulang.

## Evaluasi (yang baik, yang sulit, bug, ide ke BACKLOG, waktu pengerjaan)
- **Yang baik**: Skema dirancang dengan integritas data yang ketat (CHECK constraints dan Foreign Key cascades/restricts), idempotent seeder menjamin data tidak terduplikasi saat dijalankan ulang, hashing password bcrypt berjalan mulus.
- **Yang sulit**: Tidak ada kesulitan berarti, seluruh skrip sederhana dan mudah dipahami pemula.
- **Bug**: Tidak ditemukan bug.
- **Ide ke BACKLOG**: Penambahan rollback migration (`down.sql`) jika sewaktu-waktu dibutuhkan perombakan skema.
- **Waktu pengerjaan**: ~10 menit.
