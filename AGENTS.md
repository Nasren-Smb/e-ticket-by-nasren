# Panduan Agent (AGENTS.md)

Dokumen ini adalah acuan kerja utama bagi AI Agent dalam mengembangkan proyek E-Ticket IT Helpdesk.

## Ringkasan Proyek
- **Aplikasi**: Web Report E-Ticket IT Helpdesk (proyek belajar web pemula, semua tools gratis).
- **Tech Stack**: Node.js, Express, EJS, Bootstrap 5, SQLite (better-sqlite3), dotenv, bcrypt.
- **Rencana Tambahan**: express-validator, express-session, Chart.js.
- **Peran Pengguna**:
  - `employee` (karyawan): membuat tiket, melihat tiket miliknya, membalas komentar.
  - `helpdesk`: melihat semua tiket, memproses tiket, mengubah status, catatan internal.
  - `admin`: mengelola pengguna dan kategori.
- **Alur Status Tiket**: `Baru` -> `Diproses` -> `Selesai` -> `Ditutup`

## Protokol & Urutan Membaca File (Wajib)
1. Baca `AGENTS.md` (panduan umum & aturan).
2. Baca `docs/PROJECT_MAP.md` (peta file, rute, dan arsitektur aktif).
3. Baca file issue tahap aktif di `issue/NN-nama.md`.
4. BACA HANYA file yang tercantum di bagian "File yang BOLEH dibaca" pada issue tersebut.
5. **Dilarang** membaca seluruh repo, `node_modules/`, file `.db`, atau `package-lock.json`.
6. Jika membutuhkan file lain di luar izin: sebutkan nama file beserta alasannya, lalu tanyakan kepada user terlebih dahulu.

## Aturan Kerja & Kode
- Kerjakan **HANYA satu tahap per permintaan**. Jangan melompat ke tahap berikutnya.
- Jangan ubah file di luar cakupan tahap aktif.
- Tanpa framework frontend (gunakan vanilla JS & Bootstrap 5 CDN) dan tanpa ORM (SQL standar via better-sqlite3).
- Semua query database harus diletakkan di dalam folder `db/`.
- Password wajib di-hash dengan `bcrypt`.
- Nilai rahasia disimpan di `.env` (gunakan `.env.example` sebagai acuan).
- Tulis kode sederhana dengan komentar singkat berbahasa Indonesia untuk pemula.
- Jika ada hal yang tidak jelas: tanyakan kepada user, jangan menebak.
- Ide atau fitur di luar cakupan tahap aktif dicatat di `issue/BACKLOG.md`.

## Aturan Git (Ketat)
- **Agent DILARANG menjalankan perintah git APA PUN** (`status`, `add`, `commit`, `push`, `diff`, `checkout`, dll.).
- Seluruh operasi Git dikerjakan secara manual oleh user.
- Agent hanya diperbolehkan menyarankan teks pesan commit.

## Prosedur Selesai Pengerjaan
1. Berikan ringkasan singkat: (1) file dibuat/diubah, (2) langkah tes manual, (3) saran pesan commit (hanya teks).
2. **Berhenti** dan tunggu konfirmasi user.
3. Setelah dikonfirmasi user: centang checklist tugas, isi Catatan hasil & Evaluasi, ubah Status jadi `Selesai`, serta perbarui `issue/README.md` dan `docs/PROJECT_MAP.md`.
4. Jangan ubah file issue untuk tahap yang sudah berstatus `Selesai`.

