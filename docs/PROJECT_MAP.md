# Peta Proyek (PROJECT_MAP.md)

## Ringkasan & Cara Menjalankan
Aplikasi pelaporan tiket kendala IT untuk Karyawan dan tim IT Helpdesk berbasis web.
- `npm run db:migrate` : Menjalankan migrasi DDL 5 tabel ke database SQLite.
- `npm run db:seed`    : Mengisi data awal akun default & kategori (idempotent).
- `npm run dev`        : Menjalankan server lokal dengan nodemon di `http://localhost:3000`.
- `npm start`          : Menjalankan server production dengan node standar.

## Peta File
- `app.js`: Inisialisasi Express, view engine EJS, static assets, dan rute root.
- `package.json`: Konfigurasi dependensi runtime, devDependencies, dan script eksekusi.
- `.env.example`: Template variabel lingkungan (PORT, SESSION_SECRET, DB_PATH).
- `.gitignore`: Daftar file & folder yang diabaikan Git (node_modules, .env, *.db).
- `AGENTS.md`: Panduan aturan kerja, alur membaca, dan instruksi bagi AI agent.
- `db/connection.js`: Modul koneksi better-sqlite3 dengan `PRAGMA foreign_keys = ON`.
- `db/migrations/001_init.sql`: Skema DDL 5 tabel relational database.
- `db/migrate.js`: Runner otomatis untuk menjalankan seluruh file migrasi SQL.
- `db/seed.js`: Runner data awal (3 user role berbeda ber-hash bcrypt, 5 kategori).
- `routes/README.md`: Penanda folder router modular (belum ada file rute terpisah).
- `views/index.ejs`: Halaman beranda utama dengan layout Bootstrap 5.
- `views/partials/header.ejs`: Komponen navigasi atas (navbar).
- `views/partials/footer.ejs`: Komponen copyright bawah (footer).
- `public/css/style.css`: Stylesheet kustom pelengkap Bootstrap.
- `public/js/main.js`: Script kustom sisi klien.
- `issue/README.md`: Indeks daftar tahapan pengerjaan proyek.
- `issue/BACKLOG.md`: Catatan ide fitur lanjutan di luar cakupan bertahap.
- `issue/00-setup-repo.md`: Catatan pengerjaan Tahap 00.
- `issue/01-server-layout.md`: Catatan pengerjaan Tahap 01.
- `issue/02-database.md`: Catatan pengerjaan Tahap 02.

## Route yang Ada
- `GET /` : Menampilkan halaman beranda (controller langsung di `app.js`).

## Ringkasan Skema Database
- `users`: `id` (PK), `nama`, `email` (UQ), `password_hash`, `divisi`, `role` (employee/helpdesk/admin), `created_at`.
- `categories`: `id` (PK), `nama` (UQ).
- `tickets`: `id` (PK), `kode` (UQ), `judul`, `deskripsi`, `category_id` (FK), `created_by` (FK), `assigned_to` (FK NULL), `prioritas` (Rendah/Sedang/Tinggi/Urgent), `status` (Baru/Diproses/Selesai/Ditutup), `created_at`, `updated_at`, `closed_at`.
- `ticket_comments`: `id` (PK), `ticket_id` (FK CASCADE), `user_id` (FK), `isi`, `is_internal` (0/1), `created_at`.
- `ticket_status_history`: `id` (PK), `ticket_id` (FK CASCADE), `status_lama`, `status_baru`, `diubah_oleh` (FK), `created_at`.

## Cara Bootstrap Dimuat
- Dimuat melalui CDN di `views/index.ejs`:
  - CSS: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css`
  - Icons: `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css`
  - JS Bundle: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js`

## Konvensi
- Tidak menggunakan ORM; seluruh query SQL terisolasi di folder `db/`.
- Tidak menggunakan framework frontend JS (React/Vue); render menggunakan EJS.
- Password wajib di-hash menggunakan `bcrypt`.
- Penamaan branch mengikuti format `tahap-NN-nama`.

## Belum Ada
- Sistem autentikasi & session (login/logout).
- Middleware otorisasi berbasis peran (employee/helpdesk/admin).
- Router modular terpisah di folder `routes/`.
- Formulir dan endpoint pembuatan atau pemrosesan tiket.
- Visualisasi laporan chart analitik (Chart.js).

