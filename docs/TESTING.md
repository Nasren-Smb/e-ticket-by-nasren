# Panduan Pengujian Manual (docs/TESTING.md)

Dokumen ini berisi checklist skenario pengujian fungsional manual aplikasi E-Ticket IT Helpdesk berdasarkan implementasi Tahap 03 hingga Tahap 08.

---

## 1. Autentikasi dan Session (Tahap 03)
- [ ] Akses `/dashboard` tanpa login menggunakan browser incognito -> Otomatis diarahkan ke `/login`.
- [ ] Login dengan email salah atau password keliru di `/login` -> Menampilkan pesan error `"Email atau password salah"`.
- [ ] Login menggunakan akun `budi@perusahaan.local` / `password123` -> Berhasil masuk ke `/dashboard`, menampilkan nama dan role `employee`.
- [ ] Klik tombol "Keluar" (Logout) di navbar -> Sesi berakhir, diarahkan ke beranda, dan menekan tombol Back browser tidak membuka dashboard.
- [ ] Verifikasi cookie sesi memiliki flag `HttpOnly` dan `SameSite=Lax`.

---

## 2. Tiket Sisi Employee / Karyawan (Tahap 04)
- [ ] Login sebagai `budi@perusahaan.local` dan buka `/tickets` -> Menampilkan tabel daftar tiket kendala milik sendiri.
- [ ] Buka `/tickets/new` dan submit form kosong -> Validasi gagal, menampilkan pesan error per field tanpa mereset nilai form.
- [ ] Buat tiket baru dengan judul, kategori, prioritas, dan deskripsi valid -> Berhasil tersimpan dengan status awal `'Baru'` dan nomor urut `TKT-XXXX`.
- [ ] Buka detail tiket yang baru dibuat di `/tickets/:id` -> Menampilkan informasi lengkap tiket milik sendiri.
- [ ] Login sebagai karyawan lain `dewi@perusahaan.local`, coba akses URL tiket milik Budi `/tickets/1` -> Menampilkan error `404 Not Found` (proteksi IDOR).

---

## 3. Alur Kerja dan Status Helpdesk (Tahap 05)
- [ ] Login sebagai `siti@perusahaan.local` dan buka `/helpdesk/tickets` -> Menampilkan seluruh tiket antrean dari semua karyawan.
- [ ] Gunakan filter status (misal: 'Diproses') dan form pencarian kata kunci pada kode/judul -> Daftar tiket terfilter dengan akurat.
- [ ] Buka tiket berstatus 'Baru' yang belum memiliki petugas di `/helpdesk/tickets/:id` -> Tombol "Ambil Tiket Ini" aktif.
- [ ] Klik "Ambil Tiket Ini" -> Status tiket berubah menjadi `'Diproses'`, `assigned_to` terisi nama Siti, dan riwayat status bertambah.
- [ ] Buka tiket yang dipegang oleh petugas lain (misal: Eko) -> Formulir ubah status tidak muncul (hanya petugas yang ditugaskan yang boleh mengubah status).
- [ ] Ubah status dari `'Diproses'` ke `'Selesai'` -> Status berhasil diperbarui dan tercatat pada riwayat perubahan status.
- [ ] Ubah status dari `'Selesai'` ke `'Ditutup'` -> Status tiket menjadi `'Ditutup'`, `closed_at` tercatat di database, dan tiket terkunci.

---

## 4. Komentar dan Catatan Internal (Tahap 06)
- [ ] Login sebagai `budi@perusahaan.local`, buka tiket miliknya, kirim komentar baru -> Komentar publik berhasil muncul pada riwayat percakapan.
- [ ] Login sebagai `siti@perusahaan.local`, buka tiket tersebut, kirim komentar publik -> Komentar muncul dan dapat dibaca oleh employee pembuat tiket.
- [ ] Login sebagai `siti@perusahaan.local`, centang opsi "Catatan Internal (Hanya Helpdesk & Admin)", lalu kirim komentar -> Komentar bertanda badge catatan internal warna kuning.
- [ ] Login kembali sebagai `budi@perusahaan.local`, buka tiket tersebut -> Catatan internal TIDAK PERNAH muncul (terisolasi di level query database).
- [ ] Coba kirim komentar pada tiket yang berstatus `'Ditutup'` -> Form komentar terkunci/nonaktif dan percobaan POST ditolak oleh server.

---

## 5. Dashboard Analisis dan Reporting (Tahap 07)
- [ ] Login sebagai `budi@perusahaan.local` (employee) dan buka `/reports` -> Mendapat respon `403 Forbidden` (menu Report tidak ada di navbar).
- [ ] Login sebagai `siti@perusahaan.local` (helpdesk) dan klik menu "Report" -> Halaman `/reports` terbuka dengan normal.
- [ ] Verifikasi kartu metrik ringkasan (Total, Baru, Diproses, Selesai, Ditutup, Rata-rata Waktu Penyelesaian) terhitung akurat.
- [ ] Verifikasi ketiga grafik Chart.js ter-render tanpa error console: Status (Doughnut), Kategori (Bar), dan Tren 12 Bulan (Line).
- [ ] Periksa tabel beban kerja petugas helpdesk -> Menampilkan rekap tiket ditangani per akun staf IT.
- [ ] Periksa tabel tiket lama (> 7 hari) -> Kode tiket memiliki link aktif yang dapat diklik langsung ke `/helpdesk/tickets/:id`.
- [ ] Login sebagai `admin@perusahaan.local`, buka `/reports` -> Halaman laporan terbuka, namun kode tiket pada tabel tiket lama berupa teks biasa (bukan link aktif).

---

## 6. Modul Admin: Manajemen Pengguna (Tahap 08)
- [ ] Login sebagai `admin@perusahaan.local`, buka `/admin` -> Tampil dashboard dengan kartu total pengguna dan total kategori.
- [ ] Buka `/admin/users` -> Menampilkan seluruh daftar pengguna terdaftar tanpa mengekspos hash kata sandi.
- [ ] Buka `/admin/users/new`, daftarkan user baru dengan email kembar atau password < 8 karakter -> Validasi gagal dengan pesan yang jelas.
- [ ] Daftarkan user baru yang valid -> User berhasil dibuat dan dapat langsung digunakan untuk login di sistem.
- [ ] Buka form edit akun admin sendiri `/admin/users/3/edit`, coba ubah role menjadi employee -> Ditolak dengan pesan flash error.
- [ ] Coba turunkan peran satu-satunya admin di sistem -> Ditolak dengan pesan aturan admin terakhir.
- [ ] Buka form edit staf helpdesk yang masih menangani tiket aktif (Diproses/Selesai) -> Perubahan peran ditolak dengan pesan peringatan.
- [ ] Isi form "Atur Ulang Password" pada profil pengguna -> Password berhasil diubah, dan user hanya bisa login menggunakan password baru.

---

## 7. Modul Admin: Manajemen Kategori (Tahap 08)
- [ ] Buka `/admin/categories` -> Menampilkan tabel master kategori beserta jumlah tiket yang menggunakannya.
- [ ] Tambahkan kategori baru (misal: "Database") -> Berhasil ditambahkan dan langsung muncul di opsi dropdown tiket baru employee.
- [ ] Tambahkan kategori dengan nama yang sudah ada (misal: "database" / case-insensitive) -> Ditolak dengan pesan error validasi duplikat.
- [ ] Buka form ubah nama kategori, simpan nama baru -> Nama kategori terbarui di seluruh sistem.
- [ ] Coba hapus kategori yang masih memiliki tiket terkait -> Tombol hapus nonaktif / aksi POST ditolak dengan pesan error.
- [ ] Hapus kategori yang belum pernah digunakan oleh tiket apa pun -> Dialog konfirmasi browser muncul, dan kategori berhasil terhapus setelah dikonfirmasi.

---

## 8. Hak Akses Lintas Peran (Otorisasi Matriks)
- [ ] Tamu tanpa login mengakses rute terproteksi (`/dashboard`, `/tickets`, `/helpdesk/tickets`, `/reports`, `/admin`) -> Semua diarahkan ke `/login`.
- [ ] Role `employee` mengakses `/helpdesk/tickets` atau `/admin` -> Mendapat HTTP `403 Forbidden`.
- [ ] Role `helpdesk` mengakses `/admin` atau form edit kategori -> Mendapat HTTP `403 Forbidden`.
- [ ] Role `admin` mengakses form tiket helpdesk tanpa tugas -> Terproteksi sesuai aturan role helpdesk.
- [ ] Seluruh data input pengguna yang ditampilkan di browser ter-escape secara aman (kebal XSS payload).

