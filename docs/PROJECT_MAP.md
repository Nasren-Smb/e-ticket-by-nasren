# Peta Proyek (docs/PROJECT_MAP.md)
Terakhir diperbarui: Tahap 07

## 1. Ringkasan
Aplikasi web pelaporan E-Ticket IT Helpdesk untuk karyawan mengajukan tiket kendala, tim IT Helpdesk memproses dan memantau analitik, serta admin memantau sistem. Stack: Node.js, Express, EJS, Bootstrap 5 (CDN), Chart.js (CDN), SQLite (better-sqlite3), bcrypt, express-session, express-validator.

## 2. Cara Menjalankan
- Persiapan: salin `.env.example` menjadi `.env`, lalu isi `SESSION_SECRET`.
- Inisialisasi DB: `npm run db:migrate` (membuat 5 tabel SQLite dari `db/migrations/*.sql`).
- Data awal: `npm run db:seed` (5 pengguna: 2 employee, 2 helpdesk, 1 admin, dan 5 kategori; idempotent). Email dan password development ada di `db/seed.js`.
- Data demo: `npm run db:seed-demo` (~32 tiket demo dengan prefix `[DEMO]`, hanya untuk development).
- Server development: `npm run dev` (nodemon, port 3000). Production: `npm start`.
- Jangan biarkan server dev hidup di terminal lain (penyebab error EADDRINUSE).

## 3. Alur Satu Request
Request HTTP -> `express.static('public')` -> body parsing -> `session` -> globals `res.locals` -> Router (`routes/*.js`) -> [middleware `requireLogin` / `requireRole`] -> memanggil `db/*.js` -> render view EJS ter-escape `<%= %>` -> response HTML.

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
- `db/users.js`: `findByEmail`, `findById`.
- `db/categories.js`: `listAll`.
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
- `routes/admin.js`: `/admin` (masih placeholder).
- `views/partials/header.ejs`: Navbar (menu menyesuaikan status login dan peran).
- `views/partials/footer.ejs`: Footer halaman. TIDAK ADA `partials/head.ejs`.
- `views/home.ejs`, `login.ejs`, `dashboard.ejs`, `admin.ejs`, `403.ejs`, `404.ejs`: Halaman umum, dashboard, placeholder admin, halaman error.
- `views/tickets/` (`index.ejs`, `new.ejs`, `show.ejs`): Halaman tiket employee, termasuk komentar.
- `views/helpdesk/` (`index.ejs`, `show.ejs`): Halaman tiket helpdesk, termasuk riwayat status, ubah status, catatan internal.
- `views/reports/index.ejs`: Dashboard report (kartu ringkasan, 3 canvas Chart.js, tabel beban kerja dan tiket lama).
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
| `GET` | `/admin` | Admin (placeholder) | `routes/admin.js` |

## 6. Database dan Query
- **5 Tabel**: `users` (id, nama, email, password_hash, divisi, role), `categories` (id, nama), `tickets` (id, kode, judul, deskripsi, category_id, created_by, assigned_to, prioritas, status, created_at, updated_at, closed_at), `ticket_comments` (id, ticket_id, user_id, isi, is_internal, created_at), `ticket_status_history` (id, ticket_id, status_lama, status_baru, diubah_oleh, created_at).
- **Kode tiket** `TKT-0001` dibuat di `createTicket` (`db/tickets.js`) dalam satu transaksi.
- **Format waktu** `created_at`: mengikuti yang dipakai di `db/tickets.js`. Pakai format yang sama untuk data baru.
- **Ambil tiket** (`assignToUser`): hanya tiket `Baru` yang belum punya petugas. Hasilnya `Diproses`, tercatat di history.
- **Ubah status** (`changeStatus`): hanya petugas pemilik tiket, harus sesuai `ALLOWED_TRANSITIONS`, `closed_at` terisi hanya saat menjadi `Ditutup`, tercatat di history.
- **Transisi status**: `Baru` -> `Diproses` -> `Selesai` -> `Ditutup` atau kembali ke `Diproses`. `Ditutup` final.
- **Fungsi `db/reports.js`**:
  - `getSummary()`: total, jumlah per status, rata-rata jam penyelesaian (tiket dibuat sampai pertama kali `Selesai` di history).
  - `countByStatus()`: per status, default 0.
  - `countByCategory()`: per kategori (LEFT JOIN), urut nama.
  - `countByMonthLast12()`: 12 bulan terakhir (YYYY-MM), bulan kosong bernilai 0.
  - `workloadByAgent()`: Diproses, Selesai, Ditutup per petugas helpdesk.
  - `listStale(limit)`: tiket `Baru` atau `Diproses` berumur lebih dari 7 hari, terlama dulu.

## 7. Pola Keamanan
- **Isolasi query**: tiket employee dibatasi `WHERE created_by = ?`; employee hanya membaca komentar `is_internal = 0` (`listPublicByTicket`), disaring di query, bukan di view.
- **403 dan 404**: akses lintas peran menghasilkan 403. Tiket milik orang lain menghasilkan 404 (mencegah enumerasi).
- **Sumber data dari server**: `created_by`, `user_id` komentar, dan `assigned_to` berasal dari session. Status awal tiket ditentukan server, bukan dari form.
- **Tiket Ditutup** menolak komentar baru, dicek di server.
- **Session** di memori (hilang saat server restart). Pesan error login selalu sama, session id diganti setelah login, logout lewat POST.
- **Output** data pengguna selalu `<%= %>`, tidak pernah `<%- %>`.
- **Grafik**: data dikirim lewat atribut `data-*` dengan `<%= JSON.stringify(...) %>`, bukan skrip inline.
- **Versi library dipin**: Chart.js `chart.js@4.4.7` dimuat hanya di `views/reports/index.ejs`.

## 8. Cara Menambah Fitur
1. DB: tulis fungsi query di `db/*.js` dengan parameter binding. Query tidak boleh ada di routes.
2. Route: buat di `routes/*.js` dengan `requireLogin` atau `requireRole` dan validasi `express-validator`. Daftarkan di `app.js`. Rute `/x/new` diletakkan sebelum `/x/:id`.
3. View: tiru pola `views/helpdesk/index.ejs`. Tidak ada `partials/head.ejs`, jadi tiap view menulis `<head>` sendiri (meta, Bootstrap CSS, Bootstrap Icons, `/css/style.css`), lalu `include partials/header` di dalam `<body>`, `include partials/footer` di akhir, lalu skrip Bootstrap JS dan skrip khusus halaman, lalu `</body></html>`. Jangan membuat partial baru tanpa diminta.
4. Navbar: tambahkan link di `views/partials/header.ejs` sesuai peran bila perlu.
5. Perbarui dokumen ini, `issue/README.md`, dan file issue tahap.

## 9. Konvensi
- Tanpa ORM (raw SQL via better-sqlite3), tanpa framework frontend (EJS + Bootstrap 5 CDN + JavaScript biasa).
- Password di-hash bcrypt, rahasia di `.env`. `db/eticket.db` dan `.env` tidak masuk Git.
- Agent DILARANG menjalankan perintah git apa pun. Git dikerjakan manual oleh pengguna.

## 10. Status Tahap
- Tahap 00 - 07: Selesai.
- **Tahap 08 (Admin: kelola user dan kategori, menggantikan placeholder `/admin`)**: Berikutnya.
- Tahap 09 (Rapikan kode, README lengkap, evaluasi menyeluruh): Setelahnya.

## 11. Belum Ada
- CRUD manajemen pengguna dan kategori oleh admin (Tahap 08).
- Paginasi daftar tiket, filter tanggal report, dan ekspor laporan (CSV/PDF).
- Edit/hapus komentar dan upload lampiran.
- Notifikasi komentar atau perubahan status.
- CSRF protection, rate limiting login, dan session permanen.
