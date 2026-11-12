# Issue 08: Admin - Kelola Pengguna dan Kategori

## Status
Selesai

## Branch
`tahap-08-admin`

## Prasyarat
Tahap 07 selesai (Dashboard reporting dengan Chart.js sudah berjalan, proteksi role sudah aktif).

## Hasil Tahap Sebelumnya (dari PROJECT_MAP)
- Dashboard pelaporan `/reports` selesai menggunakan Chart.js dengan proteksi role `helpdesk` dan `admin`.
- Metrik KPI tiket, grafik status, kategori, tren bulanan, beban kerja helpdesk, dan daftar tiket lama.
- Data demo diisi melalui skrip `db/seed-demo.js`.

## Tujuan
Admin bisa mengelola pengguna dan kategori tiket secara penuh melalui web. Mengganti halaman placeholder `/admin` menjadi dashboard admin yang fungsional dengan modul manajemen pengguna dan manajemen kategori.

## Cakupan
1. Menambahkan fungsi helper di `db/users.js`:
   - `listAll()`: semua user tanpa `password_hash`, urut nama ASC.
   - `findByIdBasic(id)`: id, nama, email, divisi, role (tanpa hash).
   - `emailTakenByOther(email, id)`: cek email duplikat selain id user tersebut.
   - `createUser({ nama, email, divisi, role, passwordHash })`: simpan user baru.
   - `updateUser(id, { nama, divisi, role })`: ubah nama, divisi, role user.
   - `updatePassword(id, passwordHash)`: atur ulang password.
   - `countAdmins()`: menghitung jumlah user role 'admin'.
   - `countOpenAssigned(id)`: menghitung tiket dengan `assigned_to = id` dan status 'Diproses' atau 'Selesai'.
2. Menambahkan fungsi helper di `db/categories.js`:
   - `listAllWithCount()`: semua kategori + jumlah tiket via LEFT JOIN, urut nama ASC.
   - `findById(id)`: cari kategori berdasarkan id.
   - `nameTakenByOther(nama, id)`: cek nama kategori duplikat (case-insensitive).
   - `create(nama)`: tambah kategori baru.
   - `rename(id, nama)`: ubah nama kategori.
   - `countTickets(id)`: hitung tiket yang memakai kategori tersebut.
   - `countAll()`: total jumlah kategori.
   - `remove(id)`: hapus kategori.
3. Rute di `routes/admin.js` (semua dilindungi `requireRole('admin')`):
   - `GET /admin`: Dashboard admin dengan metrik jumlah pengguna dan jumlah kategori.
   - `GET /admin/users`: Daftar pengguna.
   - `GET /admin/users/new`: Form tambah pengguna.
   - `POST /admin/users`: Simpan pengguna baru (validasi express-validator, hash bcrypt).
   - `GET /admin/users/:id/edit`: Form edit pengguna & reset password.
   - `POST /admin/users/:id`: Simpan perubahan nama, divisi, role (dengan aturan bisnis admin & helpdesk).
   - `POST /admin/users/:id/password`: Reset password pengguna.
   - `GET /admin/categories`: Daftar kategori & form tambah.
   - `POST /admin/categories`: Tambah kategori baru.
   - `GET /admin/categories/:id/edit`: Form edit nama kategori.
   - `POST /admin/categories/:id`: Simpan perubahan nama kategori.
   - `POST /admin/categories/:id/delete`: Hapus kategori (dicegah jika dipakai tiket atau sisa 1).
4. Views & Public JS:
   - `views/admin.ejs`: Dashboard admin dengan 2 kartu (Pengguna & Kategori) dan navigasi.
   - `views/admin/users/index.ejs`: Tabel pengguna + tombol tambah & ubah.
   - `views/admin/users/new.ejs`: Form tambah pengguna.
   - `views/admin/users/edit.ejs`: Form ubah pengguna + form reset password.
   - `views/admin/categories/index.ejs`: Tabel kategori + form tambah + tombol ubah & hapus.
   - `views/admin/categories/edit.ejs`: Form ganti nama kategori.
   - `public/js/admin.js`: Handler konfirmasi `data-confirm` pada tombol submit.
5. Navbar:
   - Pastikan link "Admin" di `views/partials/header.ejs` mengarah ke `/admin` khusus role `admin`.

## Di Luar Cakupan
- Hapus atau nonaktifkan pengguna.
- Ubah alamat email pengguna.
- Registrasi mandiri / lupa password lewat email.
- Paginasi dan pencarian pengguna.
- Log aktivitas admin.
- CSRF token.
- Memperbarui session pengguna yang sedang login saat perannya diubah.

## File yang BOLEH Dibaca
- `docs/PROJECT_MAP.md`
- `app.js`
- `middleware/auth.js`
- `routes/admin.js`
- `routes/helpdesk.js`
- `db/users.js`
- `db/categories.js`
- `db/connection.js`
- `db/migrations/001_init.sql`
- `db/seed.js`
- `views/admin.ejs`
- `views/helpdesk/index.ejs`
- `views/partials/header.ejs`
- `package.json`

## File yang Akan Dibuat/Diubah
- `issue/08-admin.md` (Dibuat)
- `db/users.js` (Diubah)
- `db/categories.js` (Diubah)
- `routes/admin.js` (Diubah)
- `views/admin.ejs` (Diubah)
- `views/admin/users/index.ejs` (Dibuat)
- `views/admin/users/new.ejs` (Dibuat)
- `views/admin/users/edit.ejs` (Dibuat)
- `views/admin/categories/index.ejs` (Dibuat)
- `views/admin/categories/edit.ejs` (Dibuat)
- `public/js/admin.js` (Dibuat)
- `views/partials/header.ejs` (Diubah bila perlu)
- `docs/PROJECT_MAP.md` (Diubah)
- `issue/README.md` (Diubah)

## Checklist
- [x] Buat file issue `issue/08-admin.md`
- [x] Tambah helper query di `db/users.js`
- [x] Tambah helper query di `db/categories.js`
- [x] Implementasikan routes di `routes/admin.js` lengkap dengan validasi dan aturan bisnis
- [x] Update view `views/admin.ejs`
- [x] Buat view modul pengguna (`views/admin/users/*.ejs`)
- [x] Buat view modul kategori (`views/admin/categories/*.ejs`)
- [x] Buat `public/js/admin.js` untuk form konfirmasi
- [x] Verifikasi `views/partials/header.ejs`
- [x] Lakukan pengetesan manual dan terotomatisasi
- [x] Perbarui `docs/PROJECT_MAP.md`, `issue/README.md`, dan Catatan hasil

## Cara Tes
1. Login sebagai `admin@perusahaan.local` / `password123`.
2. Buka `/admin`: Dashboard menampilkan kartu jumlah pengguna dan kategori.
3. Buka `/admin/users`: Muncul daftar user tanpa `password_hash`.
4. Tambah user baru (misal: `andi@perusahaan.local`, role employee, password `password123`). Coba login dengan akun tersebut di browser/incognito terpisah.
5. Coba buat user dengan email kembar atau password < 8 karakter -> pastikan muncul pesan error validasi.
6. Edit user diri sendiri (admin): Ubah nama/divisi berhasil; coba ubah role sendiri -> ditolak dengan flash message error.
7. Edit user admin lain jika ada, atau cek aturan admin terakhir jika hanya 1 admin -> role admin tidak bisa diturunkan.
8. Edit user helpdesk yang memegang tiket 'Diproses'/'Selesai' -> penolakan perubahan peran dengan flash message error.
9. Reset password user -> verifikasi user login dengan password baru dan password lama tidak berlaku.
10. Buka `/admin/categories`: Tambah kategori baru -> muncul di daftar dan muncul di dropdown tiket karyawan (`/tickets/new`).
11. Coba tambah kategori kembar (case-insensitive) -> ditolak.
12. Hapus kategori yang sudah dipakai tiket -> ditolak. Hapus kategori yang belum terpakai -> berhasil dengan konfirmasi dialog.
13. Login sebagai employee atau helpdesk dan coba akses `/admin`, `/admin/users`, `/admin/categories` -> mendapat HTTP 403.

## Kriteria Selesai
- Semua 13 kriteria dan aturan bisnis di deskripsi instruksi terpenuhi.
- Tidak ada query SQL di file routes.
- Semua data pengguna ter-escape `<%= %>`.
- Password di-hash bcrypt dan tidak pernah bocor ke view/log.
- Server dimatikan setelah pengujian dan tidak ada perintah git yang dijalankan.

## Catatan Hasil
1. **File yang Dibuat**:
   - `views/admin/users/index.ejs`: Daftar pengguna terdaftar tanpa mengekspos hash password.
   - `views/admin/users/new.ejs`: Formulir pendaftaran pengguna baru oleh admin.
   - `views/admin/users/edit.ejs`: Formulir pembaruan profil pengguna dan reset kata sandi.
   - `views/admin/categories/index.ejs`: Daftar kategori beserta jumlah tiket dan formulir penambahan.
   - `views/admin/categories/edit.ejs`: Formulir ubah nama kategori.
   - `public/js/admin.js`: Skrip penanganan konfirmasi submit form via `data-confirm`.
2. **File yang Diubah**:
   - `db/users.js`: Penambahan query `listAll`, `findByIdBasic`, `emailTakenByOther`, `createUser`, `updateUser`, `updatePassword`, `countAdmins`, `countOpenAssigned`.
   - `db/categories.js`: Penambahan query `listAllWithCount`, `findById`, `nameTakenByOther`, `create`, `rename`, `countTickets`, `countAll`, `remove`.
   - `routes/admin.js`: Penggantian placeholder menjadi 12 rute admin lengkap beserta validasi express-validator dan aturan bisnis.
   - `views/admin.ejs`: Dashboard admin dengan metrik jumlah pengguna & kategori.
   - `docs/PROJECT_MAP.md`: Pembaruan arsitektur dan tabel route Tahap 08.
   - `issue/README.md`: Status Tahap 08 diperbarui menjadi Selesai.
3. **Pesan Commit yang Disarankan**:
   - `feat(admin): tambahkan modul manajemen pengguna dan kategori tiket`

## Evaluasi
(Diisi oleh pengguna)
