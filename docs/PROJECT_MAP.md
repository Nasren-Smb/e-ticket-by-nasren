# Peta Proyek (docs/PROJECT_MAP.md)

## 1. Ringkasan
Aplikasi web pelaporan E-Ticket IT Helpdesk untuk karyawan mengirim tiket kendala dan tim IT memprosesnya. Stack: Node.js, Express, EJS, Bootstrap 5 (CDN), SQLite (better-sqlite3), bcrypt, express-session.

## 2. Cara Menjalankan
1. Inisialisasi DB: `npm run db:migrate` (membuat tabel SQLite dari `db/migrations/*.sql`).
2. Isi data awal: `npm run db:seed` (mengisi 3 user dan 5 kategori; aman dijalankan berulang).
3. Jalankan server dev: `npm run dev` (nodemon di `http://localhost:3000`).
4. Jalankan server prod: `npm start` (`node app.js`).

## 3. Alur Satu Request
Request HTTP -> `express.static('public')` -> `express.urlencoded` & `express.json` -> middleware `session` -> middleware custom `res.locals.user = req.session.user` -> Router (`routes/*.js`) -> [opsional middleware `requireLogin` / `requireRole`] -> Controller memanggil query dari `db/*.js` -> Render view EJS dengan data & layout partials -> Response HTML.

## 4. Peta File (1 Baris Per File)
- `AGENTS.md`: Aturan pengerjaan, alur baca, instruksi keamanan, dan larangan git bagi agent.
- `app.js`: Entry point Express, konfigurasi session, middleware globals, dan integrasi routing.
- `package.json`: Definisi dependensi npm dan scripts (`start`, `dev`, `db:migrate`, `db:seed`).
- `.env.example`: Template konfigurasi env (`PORT`, `SESSION_SECRET`, `NODE_ENV`, `DB_PATH`).
- `.gitignore`: Mengabaikan `node_modules/`, `.env`, `*.db`, `*.db-journal`, `*.log`.
- `db/connection.js`: Inisialisasi better-sqlite3 dari `DB_PATH` dengan `PRAGMA foreign_keys = ON`.
- `db/migrations/001_init.sql`: Skema DDL 5 tabel (users, categories, tickets, ticket_comments, ticket_status_history).
- `db/migrate.js`: Runner otomatis file migrasi SQL di folder `db/migrations/`.
- `db/seed.js`: Seeder data 3 pengguna (hash bcrypt) dan 5 kategori default (idempotent).
- `db/users.js`: Fungsi query tabel users (`findByEmail`, `findById`).
- `middleware/auth.js`: Middleware otentikasi `requireLogin` dan otorisasi peran `requireRole`.
- `routes/auth.js`: Endpoint login form, proses autentikasi akun, dan logout.
- `routes/dashboard.js`: Endpoint halaman dashboard pengguna terotentikasi.
- `routes/admin.js`: Endpoint placeholder halaman khusus role admin (uji otorisasi).
- `routes/README.md`: Catatan modul routing Express.
- `views/index.ejs`: Halaman beranda publik.
- `views/login.ejs`: Halaman formulir login akun.
- `views/dashboard.ejs`: Halaman dashboard pengguna menampilkan identitas dan peran.
- `views/admin.ejs`: Halaman khusus admin.
- `views/403.ejs`: Halaman error akses ditolak jika peran tidak berwenang.
- `views/partials/header.ejs`: Komponen navbar (menyesuaikan status login user).
- `views/partials/footer.ejs`: Komponen copyright footer.
- `public/css/style.css`: Styling CSS kustom.
- `public/js/main.js`: Script JS klien.
- `issue/README.md`: Tabel pelacak status tahapan proyek.
- `issue/BACKLOG.md`: Daftar backlog fitur masa depan.
- `issue/00-setup-repo.md`: Dokumentasi pengerjaan Tahap 00.
- `issue/01-server-layout.md`: Dokumentasi pengerjaan Tahap 01.
- `issue/02-database.md`: Dokumentasi pengerjaan Tahap 02.
- `issue/03-login-role.md`: Dokumentasi pengerjaan Tahap 03.

## 5. Tabel Route
| Method | Path | Akses | File |
|---|---|---|---|
| `GET` | `/` | Publik | `app.js` |
| `GET` | `/login` | Tamu (sudah login redirect ke `/dashboard`) | `routes/auth.js` |
| `POST` | `/login` | Publik (memverifikasi email & password) | `routes/auth.js` |
| `POST` | `/logout` | Publik / Pengguna login | `routes/auth.js` |
| `GET` | `/dashboard` | Login (`requireLogin`) | `routes/dashboard.js` |
| `GET` | `/admin` | Khusus Admin (`requireRole('admin')`) | `routes/admin.js` |

## 6. Database (Tabel & Kolom Utama)
- `users`: `id` (PK), `nama`, `email` (UQ), `password_hash`, `divisi`, `role` (employee/helpdesk/admin), `created_at`.
- `categories`: `id` (PK), `nama` (UQ).
- `tickets`: `id` (PK), `kode` (UQ), `judul`, `deskripsi`, `category_id` (FK), `created_by` (FK), `assigned_to` (FK NULL), `prioritas` (Rendah/Sedang/Tinggi/Urgent), `status` (Baru/Diproses/Selesai/Ditutup), `created_at`, `updated_at`, `closed_at`.
- `ticket_comments`: `id` (PK), `ticket_id` (FK CASCADE), `user_id` (FK), `isi`, `is_internal` (0/1), `created_at`.
- `ticket_status_history`: `id` (PK), `ticket_id` (FK CASCADE), `status_lama`, `status_baru`, `diubah_oleh` (FK), `created_at`.
- Akun seed: `budi@perusahaan.local` (employee), `siti@perusahaan.local` (helpdesk), `admin@perusahaan.local` (admin).

## 7. Auth dan Session
- Autentikasi mencocokkan hash via `bcrypt.compare`. Pesan error login generik: "Email atau password salah".
- Session: Menggunakan `express-session` dengan secret dari `SESSION_SECRET`.
- Keamanan Cookie: `httpOnly: true`, `sameSite: 'lax'`, `secure: process.env.NODE_ENV === 'production'`.
- Proteksi: `req.session.regenerate()` dipanggil saat login sukses. Hanya menyimpan `id`, `nama`, `role` (tanpa `password_hash`).
- Logout: Menggunakan request `POST` yang memanggil `req.session.destroy()` dan menghapus cookie `connect.sid`.

## 8. Cara Menambah Fitur
1. Query DB: Tambahkan file query baru di `db/*.js` menggunakan `db.prepare(...)` dari `db/connection.js`.
2. Middleware: Buat logika proteksi rute di `middleware/*.js` jika diperlukan.
3. Rute: Buat modul `routes/*.js`, pasang middleware, tangani request/response, lalu daftarkan via `app.use()` di `app.js`.
4. Tampilan: Buat file `.ejs` di `views/` memanfaatkan partials (`header.ejs`, `footer.ejs`) dan komponen Bootstrap 5.

## 9. Konvensi
- Tanpa ORM; query SQL diletakkan secara terisolasi di folder `db/`.
- Tanpa framework frontend (React/Vue/dll.); render sisi server menggunakan template EJS & Bootstrap 5 CDN.
- Password wajib di-hash menggunakan `bcrypt`.
- Agent dilarang menjalankan perintah git.
- Kode ditulis sederhana dengan komentar berbahasa Indonesia untuk pemula.

## 10. Status Tahap
- Tahap 00 (Setup repo): Selesai.
- Tahap 01 (Server layout & beranda): Selesai.
- Tahap 02 (Database SQLite & migrasi/seed): Selesai.
- Tahap 03 (Login, logout, session, role): Selesai.
- **Tahap 04 (Tiket Karyawan)**: Berikutnya.

## 11. Belum Ada
- Form dan endpoint pembuatan tiket oleh karyawan (`/tickets/new`).
- Halaman daftar riwayat tiket milik karyawan (`/tickets`).
- Alur helpdesk memproses tiket (ambil tiket, ubah status tiket).
- Komentar tiket dan catatan internal helpdesk.
- Manajemen pengguna dan kategori oleh admin (CRUD).
- Visualisasi dashboard pelaporan analitik (Chart.js).
- Proteksi CSRF token & rate limiter endpoint auth.
