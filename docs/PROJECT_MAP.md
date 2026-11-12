Peta Proyek (docs/PROJECT_MAP.md)

Terakhir diperbarui: Tahap 08

1. Ringkasan

Aplikasi web pelaporan E-Ticket IT Helpdesk untuk karyawan mengajukan tiket kendala, tim IT Helpdesk memproses dan memantau analitik, serta admin mengelola pengguna, kategori, dan memantau sistem. Stack: Node.js, Express, EJS, Bootstrap 5 (CDN), Chart.js (CDN), SQLite (better-sqlite3), bcrypt, express-session, express-validator.

## 2. Cara Menjalankan
- Persiapan: salin `.env.example` menjadi `.env`, lalu isi `SESSION_SECRET`.
- Inisialisasi DB: `npm run db:migrate` (membuat 5 tabel SQLite dari `db/migrations/*.sql`).
- Data awal: `npm run db:seed` (5 pengguna: 2 employee, 2 helpdesk, 1 admin, dan 5 kategori; idempotent).
- Data demo: `npm run db:seed-demo` (~32 tiket demo dengan prefix `[DEMO]`, hanya untuk development).
- Server development: `npm run dev` (nodemon, port 3000). Production: `npm start`.

Request HTTP -> express.static('public') -> body parsing -> session -> globals res.locals -> Router (routes/*.js) -> [middleware requireLogin / requireRole] -> memanggil db/*.js -> render view EJS ter-escape <%= %> -> response HTML.

## 4. Peta File (1 Baris Per File)
- `AGENTS.md`: Aturan pengerjaan, alur baca, instruksi lingkungan, dan larangan git bagi agent.
- `app.js`: Entry point Express, konfigurasi session, middleware globals/flash, pendaftaran rute.
- `package.json`: Dependensi dan scripts (`start`, `dev`, `db:migrate`, `db:seed`, `db:seed-demo`).
- `.env.example`: Template env (`PORT`, `SESSION_SECRET`, `NODE_ENV`, `DB_PATH`).
- `db/connection.js`: Koneksi better-sqlite3 dari `DB_PATH`, `PRAGMA foreign_keys = ON`.
- `db/migrations/001_init.sql`: Skema 5 tabel (users, categories, tickets, comments, history).
- `db/migrate.js`: Runner migrasi SQL.
- `db/seed.js`: Seeder pengguna dan kategori (idempotent).
- `db/seed-demo.js`: Seeder tiket demo untuk report (idempotent via `[DEMO]`).
- `db/users.js`: Helper query tabel users (`findByEmail`, `findById`, `listAll`, `findByIdBasic`, `emailTakenByOther`, `createUser`, `updateUser`, `updatePassword`, `countAdmins`, `countOpenAssigned`).
- `db/categories.js`: Helper query tabel categories (`listAll`, `listAllWithCount`, `findById`, `nameTakenByOther`, `create`, `rename`, `countTickets`, `countAll`, `remove`).
- `db/tickets.js`: `createTicket`, `listByUser`, `findByIdForUser`, `listAll`, `findById`, `assignToUser`, `changeStatus`, `ALLOWED_TRANSITIONS`.
- `db/ticketHistory.js`: `listByTicket`.
- `db/comments.js`: `listPublicByTicket`, `listAllByTicket`, `create`.
- `db/reports.js`: `getSummary`, `countByStatus`, `countByCategory`, `countByMonthLast12`, `workloadByAgent`, `listStale`.
- `middleware/auth.js`: `requireLogin`, `requireRole`.
- `routes/auth.js`: `/login`, `/logout`.
- `routes/dashboard.js`: `/dashboard`.
- `routes/tickets.js`: Tiket sisi employee (daftar, buat, detail, komentar).
- `routes/helpdesk.js`: Tiket sisi helpdesk (daftar, detail, assign, status, komentar).
- `routes/reports.js`: `GET /reports` (helpdesk dan admin).
- `routes/admin.js`: Modul admin lengkap (dashboard, manajemen pengguna, manajemen kategori).
- `views/partials/header.ejs`: Navbar (menu menyesuaikan status login dan peran).
- `views/partials/footer.ejs`: Footer halaman. TIDAK ADA `partials/head.ejs`.
- `views/admin.ejs`: Dashboard admin (kartu metrik pengguna dan kategori).
- `views/admin/users/` (`index.ejs`, `new.ejs`, `edit.ejs`): Manajemen pengguna dan atur ulang password.
- `views/admin/categories/` (`index.ejs`, `edit.ejs`): Manajemen kategori dan ubah nama.
- `views/reports/index.ejs`: Dashboard report (kartu ringkasan, 3 canvas Chart.js, tabel beban kerja dan tiket lama).
- `public/js/admin.js`: Script dialog konfirmasi `data-confirm` pada aksi sensitif.
- `public/js/report.js`: Menggambar grafik Chart.js dari atribut `data-*` pada canvas.
- `public/css/style.css`: CSS tambahan.
- `issue/README.md`: Tabel progres tahap. `issue/BACKLOG.md`: ide fitur. `issue/NN-*.md`: tugas per tahap.

## 5. Tabel Route
| Method | Path | Akses | File |
|---|---|---|---|
| `GET` | `/` | Publik | `app.js` |
| `GET` | `/login` | Tamu (sudah login diarahkan ke `/dashboard`) | `routes/auth.js` |
| `POST` | `/login` | Publik (verifikasi bcrypt) | `routes/auth.js` |
| `POST` | `/logout` | Login | `routes/auth.js` |
| `GET` | `/dashboard` | Login | `routes/dashboard.js` |
| `GET` | `/tickets` | Employee | `routes/tickets.js` |
| `GET` | `/tickets/new` | Employee | `routes/tickets.js` |
| `POST` | `/tickets` | Employee | `routes/tickets.js` |
| `GET` | `/tickets/:id` | Employee pemilik tiket | `routes/tickets.js` |
| `POST` | `/tickets/:id/comments` | Employee pemilik tiket | `routes/tickets.js` |
| `GET` | `/helpdesk/tickets` | Helpdesk | `routes/helpdesk.js` |
| `GET` | `/helpdesk/tickets/:id` | Helpdesk | `routes/helpdesk.js` |
| `POST` | `/helpdesk/tickets/:id/assign` | Helpdesk | `routes/helpdesk.js` |
| `POST` | `/helpdesk/tickets/:id/status` | Helpdesk (petugas pemilik tiket) | `routes/helpdesk.js` |
| `POST` | `/helpdesk/tickets/:id/comments` | Helpdesk | `routes/helpdesk.js` |
| `GET` | `/reports` | Helpdesk dan Admin | `routes/reports.js` |
| `GET` | `/admin` | Admin | `routes/admin.js` |
| `GET` | `/admin/users` | Admin | `routes/admin.js` |
| `GET` | `/admin/users/new` | Admin | `routes/admin.js` |
| `POST` | `/admin/users` | Admin | `routes/admin.js` |
| `GET` | `/admin/users/:id/edit` | Admin | `routes/admin.js` |
| `POST` | `/admin/users/:id` | Admin | `routes/admin.js` |
| `POST` | `/admin/users/:id/password` | Admin | `routes/admin.js` |
| `GET` | `/admin/categories` | Admin | `routes/admin.js` |
| `POST` | `/admin/categories` | Admin | `routes/admin.js` |
| `GET` | `/admin/categories/:id/edit` | Admin | `routes/admin.js` |
| `POST` | `/admin/categories/:id` | Admin | `routes/admin.js` |
| `POST` | `/admin/categories/:id/delete` | Admin | `routes/admin.js` |

## 6. Database dan Query
- **5 Tabel**: `users`, `categories`, `tickets`, `ticket_comments`, `ticket_status_history`.
- **Fungsi Query `db/users.js`**: `listAll()` (tanpa hash), `findByIdBasic(id)`, `findByEmail(email)`, `emailTakenByOther(email, id)`, `createUser(...)`, `updateUser(id, ...)`, `updatePassword(id, hash)`, `countAdmins()`, `countOpenAssigned(id)`.
- **Fungsi Query `db/categories.js`**: `listAll()`, `listAllWithCount()`, `findById(id)`, `nameTakenByOther(nama, id)` (case-insensitive), `create(nama)`, `rename(id, nama)`, `countTickets(id)`, `countAll()`, `remove(id)`.
- **Aturan Peran Pengguna**:
  - Admin tidak boleh mengubah peran akunnya sendiri.
  - Peran admin tidak boleh diturunkan jika `countAdmins()` <= 1.
  - Peran helpdesk tidak boleh diubah jika `countOpenAssigned(id)` > 0.
- **Aturan Kategori**:
  - Hapus kategori ditolak jika `countTickets(id)` > 0 atau `countAll()` <= 1.
  - Nama kategori harus unik tanpa membedakan huruf besar/kecil.

## 7. Pola Keamanan
- **Isolasi query**: tiket employee dibatasi `WHERE created_by = ?`; employee hanya membaca komentar `is_internal = 0`.
- **403 dan 404**: akses lintas peran menghasilkan 403. ID tidak valid atau tidak ditemukan menghasilkan 404.
- **Sumber data server**: identitas pembuat tiket/komentar diambil dari session.
- **Password**: di-hash dengan bcrypt, `password_hash` tidak pernah dikirim ke view atau ditampilkan ulang di form.
- **Output escaping**: semua data pengguna ditampilkan dengan `<%= %>`.
- **Dialog Konfirmasi**: form sensitif diverifikasi via `public/js/admin.js` (`data-confirm`).

## 8. Cara Menambah Fitur
1. DB: tulis fungsi query di `db/*.js` dengan parameter binding.
2. Route: buat di `routes/*.js` dengan middleware proteksi dan validasi `express-validator`.
3. View: ikuti pola view standar dengan Bootstrap 5 CDN dan escaping `<%= %>`.
4. Perbarui dokumen `PROJECT_MAP.md` dan file issue.

## 9. Konvensi
- Tanpa ORM, tanpa framework SPA frontend.
- Password di-hash bcrypt, rahasia di `.env`.
- Agent DILARANG menjalankan perintah git apa pun.

## 10. Status Tahap
- Tahap 00 - 08: Selesai.
- **Tahap 09 (Polish, Validasi & Testing Akhir)**: Berikutnya.

## 11. Belum Ada
- Hapus atau nonaktifkan akun pengguna.
- Paginasi daftar tiket/pengguna, filter tanggal report, dan ekspor laporan (CSV/PDF).
- Edit/hapus komentar dan upload lampiran.
- Notifikasi email komentar atau perubahan status.
- CSRF protection, rate limiting login, dan session permanen.
