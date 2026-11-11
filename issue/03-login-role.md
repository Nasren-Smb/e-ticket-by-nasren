# Tahap 03: Login, Logout, Session, dan Proteksi Role
Status: Selesai
Branch: tahap-03-login-role
Prasyarat: Tahap 02: Database SQLite

## Hasil Tahap Sebelumnya (PROJECT_MAP)
- SQLite (`better-sqlite3`) berjalan dengan foreign keys aktif dan skema 5 tabel (`users`, `categories`, `tickets`, `ticket_comments`, `ticket_status_history`).
- Seeder mengisi 3 pengguna default (`employee`, `helpdesk`, `admin`) dengan password ter-hash bcrypt dan 5 kategori.
- Server Express dan layout Bootstrap 5 siap dengan rute dasar `/`.

## Tujuan
Memungkinkan pengguna masuk (login) menggunakan email dan password data seed, sesi tersimpan secara aman menggunakan `express-session`, pengguna dapat logout, dan rute/halaman dapat dikunci berdasarkan peran (`requireLogin` & `requireRole`).

## Cakupan (boleh dikerjakan)
- Memastikan dependensi `express-session` aktif dan variabel `SESSION_SECRET` ada di `.env.example` & `.env`
- Pembuatan modul query database user: `db/users.js` (`findByEmail`, `findById`)
- Pembuatan middleware autentikasi & otorisasi: `middleware/auth.js` (`requireLogin`, `requireRole`)
- Pembuatan rute dan controller auth: `routes/auth.js` (`GET /login`, `POST /login`, `POST /logout`)
- Pembuatan tampilan form login: `views/login.ejs`
- Pembuatan rute dan halaman dashboard: `routes/dashboard.js` dan `views/dashboard.ejs`
- Pembuatan rute dan halaman admin placeholder (untuk pengujian proteksi role): `routes/admin.js` dan `views/admin.ejs`
- Pembuatan halaman akses ditolak (403): `views/403.ejs`
- Pembaruan `app.js` (session middleware, parsing form urlencoded, global `res.locals.user`, registrasi rute)
- Pembaruan `views/partials/header.ejs` (tampilan tombol Login atau info akun & tombol Logout sesuai status sesi)

## Di luar cakupan (jangan disentuh)
- Registrasi pengguna, lupa password, ubah password
- Form tiket, daftar tiket, report, CRUD user/kategori
- CSRF token, rate limit login, penyimpanan session di database
- Mengubah `db/migrations/`, `db/seed.js`, atau skema database
- Framework frontend atau ORM

## File yang BOLEH dibaca
- `app.js`
- `views/partials/header.ejs`
- `routes/home.js` (jika ada)
- `db/connection.js`
- `package.json`
- `.env.example`
- `db/seed.js` (hanya untuk referensi email dan password seed)

## File yang akan dibuat/diubah
- `issue/03-login-role.md` (dibuat)
- `issue/BACKLOG.md` (diubah - catat ide di luar cakupan)
- `db/users.js` (dibuat)
- `middleware/auth.js` (dibuat)
- `routes/auth.js` (dibuat)
- `routes/dashboard.js` (dibuat)
- `routes/admin.js` (dibuat)
- `views/login.ejs` (dibuat)
- `views/dashboard.ejs` (dibuat)
- `views/admin.ejs` (dibuat)
- `views/403.ejs` (dibuat)
- `app.js` (diubah)
- `views/partials/header.ejs` (diubah)
- `docs/PROJECT_MAP.md` (diubah setelah pengujian)

## Checklist tugas
- [x] Buat file issue `issue/03-login-role.md`
- [x] Catat ide di luar cakupan ke `issue/BACKLOG.md`
- [x] Buat helper query database `db/users.js` (`findByEmail`, `findById`)
- [x] Buat middleware `middleware/auth.js` (`requireLogin`, `requireRole`)
- [x] Buat rute `routes/auth.js` dan tampilan `views/login.ejs`
- [x] Buat rute `routes/dashboard.js` dan tampilan `views/dashboard.ejs`
- [x] Buat rute `routes/admin.js`, `views/admin.ejs`, dan `views/403.ejs`
- [x] Integrasikan session, middleware `res.locals.user`, dan routing di `app.js`
- [x] Perbarui `views/partials/header.ejs` dengan navigasi login/logout
- [x] Verifikasi tes manual 3 akun seed dan proteksi role

## Cara tes manual
1. Jalankan `npm run dev` atau `node app.js`.
2. Akses `http://localhost:3000/dashboard` tanpa login -> harus otomatis diarahkan (redirect) ke `/login`.
3. Coba login dengan input salah -> pesan error: `"Email atau password salah"`.
4. Login dengan akun Employee (`budi@perusahaan.local` / `password123`):
   - Masuk ke `/dashboard` -> menampilkan nama "Budi Karyawan" dan role "employee".
   - Akses `/admin` -> status HTTP 403 (Akses Ditolak).
5. Logout (klik tombol Logout di navbar) -> session hancur, kembali ke beranda/login.
6. Login dengan akun Helpdesk (`siti@perusahaan.local` / `password123`):
   - Masuk ke `/dashboard` -> menampilkan "Siti Helpdesk".
   - Akses `/admin` -> status HTTP 403.
7. Logout, lalu login dengan akun Admin (`admin@perusahaan.local` / `password123`):
   - Akses `/admin` -> berhasil membuka halaman khusus admin.

## Kriteria selesai
- Login dengan 3 akun seed berhasil (`employee`, `helpdesk`, `admin`).
- Password salah dan email tidak dikenal menampilkan pesan error yang sama ("Email atau password salah").
- `/dashboard` tanpa login diarahkan ke `/login`.
- `/admin` hanya bisa dibuka admin; employee dan helpdesk mendapat 403.
- Logout menghapus sesi; tombol Back tidak membuka dashboard lagi.
- Navbar berubah sesuai status login (ada tombol Login saat anonim, nama + form POST Logout saat login).
- `password_hash` tidak pernah tampil di halaman mana pun.

## Catatan hasil (file diubah, pesan commit, masalah)
- **File dibuat/diubah**:
  - `issue/03-login-role.md`
  - `issue/BACKLOG.md`
  - `db/users.js`
  - `middleware/auth.js`
  - `routes/auth.js`
  - `routes/dashboard.js`
  - `routes/admin.js`
  - `views/login.ejs`
  - `views/dashboard.ejs`
  - `views/admin.ejs`
  - `views/403.ejs`
  - `app.js`
  - `views/partials/header.ejs`
  - `docs/PROJECT_MAP.md`
- **Pesan commit yang disarankan**:
  `feat(auth): implementasi login logout session dan proteksi role middleware`
- **Masalah & Solusi**: Tidak ada kendala teknis. Verifikasi komparasi bcrypt dan penanganan cookie session (httpOnly, sameSite lax, regenerate session id) berjalan sesuai protokol keamanan.

## Evaluasi (yang baik, yang sulit, bug, ide ke BACKLOG, waktu pengerjaan)
- **Yang baik**: Alur autentikasi dan proteksi peran modular dan terpisah rapi (query di `db/users.js`, otorisasi di `middleware/auth.js`, presentation di EJS). Pesan error login generik mencegah kebocoran informasi user enumeration.
- **Yang sulit**: Tidak ada hambatan berarti.
- **Bug**: Tidak ditemukan bug selama pengujian otomatis rute dan peran.
- **Ide ke BACKLOG**: Proteksi CSRF token, rate limiter login endpoint, dan session store SQLite.
- **Waktu pengerjaan**: ~15 menit.

