# Panduan Agent (AGENTS.md)

## UNTUK AI BARU (Wajib Dibaca Pertama Kali)
1. **Urutan membaca**: `AGENTS.md` -> `docs/PROJECT_MAP.md` -> `issue/README.md` (cek tahap aktif) -> file issue tahap aktif di `issue/NN-nama.md`.
2. **Jangan membaca seluruh repo.** Baca HANYA file yang tercantum di bagian "File yang BOLEH dibaca" pada file issue tahap aktif. Butuh file lain: sebutkan nama dan alasannya, lalu tanyakan dulu kepada pengguna.
3. **Jangan mendahului.** Dilarang memulai tahap berikutnya sebelum diminta secara jelas.
4. **Jika dokumen bertentangan dengan kode**, anggap kode yang benar, lalu laporkan perbedaannya.
5. **Dilarang** membaca `node_modules/`, file `.db`, dan `package-lock.json`.

Status tahap TIDAK ditulis di file ini. Lihat `docs/PROJECT_MAP.md` dan `issue/README.md`.

---

## Ringkasan Proyek
- **Aplikasi**: Web Report E-Ticket IT Helpdesk (proyek belajar web pemula, semua tools gratis).
- **Tech stack**: Node.js, Express, EJS, Bootstrap 5 (CDN), Chart.js (CDN), SQLite (better-sqlite3), dotenv, bcrypt, express-session, express-validator, nodemon.
- **Struktur**: folder utama (`app.js`, `routes/`, `views/`, `public/`, `middleware/`, `db/`, `issue/`, `docs/`). Tidak ada folder `src/`.
- **Peran**: `employee` (membuat dan melihat tiket sendiri, membalas), `helpdesk` (memproses semua tiket, ubah status, catatan internal, report), `admin` (mengelola pengguna dan kategori, melihat report).
- **Status tiket**: `Baru` -> `Diproses` -> `Selesai` -> `Ditutup` (aturan transisi lengkap ada di `docs/PROJECT_MAP.md`).

## Aturan Kerja dan Kode
- Kerjakan **HANYA satu tahap per permintaan**. Jangan ubah file di luar cakupan tahap aktif.
- Tanpa framework frontend (pakai JavaScript biasa dan Bootstrap 5 CDN), tanpa ORM (SQL standar via better-sqlite3), tanpa TypeScript.
- Semua query database hanya di folder `db/`, bukan di routes. Selalu pakai parameter binding, jangan menyambung string SQL.
- **View baru**: tiru pola `views/helpdesk/index.ejs`. Tidak ada `partials/head.ejs`, jadi tiap view menulis `<head>` sendiri. Jangan membuat partial baru tanpa diminta.
- Route `/x/new` diletakkan sebelum `/x/:id`. Daftarkan route baru di `app.js`.
- Password di-hash dengan `bcrypt`. Rahasia di `.env` (acuan: `.env.example`).
- Data pengguna yang ditampilkan selalu pakai `<%= %>` (ter-escape), tidak pernah `<%- %>`.
- Identitas (`created_by`, `user_id`, `assigned_to`) selalu dari session, bukan dari form. Hak akses ditegakkan di server lewat `requireLogin` atau `requireRole`, bukan hanya dengan menyembunyikan tombol atau link.
- Tulis kode sederhana dengan komentar singkat berbahasa Indonesia.
- Ada hal yang tidak jelas: tanya, jangan menebak.
- Ide di luar cakupan tahap dicatat di `issue/BACKLOG.md`, tidak dikerjakan.

## Template File Issue
Setiap tahap punya `issue/NN-nama.md`, dibuat SEBELUM menulis kode, dengan bagian: Status, Branch, Prasyarat, Hasil tahap sebelumnya, Tujuan, Cakupan, Di luar cakupan, File yang BOLEH dibaca, File yang akan dibuat/diubah, Checklist, Cara tes, Kriteria selesai, Catatan hasil, Evaluasi.

## Aturan Git (Ketat)
- **Agent DILARANG menjalankan perintah git APA PUN** (`status`, `add`, `commit`, `push`, `diff`, `checkout`, dan lainnya).
- Seluruh operasi Git dikerjakan manual oleh pengguna.
- Agent hanya boleh menyarankan teks pesan commit.

## Prosedur Selesai Pengerjaan
1. Berikan ringkasan singkat: (1) file dibuat/diubah, (2) langkah tes manual, (3) saran pesan commit (teks saja).
2. **Berhenti** dan tunggu konfirmasi pengguna.
3. Setelah dikonfirmasi: centang checklist, isi Catatan hasil, ubah Status menjadi `Selesai`, perbarui `issue/README.md` dan `docs/PROJECT_MAP.md` (peta file, tabel route, fungsi query, status tahap, bagian Belum ada).
4. Bagian Evaluasi diisi oleh pengguna.
5. Jangan ubah file issue untuk tahap yang sudah `Selesai`.

---

## CATATAN LINGKUNGAN
- **Sistem operasi**: Windows (PowerShell). Berikan perintah dan path yang cocok untuk PowerShell.
- **Server dev**: `npm run dev` (nodemon), port 3000. Jangan biarkan server hidup di latar belakang setelah tes. Hentikan setelah selesai untuk mencegah error `EADDRINUSE`.
- **Hemat token**: jawaban singkat, jangan menampilkan isi file hasil, dan jangan membaca file di luar daftar izin.
- **Pengguna sedang belajar**: jelaskan singkat dan jelas, kode terstruktur rapi, komentar bahasa Indonesia yang mudah dipahami.
