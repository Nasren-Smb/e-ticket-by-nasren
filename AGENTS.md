# Panduan Agent (AGENTS.md)

## UNTUK AI BARU (Wajib Dibaca Pertama Kali)
1. **Urutan Membaca**: Baca `AGENTS.md` -> `docs/PROJECT_MAP.md` -> file issue tahap berikutnya di folder `issue/` (selalu periksa `issue/README.md` untuk mengetahui tahap aktif yang sedang berjalan).
2. **Jangan Membaca Seluruh Repo**: BACA HANYA file yang diizinkan pada bagian "File yang BOLEH dibaca" di file issue tahap aktif. Jika membutuhkan file lain di luar izin, sebutkan nama file beserta alasannya secara eksplisit, lalu tanyakan kepada pengguna terlebih dahulu.
3. **Jangan Mendahului**: Dilarang memulai pengerjaan atau menulis kode untuk tahap berikutnya sebelum diminta secara jelas oleh pengguna.

---

## Ringkasan Proyek
- **Aplikasi**: Web Report E-Ticket IT Helpdesk (proyek belajar web pemula, semua tools gratis).
- **Tech Stack**: Node.js, Express, EJS, Bootstrap 5 (CDN), SQLite (better-sqlite3), dotenv, bcrypt, express-session, express-validator.
- **Rencana Tambahan**: Chart.js.
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
- Semua data pengguna yang dirender ke tampilan wajib di-escape dengan `<%= %>` untuk mencegah XSS.
- Jika ada hal yang tidak jelas: tanyakan kepada user, jangan menebak.
- Ide atau fitur di luar cakupan tahap aktif dicatat di `issue/BACKLOG.md`.

## Aturan Git (Ketat)
- **Agent DILARANG menjalankan perintah git APA PUN** (`status`, `add`, `commit`, `push`, `diff`, `checkout`, dll.).
- Seluruh operasi Git dikerjakan secara manual oleh user.
- Agent hanya diperbolehkan menyarankan teks pesan commit.

## Prosedur Selesai Pengerjaan
1. Berikan ringkasan singkat: (1) file dibuat/diubah, (2) langkah tes manual, (3) saran pesan commit (hanya teks).
2. **Berhenti** dan tunggu konfirmasi user.
3. Setelah dikonfirmasi user: centang checklist tugas, isi Catatan hasil, ubah Status jadi `Selesai`, serta perbarui `issue/README.md` dan `docs/PROJECT_MAP.md`. Biarkan bagian Evaluasi diisi oleh user jika diminta.
4. Jangan ubah file issue untuk tahap yang sudah berstatus `Selesai`.

---

## CATATAN LINGKUNGAN
- **Sistem Operasi**: Windows (menggunakan shell PowerShell). Berikan perintah atau path yang kompatibel dengan PowerShell.
- **Port Server & Proses**: Server development menggunakan port 3000. DILARANG membiarkan server dev berjalan terus di latar belakang (background) setelah selesai tes; selalu hentikan proses setelah pengujian selesai untuk mencegah bentrok port (`EADDRINUSE`).
- **Operasi Git**: Seluruh perintah Git dikerjakan manual oleh pengguna. Agent dilarang mengeksekusi git CLI dan hanya menyarankan teks commit message.
- **Audiens**: Pengguna sedang belajar web development pemula. Berikan penjelasan yang ringkas dan jelas, kode yang terstruktur rapi, serta komentar penjelas berbahasa Indonesia yang mudah dipahami.
