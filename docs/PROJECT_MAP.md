# Peta Proyek (docs/PROJECT_MAP.md)

## 1. Ringkasan
Aplikasi web pelaporan E-Ticket IT Helpdesk untuk karyawan mengajukan tiket kendala dan tim IT Helpdesk memprosesnya. Stack: Node.js, Express, EJS, Bootstrap 5 (CDN), SQLite (better-sqlite3), bcrypt, express-session, express-validator.

## 2. Cara Menjalankan
Perintah riil sesuai `package.json`:
- Inisialisasi DB: `npm run db:migrate` (membuat 5 tabel SQLite dari `db/migrations/*.sql`).
- Isi data awal: `npm run db:seed` (mengisi 5 user dan 5 kategori; aman dijalankan berulang tanpa duplikat).
- Server development: `npm run dev` (menjalankan nodemon pada port 3000).
- Server production: `npm start` (menjalankan `node app.js`).

## 3. Alur Satu Request
Request HTTP -> `express.static('public')` -> `express.urlencoded` & `express.json` -> middleware `session` -> middleware custom `res.locals.user` & `res.locals.flash` -> Router (`routes/*.js`) -> [middleware `requireLogin` / `requireRole`] -> Controller memanggil query `db/*.js` -> Render view EJS dengan data & partials ter-escape (`<%= %>`) -> Response HTML.

## 4. Peta File (1 Baris Per File)
- `AGENTS.md`: Aturan pengerjaan, alur baca, instruksi lingkungan, dan larangan git bagi agent.
- `app.js`: Entry point Express, konfigurasi session, middleware globals/flash, dan pendaftaran rute.
- `package.json`: Definisi dependensi npm dan scripts (`start`, `dev`, `db:migrate`, `db:seed`).
- `.env.example`: Template konfigurasi env (`PORT`, `SESSION_SECRET`, `NODE_ENV`, `DB_PATH`).
- `.gitignore`: Mengabaikan `node_modules/`, `.env`, `*.db`, `*.db-journal`, `*.log`.
- `db/connection.js`: Inisialisasi better-sqlite3 dari `DB_PATH` dengan `PRAGMA foreign_keys = ON`.
- `db/migrations/001_init.sql`: Skema DDL 5 tabel (users, categories, tickets, ticket_comments, ticket_status_history).
- `db/migrate.js`: Runner eksekusi file migrasi SQL di folder `db/migrations/`.
- `db/seed.js`: Seeder data 5 pengguna (hash bcrypt) dan 5 kategori default (idempotent).
- `db/users.js`: Helper query tabel users (`findByEmail`, `findById`).
- `db/categories.js`: Helper query tabel categories (`listAll`).
- `db/tickets.js`: Helper query tiket (`ALLOWED_TRANSITIONS`, `createTicket`, `listByUser`, `findByIdForUser`, `listAll`, `findById`, `assignToUser`, `changeStatus`).
- `db/ticketHistory.js`: Helper query riwayat perubahan status tiket (`listByTicket`).
- `middleware/auth.js`: Middleware otentikasi `requireLogin` dan otorisasi peran `requireRole`.
- `routes/auth.js`: Endpoint login form, autentikasi akun, dan logout (`/login`, `/logout`).
- `routes/dashboard.js`: Endpoint halaman dashboard pengguna terotentikasi (`/dashboard`).
- `routes/tickets.js`: Endpoint tiket karyawan (`GET /tickets`, `GET /tickets/new`, `POST /tickets`, `GET /tickets/:id`).
- `routes/helpdesk.js`: Endpoint tiket helpdesk (`GET /helpdesk/tickets`, `GET /helpdesk/tickets/:id`, `POST /helpdesk/tickets/:id/assign`, `POST /helpdesk/tickets/:id/status`).
- `routes/admin.js`: Endpoint placeholder halaman khusus role admin (`/admin`).
- `routes/README.md`: Catatan modul routing Express.
- `views/index.ejs`: Halaman beranda publik.
- `views/login.ejs`: Halaman formulir login akun.
- `views/dashboard.ejs`: Halaman dashboard pengguna menampilkan nama dan role.
- `views/tickets/index.ejs`: Halaman daftar tiket milik pengguna yang sedang login.
- `views/tickets/new.ejs`: Formulir pembuatan tiket kendala baru karyawan.
- `views/tickets/show.ejs`: Halaman detail informasi tiket milik karyawan.
- `views/helpdesk/index.ejs`: Halaman antrean semua tiket untuk petugas helpdesk (filter status & pencarian q).
- `views/helpdesk/show.ejs`: Halaman detail tiket helpdesk, tombol ambil tiket, form ubah status, dan riwayat status.
- `views/admin.ejs`: Halaman khusus admin (placeholder pengujian role).
- `views/403.ejs`: Halaman error akses ditolak jika peran tidak berwenang.
- `views/404.ejs`: Halaman error tidak ditemukan (not found).
- `views/partials/header.ejs`: Komponen navbar (menyesuaikan status sesi, menu employee, dan helpdesk).
- `views/partials/footer.ejs`: Komponen copyright footer.
- `public/css/style.css`: Styling CSS kustom.
- `public/js/main.js`: Script JS klien.
- `issue/README.md`: Tabel pelacak status tahapan proyek.
- `issue/BACKLOG.md`: Daftar backlog fitur masa depan.
- `issue/00-setup-repo.md`: Dokumentasi pengerjaan Tahap 00.
- `issue/01-server-layout.md`: Dokumentasi pengerjaan Tahap 01.
- `issue/02-database.md`: Dokumentasi pengerjaan Tahap 02.
- `issue/03-login-role.md`: Dokumentasi pengerjaan Tahap 03.
- `issue/04-tiket-karyawan.md`: Dokumentasi pengerjaan Tahap 04.
- `issue/05-helpdesk-tiket.md`: Dokumentasi pengerjaan Tahap 05.

## 5. Tabel Route
| Method | Path | Akses | File |
|---|---|---|---|
| `GET` | `/` | Publik | `app.js` |
| `GET` | `/login` | Tamu (sudah login diarahkan ke `/dashboard`) | `routes/auth.js` |
| `POST` | `/login` | Publik (verifikasi email & password bcrypt) | `routes/auth.js` |
| `POST` | `/logout` | Login (hancurkan session) | `routes/auth.js` |
| `GET` | `/dashboard` | Pengguna login (`requireLogin`) | `routes/dashboard.js` |
| `GET` | `/tickets` | Khusus Employee (`requireRole('employee')`) | `routes/tickets.js` |
| `GET` | `/tickets/new` | Khusus Employee (`requireRole('employee')`) | `routes/tickets.js` |
| `POST` | `/tickets` | Khusus Employee (`requireRole('employee')`) | `routes/tickets.js` |
| `GET` | `/tickets/:id` | Khusus Employee pemilik tiket (`requireRole('employee')`) | `routes/tickets.js` |
| `GET` | `/helpdesk/tickets` | Khusus Helpdesk (`requireRole('helpdesk')`) | `routes/helpdesk.js` |
| `GET` | `/helpdesk/tickets/:id` | Khusus Helpdesk (`requireRole('helpdesk')`) | `routes/helpdesk.js` |
| `POST` | `/helpdesk/tickets/:id/assign` | Khusus Helpdesk (`requireRole('helpdesk')`) | `routes/helpdesk.js` |
| `POST` | `/helpdesk/tickets/:id/status` | Khusus Helpdesk (`requireRole('helpdesk')`) | `routes/helpdesk.js` |
| `GET` | `/admin` | Khusus Admin (`requireRole('admin')`) | `routes/admin.js` |

## 6. Database
- **Tabel & Kolom Utama**:
  - `users`: `id` (PK), `nama`, `email` (UQ), `password_hash`, `divisi`, `role` (employee/helpdesk/admin), `created_at`.
  - `categories`: `id` (PK), `nama` (UQ).
  - `tickets`: `id` (PK), `kode` (UQ), `judul`, `deskripsi`, `category_id` (FK), `created_by` (FK), `assigned_to` (FK NULL), `prioritas`, `status` DEFAULT 'Baru', `created_at`, `updated_at`, `closed_at`.
  - `ticket_comments`: `id` (PK), `ticket_id` (FK CASCADE), `user_id` (FK), `isi`, `is_internal` (0/1), `created_at`.
  - `ticket_status_history`: `id` (PK), `ticket_id` (FK CASCADE), `status_lama`, `status_baru`, `diubah_oleh` (FK), `created_at`.
- **Fungsi Query Aktif**:
  - `db/categories.js`: `listAll()` - mengambil semua kategori urut alfabet.
  - `db/tickets.js`:
    - `createTicket(data)`: transaksi DB penomoran otomatis `TKT-XXXX` (format 4 digit berurutan dari ID terakhir), status default 'Baru', `assigned_to` NULL.
    - `listByUser(userId)`: mengambil tiket milik user login join tabel categories.
    - `findByIdForUser(id, userId)`: detail tiket milik user login (`WHERE id = ? AND created_by = ?`).
    - `listAll({ status, q })`: mengambil seluruh tiket join kategori, pembuat, petugas; filter status dan pencarian kode/judul via LIKE parameter binding; limit 200.
    - `findById(id)`: detail tiket lengkap untuk helpdesk.
    - `assignToUser(id, userId)`: transaksi DB mengambil tiket (hanya jika `assigned_to IS NULL` dan `status = 'Baru'`), mengubah status ke 'Diproses', dan mencatat history.
    - `changeStatus(id, newStatus, userId)`: transaksi DB mengubah status tiket milik petugas yang bersangkutan sesuai `ALLOWED_TRANSITIONS`, mengisi `closed_at` saat 'Ditutup', dan mencatat history.
  - `db/ticketHistory.js`: `listByTicket(ticketId)` - mengambil riwayat status tiket join nama pengubah terurut waktu naik (ASC).
  - `db/users.js`: `findByEmail(email)`, `findById(id)`.
- **Aturan Transisi Status (`ALLOWED_TRANSITIONS`)**:
  - `Baru` -> `['Diproses']`
  - `Diproses` -> `['Selesai']`
  - `Selesai` -> `['Ditutup', 'Diproses']`
  - `Ditutup` -> `[]`
- **Akun Seed**: `budi@perusahaan.local` (employee 1), `dewi@perusahaan.local` (employee 2), `siti@perusahaan.local` (helpdesk 1), `eko@perusahaan.local` (helpdesk 2), `admin@perusahaan.local` (admin).

## 7. Auth, Session & Pola Keamanan
- **Autentikasi**: Membandingkan input password via `bcrypt.compare` terhadap `password_hash`. Pesan error generik: "Email atau password salah".
- **Session & Flash**: `express-session` dengan secret dari `SESSION_SECRET`. Cookie: `httpOnly: true`, `sameSite: 'lax'`, `secure: production`. Session diregenerate saat login sukses; menyimpan `id`, `nama`, `role`. Flash message satu kali baca via `res.locals.flash`.
- **Isolasi Tiket & Hak Akses**:
  - Karyawan hanya bisa melihat tiketnya sendiri (tiket orang lain menghasilkan respon `404 Not Found` untuk mencegah IDOR).
  - Helpdesk hanya bisa mengubah status tiket yang telah diambilnya sendiri. Petugas lain dicegah mengambil ulang tiket atau mengubah statusnya.
- **Validasi Input**: Validasi ketat via `express-validator` pada `routes/tickets.js` dan `routes/helpdesk.js`.
- **XSS Prevention**: Semua data pengguna ditampilkan menggunakan sintaks escape `<%= %>` pada view EJS.

## 8. Cara Menambah Fitur
1. Query DB: Tambahkan fungsi query di `db/*.js` memakai `db.prepare(...)` dari `db/connection.js`.
2. Middleware: Buat logika otorisasi di `middleware/*.js` jika diperlukan.
3. Rute: Buat modul di `routes/*.js`, pasang middleware dan validasi `express-validator`, daftarkan via `app.use()` di `app.js`.
4. Tampilan: Buat file `.ejs` di `views/` dengan layout partials, escaping `<%= %>`, dan styling Bootstrap 5.

## 9. Konvensi
- Tanpa ORM; seluruh query SQL terisolasi di folder `db/`.
- Tanpa framework frontend JS; server-side rendering dengan EJS + Bootstrap 5 CDN.
- Password wajib di-hash menggunakan `bcrypt`.
- Agent dilarang menjalankan perintah git apa pun.
- Kode ditulis sederhana dengan komentar berbahasa Indonesia untuk pemula.
- Semua data masukan pengguna wajib di-escape dengan `<%= %>` pada view.

## 10. Status Tahap
- Tahap 00 (Setup repo): Selesai.
- Tahap 01 (Server layout & beranda): Selesai.
- Tahap 02 (Database SQLite & migrasi/seed): Selesai.
- Tahap 03 (Login, logout, session, role): Selesai.
- Tahap 04 (Tiket Karyawan): Selesai.
- Tahap 05 (Tiket untuk Helpdesk): Selesai.
- **Tahap 06 (Komentar & Catatan Internal)**: Berikutnya.

## 11. Belum Ada
- Fitur komentar pada tiket untuk karyawan dan petugas helpdesk.
- Catatan internal (`is_internal = 1`) khusus petugas helpdesk.
- Manajemen pengguna dan kategori oleh admin (CRUD).
- Laporan dan visualisasi grafik analitik (Chart.js).
- Paginasi daftar tiket dan upload lampiran file dokumen/gambar.
- Melepas/mengoper tiket ke petugas lain.
- Proteksi CSRF token & rate limiter endpoint auth.
