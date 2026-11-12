# Backlog Ide & Fitur Masa Depan

Daftar fitur, ide peningkatan, atau perbaikan di luar cakupan tahap aktif yang dapat dikerjakan di kemudian hari. Dikelompokkan berdasarkan kategori dan tingkat prioritas.

---

## 1. Keamanan (Security)
- [ ] **[Tinggi]** Proteksi CSRF token untuk semua form transaksi (POST / PUT / DELETE) menggunakan middleware seperti `csurf` atau token berbasis session.
- [ ] **[Tinggi]** Rate limiting pada endpoint login (misal via `express-rate-limit`) untuk mencegah serangan brute-force kredensial.
- [ ] **[Sedang]** Sanitasi input teks mendalam terhadap format konten khusus dan validasi MIME type ketat pada berkas.
- [ ] **[Sedang]** Penanganan kedaluwarsa sesi (session timeout) otomatis setelah periode tidak aktif tertentu.

---

## 2. Fitur Fungsional (Features)
- [ ] **[Tinggi]** Paginasi dan filter pencarian lanjutan pada daftar tiket dan daftar pengguna admin.
- [ ] **[Tinggi]** Filter rentang tanggal kustom pada dashboard reporting dan fitur ekspor laporan ke format Excel/CSV atau PDF.
- [ ] **[Sedang]** Unggah lampiran berkas (screenshot/file dokumen error) pada pembuatan tiket dan percakapan komentar.
- [ ] **[Sedang]** Pengaturan nonaktifkan atau penonaktifan akun pengguna (soft-delete / status non-aktif) tanpa menghapus histori tiket.
- [ ] **[Sedang]** Fitur edit atau hapus komentar dengan batas waktu toleransi dan penanda "(diedit)".
- [ ] **[Sedang]** Notifikasi otomatis via email (menggunakan Nodemailer) saat ada tiket baru, penugasan tiket, komentar baru, atau perubahan status.
- [ ] **[Rendah]** Fitur registrasi mandiri pengguna baru (self-registration) dengan persetujuan admin.
- [ ] **[Rendah]** Fitur lupa kata sandi dan reset password mandiri melalui tautan verifikasi email.
- [ ] **[Rendah]** Fitur ubah kata sandi dan pembaruan profil mandiri di halaman dashboard pengguna.
- [ ] **[Rendah]** Peringatan Service Level Agreement (SLA) untuk tiket yang mendekati atau melewati batas waktu penanganan.
- [ ] **[Rendah]** Tombol pengalih tema gelap (dark mode toggle) pada antarmuka.

---

## 3. Peningkatan Teknis & Infrastruktur (Technical & Infrastructure)
- [ ] **[Tinggi]** Penyimpanan session persisten di database (misal menggunakan `connect-sqlite3` atau session store berbasis SQL) agar login tidak terputus saat server restart.
- [ ] **[Tinggi]** Migrasi sistem basis data ke PostgreSQL atau MySQL untuk mendukung lingkungan produksi multi-instance dan konkurensi tinggi.
- [ ] **[Sedang]** Pembaruan session pengguna secara real-time saat perannya diubah oleh administrator di panel admin.
- [ ] **[Sedang]** Audit log sistem (activity logging) yang mencatat seluruh aksi perubahan data penting oleh admin dan helpdesk.
- [ ] **[Rendah]** Penerapan automated end-to-end (E2E) testing menggunakan framework pengujian seperti Playwright atau Cypress.
