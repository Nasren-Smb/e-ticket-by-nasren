# Tahap 06: Komentar dan Catatan Internal
Status: Selesai
Branch: tahap-06-komentar
Prasyarat: Tahap 05: Tiket untuk Helpdesk

## Hasil Tahap Sebelumnya (PROJECT_MAP)
- Petugas helpdesk dapat melihat seluruh antrean tiket, memfilter status, dan mencari tiket berdasarkan kode atau judul.
- Petugas helpdesk dapat mengambil tiket (`assignToUser`), mengubah status tiket sesuai `ALLOWED_TRANSITIONS`, dan setiap pergantian status tercatat otomatis di `ticket_status_history`.
- Hak akses antrean helpdesk terisolasi aman dengan proteksi `requireRole('helpdesk')`.

## Tujuan
Karyawan (`employee`) dan petugas helpdesk (`helpdesk`) dapat saling membalas komentar publik pada halaman detail tiket kendala. Petugas helpdesk juga dapat menambahkan catatan internal (`is_internal = 1`) yang hanya dapat dilihat oleh helpdesk dan tidak pernah bocor atau terlihat oleh karyawan.

## Cakupan (boleh dikerjakan)
- Pembuatan modul query database komentar di `db/comments.js`:
  - `listPublicByTicket(ticketId)`: mengambil komentar dengan `is_internal = 0` join nama & role penulis, urut waktu naik.
  - `listAllByTicket(ticketId)`: mengambil seluruh komentar (publik & internal) join nama & role penulis, urut waktu naik.
  - `create({ ticketId, userId, isi, isInternal })`: menyimpan komentar baru ke tabel `ticket_comments`.
- Pembaruan rute employee di `routes/tickets.js`:
  - `GET /tickets/:id`: memuat komentar publik via `listPublicByTicket` setelah verifikasi tiket berhasil.
  - `POST /tickets/:id/comments`: validasi input, verifikasi kepemilikan tiket via `findByIdForUser` (jika tidak cocok -> 404), penolakan jika status tiket 'Ditutup', simpan komentar publik (`isInternal = 0`), flash message, dan redirect ke detail tiket.
- Pembaruan rute helpdesk di `routes/helpdesk.js`:
  - `GET /helpdesk/tickets/:id`: memuat semua komentar (publik & internal) via `listAllByTicket`.
  - `POST /helpdesk/tickets/:id/comments`: validasi input, verifikasi tiket ada via `findById` (jika tidak ada -> 404), penolakan jika status tiket 'Ditutup', simpan komentar (publik atau internal sesuai checkbox), flash message, dan redirect ke detail tiket.
- Pembaruan tampilan:
  - `views/tickets/show.ejs`: bagian riwayat komentar publik + formulir kirim komentar; jika tiket 'Ditutup', sembunyikan form dan tampilkan pemberitahuan tiket ditutup; teks komentar di-escape `<%= %>` dengan gaya CSS `white-space: pre-wrap`.
  - `views/helpdesk/show.ejs`: bagian riwayat komentar dengan badge dan latar khusus untuk catatan internal + formulir kirim komentar dengan checkbox catatan internal; sembunyikan form jika tiket 'Ditutup'.
- Memastikan notifikasi flash message ditampilkan pada `views/tickets/show.ejs` (seperti di helpdesk).

## Di luar cakupan (jangan disentuh)
- Edit atau hapus komentar
- Lampiran file pada komentar
- Notifikasi email
- Markdown rendering
- Paginasi daftar komentar
- Akses admin ke percakapan komentar
- Membuka kembali tiket yang sudah berstatus 'Ditutup'
- Memperbarui `updated_at` tiket saat ada komentar
- CSRF token
- Mengubah `db/migrations/`, skema database, atau logika penugasan/status tiket Tahap 05

## File yang BOLEH dibaca
- `docs/PROJECT_MAP.md`
- `app.js`
- `middleware/auth.js`
- `routes/tickets.js`
- `routes/helpdesk.js`
- `db/tickets.js`
- `db/connection.js`
- `db/migrations/001_init.sql`
- `views/tickets/show.ejs`
- `views/helpdesk/show.ejs`
- `package.json`

## File yang akan dibuat/diubah
- `issue/06-komentar.md` (dibuat)
- `db/comments.js` (dibuat)
- `routes/tickets.js` (diubah)
- `routes/helpdesk.js` (diubah)
- `views/tickets/show.ejs` (diubah)
- `views/helpdesk/show.ejs` (diubah)
- `docs/PROJECT_MAP.md` (diubah setelah pengujian)
- `issue/README.md` (diubah setelah pengujian)

## Checklist tugas
- [x] Buat file issue `issue/06-komentar.md`
- [x] Buat modul database `db/comments.js` (`listPublicByTicket`, `listAllByTicket`, `create`)
- [x] Ubah `routes/tickets.js` menambahkan pemuatan komentar publik dan endpoint `POST /tickets/:id/comments`
- [x] Ubah `routes/helpdesk.js` menambahkan pemuatan semua komentar dan endpoint `POST /helpdesk/tickets/:id/comments`
- [x] Ubah `views/tickets/show.ejs` menampilkan komentar publik, flash message, dan form komentar (disable saat Ditutup)
- [x] Ubah `views/helpdesk/show.ejs` menampilkan komentar publik & internal dengan badge, serta form opsi internal
- [x] Jalankan pengujian verifikasi: komentar dua arah employee-helpdesk, catatan internal tidak bocor ke employee, penolakan pada tiket Ditutup, penolakan tiket orang lain (404), validasi panjang/kosong, dan escaping XSS

## Cara tes manual
1. Login Employee 1 (`budi@perusahaan.local` / `password123`):
   - Buka detail tiket miliknya yang aktif (`/tickets/4`).
   - Kirim komentar: "Halo helpdesk, mouse kantor tidak bergerak." -> komentar tampil dengan nama Budi Karyawan (employee).
2. Login Helpdesk (`siti@perusahaan.local` / `password123`):
   - Buka tiket tersebut (`/helpdesk/tickets/4`).
   - Komentar dari Budi terlihat di linimasa.
   - Kirim balasan publik: "Baik Pak Budi, kami bawa mouse pengganti." -> balasan tampil.
   - Kirim catatan internal (centang "Catatan internal"): "Catatan rahasia: Stok Logitech di lemari sisa 2 unit." -> catatan tampil dengan badge kuning "Catatan Internal".
3. Kembali login Employee 1 (`budi@perusahaan.local`):
   - Buka `/tickets/4`: komentar balasan dari Siti terlihat, tetapi **Catatan Internal TIDAK PERNAH muncul**.
4. Login Employee 2 (`dewi@perusahaan.local`):
   - Coba kirim komentar POST ke tiket milik Budi (`/tickets/4/comments`) -> server menolak dengan 404 (bukan miliknya).
5. Helpdesk menutup tiket (`Ditutup`):
   - Baik di halaman employee maupun helpdesk, form komentar tidak muncul.
   - Coba POST komentar langsung ke tiket yang Ditutup -> server menolak dengan flash error.
6. Uji input berisi tag `<script>alert(1)</script>` -> tampil aman sebagai teks biasa (ter-escape).

## Kriteria selesai
- Employee dan helpdesk dapat saling membalas komentar secara publik pada tiket aktif.
- Catatan internal hanya muncul di halaman helpdesk dan tidak pernah dikirim ke view employee (terisolasi di query SQL).
- Percobaan berkomentar pada tiket orang lain menghasilkan status 404.
- Tiket dengan status 'Ditutup' tidak menampilkan form komentar dan request POST langsung ditolak oleh server.
- Validasi komentar kosong atau lebih dari 1000 karakter ditolak dengan flash message.
- Input HTML/skrip jahat ditampilkan secara aman ter-escape.
- Fitur tiket employee dan helpdesk sebelumnya tetap berjalan normal.

## Catatan hasil (file diubah, pesan commit, masalah)
- **File dibuat/diubah**:
  - `issue/06-komentar.md` (dibuat)
  - `db/comments.js` (dibuat)
  - `routes/tickets.js` (diubah)
  - `routes/helpdesk.js` (diubah)
  - `views/tickets/show.ejs` (diubah)
  - `views/helpdesk/show.ejs` (diubah)
  - `docs/PROJECT_MAP.md` (diubah)
  - `issue/README.md` (diubah)
- **Pesan commit yang disarankan**:
  `feat(comments): implementasi komentar publik dan catatan internal helpdesk`
- **Masalah & Solusi**:
  Catatan internal diisolasi langsung pada level query SQL (`listPublicByTicket`) dengan klausul `WHERE is_internal = 0` sehingga data rahasia helpdesk secara arsitektural tidak pernah dikirimkan ke konteks view employee. Karakter newline komentar ditampilkan aman menggunakan CSS `white-space: pre-wrap` dengan output tetap ter-escape melalui `<%= %>`.

## Evaluasi (yang baik, yang sulit, bug, ide ke BACKLOG, waktu pengerjaan)
*(Akan diisi oleh pengguna)*
