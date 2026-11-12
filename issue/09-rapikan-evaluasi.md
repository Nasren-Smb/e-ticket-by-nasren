# Issue 09: Rapikan Kode, Dokumentasi, dan Evaluasi Menyeluruh

## Status
Sedang dikerjakan

## Branch
`tahap-09-polish-evaluasi`

## Prasyarat
Tahap 08 selesai (Modul admin untuk kelola pengguna dan kategori sudah selesai dan teruji).

## Hasil Tahap Sebelumnya (dari PROJECT_MAP)
- Modul administrasi pengguna dan kategori lengkap di `/admin`.
- Aturan bisnis admin (proteksi diri sendiri, admin terakhir, helpdesk dengan tiket aktif, kategori terpakai).
- Penanganan konfirmasi submit `data-confirm` via `public/js/admin.js`.

## Tujuan
Menyelesaikan dokumentasi menyeluruh aplikasi (README.md dan docs/TESTING.md), merapikan backlog fitur, serta melakukan audit dan perapian kode aplikasi untuk memastikan kualitas, konsistensi, dan keamanan sebelum proyek diselesaikan.

## Cakupan
- **09A: Dokumentasi dan Dokumen Uji**:
  - Pembuatan `README.md` komprehensif maksimal 150 baris dalam bahasa Indonesia (fitur per peran, stack, instalasi, tabel akun seed, script npm, struktur folder, alur tiket, batasan, troubleshooting).
  - Pembuatan `docs/TESTING.md`: checklist uji manual terstruktur per fitur berdasarkan issue 03-08.
  - Merapikan `issue/BACKLOG.md` dengan pengelompokan kategori (Keamanan, Fitur, Teknis) dan prioritas (Tinggi, Sedang, Rendah).
  - Pembaruan `issue/README.md`.
- **09B: Audit dan Rapikan Kode**:
  - Audit kode mati, import/require yang tidak dipakai, dan duplikasi.
  - Pemeriksaan matriks hak akses route untuk mencegah bypass proteksi otorisasi.
  - Verifikasi keamanan: parameter binding SQL, escaping EJS `<%= %>`, tidak ada kebocoran kredensial, kelengkapan `.gitignore`.
  - Merapikan temuan kategori (a) yang aman diperbaiki.

## Di Luar Cakupan
- Mengubah arsitektur database atau menambah tabel baru.
- Menambahkan dependensi library baru di luar kebutuhan.
- Mengubah alur bisnis yang sudah disepakati di tahap sebelumnya.

## File yang BOLEH Dibaca
- `docs/PROJECT_MAP.md`
- `package.json`
- `.env.example`
- `.gitignore`
- `db/seed.js`
- `issue/README.md`
- `issue/BACKLOG.md`
- Bagian "Cara tes" dan "Kriteria selesai" di `issue/03-login-role.md` sampai `issue/08-admin.md`

## File yang Akan Dibuat/Diubah
- `issue/09-rapikan-evaluasi.md` (Dibuat/Diubah)
- `README.md` (Dibuat)
- `docs/TESTING.md` (Dibuat)
- `issue/BACKLOG.md` (Diubah)
- `issue/README.md` (Diubah)
- `routes/reports.js` (Diubah - merapikan import requireLogin)

## Checklist
- [x] Buat file issue `issue/09-rapikan-evaluasi.md`
- [x] Buat file `README.md` di root (maksimal 150 baris, bahasa Indonesia)
- [x] Buat file `docs/TESTING.md` (checklist uji manual per fitur)
- [x] Rapikan `issue/BACKLOG.md` (Keamanan, Fitur, Teknis dengan prioritas)
- [x] Perbarui `issue/README.md` (Tahap 09 Sedang dikerjakan)
- [x] (09B) Lakukan audit kode dan catat di bagian Temuan Audit
- [x] (09B) Matriks akses seluruh route tercatat lengkap
- [x] (09B) Rapikan temuan kelompok (a) dan cek sintaks via `node --check`

## Matriks Akses Route
Seluruh route yang terdaftar di aplikasi beserta middleware pengamannya:

| Method | Path | Middleware Akses | Status Proteksi |
|---|---|---|---|
| `GET` | `/` | *(None)* | Publik (Beranda) |
| `GET` | `/login` | *(None / Redirect jika sudah login)* | Publik / Tamu |
| `POST` | `/login` | *(None / Proses Auth)* | Publik |
| `POST` | `/logout` | *(None / Destroy Session)* | Terproteksi sesi |
| `GET` | `/dashboard` | `requireLogin` | Pengguna Terautentikasi |
| `GET` | `/tickets` | `requireRole('employee')` | Khusus Employee |
| `GET` | `/tickets/new` | `requireRole('employee')` | Khusus Employee |
| `POST` | `/tickets` | `requireRole('employee')` | Khusus Employee |
| `GET` | `/tickets/:id` | `requireRole('employee')` | Khusus Employee (Isolasi pemilik tiket) |
| `POST` | `/tickets/:id/comments` | `requireRole('employee')` | Khusus Employee (Isolasi pemilik tiket) |
| `GET` | `/helpdesk/tickets` | `requireRole('helpdesk')` | Khusus Helpdesk |
| `GET` | `/helpdesk/tickets/:id` | `requireRole('helpdesk')` | Khusus Helpdesk |
| `POST` | `/helpdesk/tickets/:id/assign` | `requireRole('helpdesk')` | Khusus Helpdesk |
| `POST` | `/helpdesk/tickets/:id/status` | `requireRole('helpdesk')` | Khusus Helpdesk (Petugas pemilik tiket) |
| `POST` | `/helpdesk/tickets/:id/comments` | `requireRole('helpdesk')` | Khusus Helpdesk |
| `GET` | `/reports` | `requireRole('helpdesk', 'admin')` | Khusus Helpdesk & Admin |
| `GET` | `/admin` | `requireRole('admin')` | Khusus Admin |
| `GET` | `/admin/users` | `requireRole('admin')` | Khusus Admin |
| `GET` | `/admin/users/new` | `requireRole('admin')` | Khusus Admin |
| `POST` | `/admin/users` | `requireRole('admin')` | Khusus Admin |
| `GET` | `/admin/users/:id/edit` | `requireRole('admin')` | Khusus Admin |
| `POST` | `/admin/users/:id` | `requireRole('admin')` | Khusus Admin |
| `POST` | `/admin/users/:id/password` | `requireRole('admin')` | Khusus Admin |
| `GET` | `/admin/categories` | `requireRole('admin')` | Khusus Admin |
| `POST` | `/admin/categories` | `requireRole('admin')` | Khusus Admin |
| `GET` | `/admin/categories/:id/edit` | `requireRole('admin')` | Khusus Admin |
| `POST` | `/admin/categories/:id` | `requireRole('admin')` | Khusus Admin |
| `POST` | `/admin/categories/:id/delete` | `requireRole('admin')` | Khusus Admin |

*Catatan Matriks Akses*: **Tidak ditemukan** route privat/sensitif yang lolos dari proteksi otentikasi. Semua route privat dilindungi `requireLogin` atau `requireRole` di level server.

## Temuan Audit
### (a) Aman Diperbaiki Sekarang
1. **Redundant Import di `routes/reports.js`**: `requireLogin` di-import dan dipasang bersama `requireRole('helpdesk', 'admin')`. Karena `requireRole` secara internal sudah otomatis memverifikasi sesi login (`if (!req.session || !req.session.user) return res.redirect('/login')`), pemasangan `requireLogin` bersamaan bersifat redundan. Telah dibersihkan dan lulus sintaks `node --check routes/reports.js`.

### (b) Perlu Keputusan Pengguna
1. **Penyimpanan Session**: Menggunakan `MemoryStore` bawaan `express-session`. Sesi akan terhapus jika aplikasi nodemon me-restart server. Apakah ingin tetap dibiarkan untuk pembelajaran atau dipindahkan ke `connect-sqlite3` di masa depan?
2. **Fallback Secret Key**: `app.js` memiliki fallback `'eticket_fallback_secret_key'` jika `SESSION_SECRET` di `.env` kosong. Apakah ingin dibuat wajib melempar error dan menghentikan proses jika env tidak disetel?
3. **Penanganan Error Global Express**: Saat ini aplikasi belum memiliki middleware error handling 4 argumen `app.use((err, req, res, next) => ...)` terpusat untuk menangkap unexpected error / throw internal 500 secara seragam.

### (c) Ide untuk Backlog
- Ditambahkan ke `issue/BACKLOG.md`: CSRF protection, rate limiter login, session persisten di SQLite, audit logging aktivitas admin, dan paginasi data.

## Hasil Verifikasi Kemanan & Kepatuhan
- **Parameter Binding**: 100% query di folder `db/` menggunakan parameter binding (`?` atau named parameter), tidak ada string concatenation query SQL langsung dari user input.
- **Escaping XSS**: 100% data dinamis pengguna di render menggunakan `<%= %>`. Tag `<%- %>` hanya digunakan secara ketat untuk partial includes (`header` dan `footer`).
- **Hardcoded Secret**: Tidak ditemukan rahasia/password/kunci API mentah di kode sumber. Hash kata sandi pada file `db/seed.js` dihasilkan dinamis saat seeder dieksekusi.
- **.gitignore**: Sudah memuat `node_modules/`, `.env`, `*.db`, `*.db-journal`, dan `*.log`.
- **Package.json**: Dependensi yang terpasang (`bcrypt`, `better-sqlite3`, `dotenv`, `ejs`, `express`, `express-session`, `express-validator`, `nodemon`) semuanya aktif digunakan di dalam sistem.

## Cara Tes
1. Jalankan `node --check` pada semua file JavaScript di `routes/`, `db/`, `middleware/`, dan `app.js` -> semua lulus sintaks.
2. Jalankan `npm run dev` dan buka rute `/reports` sebagai helpdesk dan admin -> berfungsi normal.
3. Coba akses rute admin dan helpdesk sebagai tamu atau employee -> tetap terblokir dengan benar.

## Kriteria Selesai
1. Kode bersih, tidak ada dependensi atau require tak terpakai pada file yang diaudit.
2. Matriks akses lengkap dan memastikan tidak ada kebocoran otorisasi.
3. Seluruh checklist verifikasi keamanan lolos tanpa catatan merah.

## Catatan Hasil
*(Akan diisi setelah konfirmasi selesai)*

## Evaluasi
*(Diisi oleh pengguna)*
