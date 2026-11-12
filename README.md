# Web Report E-Ticket IT Helpdesk

Aplikasi web pelaporan kendala IT (helpdesk ticketing system) berbasis Express dan SQLite, dirancang sebagai proyek pembelajaran web modern dengan arsitektur bersih, bebas biaya lisensi, dan siap pakai.

---

## Fitur Utama per Peran
- **Employee (Karyawan)**:
  - Membuat tiket kendala baru (judul, kategori, prioritas, deskripsi).
  - Melihat daftar tiket milik sendiri beserta status terbarunya.
  - Membuka detail tiket dan berdiskusi lewat komentar publik dengan tim helpdesk.
- **Helpdesk (Petugas IT)**:
  - Melihat seluruh antrean tiket masuk dengan filter status dan pencarian kata kunci.
  - Mengambil tiket (*assign to me*) dan memperbarui status penanganan (`Diproses` -> `Selesai` -> `Ditutup`).
  - Menulis catatan internal (hanya terlihat oleh sesama petugas helpdesk & admin).
  - Mengakses dashboard analisis laporan & visualisasi statistik grafik.
- **Admin (Administrator)**:
  - Mengelola master pengguna (tambah akun, ubah profil divisi & peran, atur ulang password).
  - Mengelola kategori tiket (tambah kategori, ubah nama, hapus kategori yang belum terpakai).
  - Mengakses dashboard analitik pelaporan tiket.

---

## Tech Stack
- **Backend**: Node.js, Express.js.
- **Database**: SQLite (via library `better-sqlite3`, native bindings & foreign keys ON).
- **Template Engine**: EJS (Server-Side Rendering).
- **Frontend / Styling**: Bootstrap 5.3 (CDN), Bootstrap Icons (CDN), Chart.js 4.4.7 (CDN).
- **Keamanan & Utilitas**: `bcrypt` (hashing password), `express-session`, `express-validator`, `dotenv`, `nodemon`.

---

## Prasyarat Lingkungan
- **Node.js**: Minimal versi v18.0.0 ke atas (rekomendasi LTS v20 atau v22; v24 didukung dengan `better-sqlite3@13.0.3`).
- **NPM**: Bawaan Node.js.
- **Compiler C++ (Opsional)**: Hanya jika binary prebuilt `better-sqlite3` atau `bcrypt` tidak tersedia di sistem OS Anda.

---

## Instalasi dan Menjalankan Aplikasi
1. **Clone repositori**:
   ```bash
   git clone <url-repository>
   cd e-ticket
   ```
2. **Pasang dependensi**:
   ```bash
   npm install
   ```
3. **Konfigurasi file environment**:
   Salin `.env.example` menjadi `.env` lalu isi nilai `SESSION_SECRET`:
   ```bash
   cp .env.example .env
   ```
4. **Inisialisasi database (Migrasi skema 5 tabel)**:
   ```bash
   npm run db:migrate
   ```
5. **Isi data awal pengguna dan kategori**:
   ```bash
   npm run db:seed
   ```
6. *(Opsional)* **Isi data demo tiket untuk pengujian report**:
   ```bash
   npm run db:seed-demo
   ```
7. **Jalankan server aplikasi**:
   ```bash
   npm run dev
   ```
8. Buka di browser: `http://localhost:3000`.

---

## Akun Pengguna Bawaan (Seed Development)
> [!WARNING]
> Kredensial di bawah ini **HANYA untuk lingkungan pengujian dan development lokal**. Jangan gunakan password ini di lingkungan produksi!

| Email | Peran | Divisi | Password Default |
|---|---|---|---|
| `budi@perusahaan.local` | `employee` | Keuangan | `password123` |
| `dewi@perusahaan.local` | `employee` | Pemasaran | `password123` |
| `siti@perusahaan.local` | `helpdesk` | IT Support | `password123` |
| `eko@perusahaan.local` | `helpdesk` | IT Support | `password123` |
| `admin@perusahaan.local` | `admin` | IT Infrastructure | `password123` |

---

## Daftar Script NPM
- `npm start`: Menjalankan aplikasi di mode production (`node app.js`).
- `npm run dev`: Menjalankan server development dengan auto-reload (`nodemon app.js`).
- `npm run db:migrate`: Menjalankan DDL migrasi SQL pada `db/migrations/001_init.sql`.
- `npm run db:seed`: Memasukkan data awal (5 pengguna & 5 kategori) secara idempotent.
- `npm run db:seed-demo`: Memasukkan ~32 tiket contoh bervariasi untuk visualisasi dashboard report.

---

## Struktur Folder Ringkas
- `app.js`: Entry point aplikasi, konfigurasi middleware Express, session, dan router.
- `routes/`: Handler rute per modul (`auth`, `tickets`, `helpdesk`, `reports`, `admin`, `dashboard`).
- `views/`: Template EJS (`partials/`, `tickets/`, `helpdesk/`, `admin/`, `reports/`).
- `db/`: Koneksi SQLite, helper query per tabel, migrasi SQL, dan skrip seeder.
- `middleware/`: Middleware otentikasi (`requireLogin`) dan otorisasi (`requireRole`).
- `public/`: Asset statis klien (CSS custom dan file JavaScript).
- `issue/`: Manajemen tahapan pengerjaan (file per tahap dan backlog).
- `docs/`: Dokumentasi arsitektur (`PROJECT_MAP.md`) dan panduan pengujian (`TESTING.md`).

---

## Alur Transisi Status Tiket
Tiket berpindah status secara satu arah sesuai siklus hidup helpdesk:
```text
[Baru] ---> [Diproses] ---> [Selesai] ---> [Ditutup] (Final)
                 ^               |
                 +---------------+ (Dapat dikembalikan jika kendala berulang)
```
- Tiket `Ditutup` bersifat final dan mengunci penambahan komentar baru.

---

## Batasan Sistem yang Diketahui
1. **Session di Memori**: Menggunakan memory-store default `express-session`, sehingga sesi pengguna akan ter-reset saat server dimatikan/restart.
2. **Belum Ada CSRF Token**: Proteksi form masih bergantung pada session cookie `sameSite: 'lax'` dan validasi server-side.
3. **Belum Ada Rate Limiting**: Endpoint login belum memiliki pembatasan percobaan brute-force.
4. **SQLite Tunggal**: Basis data SQLite cocok untuk skala pembelajaran/organisasi kecil, bukan beban multi-server konkurensi tinggi.
5. **Akun Pengguna Permanen**: Belum menyediakan fitur soft-delete atau nonaktifkan akun pengguna demi menjaga integritas data riwayat tiket.

---

## Panduan Troubleshooting
- **Error `EADDRINUSE: address already in use :::3000`**: Port 3000 sedang dipakai proses lain/nodemon lama. Matikan proses tersebut melalui Task Manager atau jalankan `Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force` di PowerShell.
- **Error kompilasi `better-sqlite3` / `bcrypt`**: Pastikan versi Node.js kompatibel dengan prebuilt binaries (gunakan `better-sqlite3` >= 13.0.3 untuk Node.js v24).
- **Reset Ulang Database**: Hapus file `db/eticket.db` (dan `.db-journal` jika ada), lalu jalankan kembali `npm run db:migrate` dan `npm run db:seed`.

---

## Panduan Berkontribusi
Pengerjaan proyek mengikuti prinsip bertahap (satu tahap per branch Git). Silakan merujuk pada direktori `issue/README.md` dan file panduan `AGENTS.md`.

