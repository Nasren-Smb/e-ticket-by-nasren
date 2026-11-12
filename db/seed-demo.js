const db = require('./connection');

/**
 * Script untuk mengisi data demo tiket untuk keperluan analisis dashboard reporting.
 * Menggunakan transaksi tunggal, idempotent (bisa dijalankan ulang dengan aman).
 */
function seedDemo() {
  console.log('Menjalankan seed data demo...');

  // Hapus data demo yang lama jika ada (berdasarkan awalan [DEMO])
  const deleteExisting = db.transaction(() => {
    // Ambil id tiket demo
    const demoTickets = db.prepare("SELECT id FROM tickets WHERE judul LIKE '[DEMO]%'").all();
    if (demoTickets.length > 0) {
      const ids = demoTickets.map(t => t.id);
      const placeholders = ids.map(() => '?').join(',');
      db.prepare(`DELETE FROM ticket_comments WHERE ticket_id IN (${placeholders})`).run(...ids);
      db.prepare(`DELETE FROM ticket_status_history WHERE ticket_id IN (${placeholders})`).run(...ids);
      db.prepare(`DELETE FROM tickets WHERE id IN (${placeholders})`).run(...ids);
      console.log(`Menghapus ${demoTickets.length} data demo sebelumnya.`);
    }
  });
  deleteExisting();

  // Pastikan data referensi tersedia
  const users = db.prepare('SELECT id, role FROM users').all();
  const employees = users.filter(u => u.role === 'employee');
  const helpdesks = users.filter(u => u.role === 'helpdesk');
  const categories = db.prepare('SELECT id FROM categories').all();

  if (employees.length === 0 || helpdesks.length === 0 || categories.length === 0) {
    console.error('Data awal (users / categories) tidak mencukupi untuk membuat data demo.');
    return;
  }

  // Hitung nomor urut tiket terakhir
  const lastTicket = db.prepare("SELECT kode FROM tickets WHERE kode LIKE 'TKT-%' ORDER BY id DESC LIMIT 1").get();
  let nextSeq = 1;
  if (lastTicket && lastTicket.kode) {
    const match = lastTicket.kode.match(/^TKT-(\d+)$/);
    if (match) {
      nextSeq = parseInt(match[1], 10) + 1;
    }
  }

  const priorities = ['Rendah', 'Sedang', 'Tinggi', 'Urgent'];
  const titles = [
    'Aplikasi email tidak bisa dibuka',
    'Permintaan mouse dan keyboard baru',
    'Layar monitor berkedip dan mati',
    'Akses folder sharing HRD ditolak',
    'VPN kantor sering disconnect',
    'Koneksi Wi-Fi lantai 3 lambat',
    'Printer departemen macet paper jam',
    'Lupa password akun portal internal',
    'Permintaan instalasi software design',
    'Blue screen saat booting Windows',
    'Mic headset tidak berfungsi di Zoom',
    'Kabel LAN meja kerja rusak',
    'Update sistem operasi gagal berulang kali',
    'Flashdisk kantor tidak terbaca di PC',
    'Aplikasi ERP crash saat input laporan',
    'Permintaan penggantian baterai laptop',
    'Tidak bisa kirim email ke domain luar',
    'Situs intranet tidak bisa diakses',
    'Kamera webcam laptop tidak terdeteksi',
    'Permintaan akses database staging',
    'Suara kipas PC desktop sangat bising',
    'Browser selalu error connection reset',
    'Akun terblokir karena salah PIN 3x',
    'Pembaruan antivirus gagal update definisi',
    'Speaker ruangan meeting tidak ada suara',
    'Excel lambat saat membuka file besar',
    'Permintaan backup data harddisk lama',
    'Proyektor meeting room tidak konek HDMI',
    'Lampu indikator router kedip merah',
    'Tampilan web internal berantakan di Chrome',
    'Permintaan akun email untuk staf magang baru',
    'PC sering restart sendiri saat render'
  ];

  const insertTicket = db.prepare(`
    INSERT INTO tickets (kode, created_by, category_id, prioritas, status, judul, deskripsi, assigned_to, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertHistory = db.prepare(`
    INSERT INTO ticket_status_history (ticket_id, diubah_oleh, status_lama, status_baru, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertComment = db.prepare(`
    INSERT INTO ticket_comments (ticket_id, user_id, isi, is_internal, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const runSeed = db.transaction(() => {
    const now = new Date();

    titles.forEach((judulTeks, idx) => {
      const kode = `TKT-${String(nextSeq++).padStart(4, '0')}`;
      const emp = employees[idx % employees.length];
      const cat = categories[idx % categories.length];
      const prioritas = priorities[idx % priorities.length];

      // Sebar tanggal dibuat tiket: antara hari ini hingga 150 hari ke belakang (~5 bulan)
      // Tiket indeks 0-4 sengaja dibuat lebih dari 7 hari lalu dengan status Baru/Diproses (untuk tiket lama)
      let daysAgo = (idx * 5) % 150;
      if (idx < 4) {
        daysAgo = 8 + idx * 3; // 8, 11, 14, 17 hari lalu
      }

      const ticketCreated = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const ticketCreatedStr = ticketCreated.toISOString().replace('T', ' ').substring(0, 19);

      // Tentukan status tiket
      let status = 'Selesai';
      if (idx % 5 === 0) status = 'Baru';
      else if (idx % 5 === 1) status = 'Diproses';
      else if (idx % 5 === 2) status = 'Selesai';
      else if (idx % 5 === 3) status = 'Ditutup';
      else status = 'Selesai';

      // Pastikan ada beberapa tiket lama belum selesai (Baru / Diproses)
      if (idx === 0 || idx === 1) status = 'Baru';
      if (idx === 2 || idx === 3) status = 'Diproses';

      const agent = (status === 'Baru') ? null : helpdesks[idx % helpdesks.length];
      const assignedToId = agent ? agent.id : null;

      const res = insertTicket.run(
        kode,
        emp.id,
        cat.id,
        prioritas,
        status,
        `[DEMO] ${judulTeks}`,
        `Deskripsi kendala demo: ${judulTeks}. Mohon bantuan dari tim helpdesk IT.`,
        assignedToId,
        ticketCreatedStr,
        ticketCreatedStr
      );

      const ticketId = res.lastInsertRowid;

      // Buat log riwayat status & komentar jika sudah diproses / selesai / ditutup
      if (status !== 'Baru' && agent) {
        // Diproses setelah 2 jam
        const diprosesTime = new Date(ticketCreated.getTime() + 2 * 60 * 60 * 1000);
        const diprosesStr = diprosesTime.toISOString().replace('T', ' ').substring(0, 19);

        insertHistory.run(ticketId, agent.id, 'Baru', 'Diproses', diprosesStr);

        if (status === 'Selesai' || status === 'Ditutup') {
          // Selesai setelah 14 jam dari dibuat
          const selesaiTime = new Date(ticketCreated.getTime() + 14 * 60 * 60 * 1000);
          const selesaiStr = selesaiTime.toISOString().replace('T', ' ').substring(0, 19);
          insertHistory.run(ticketId, agent.id, 'Diproses', 'Selesai', selesaiStr);

          insertComment.run(ticketId, agent.id, 'Perbaikan selesai dilakukan dan sudah dites.', 0, selesaiStr);

          if (status === 'Ditutup') {
            const ditutupTime = new Date(selesaiTime.getTime() + 24 * 60 * 60 * 1000);
            const ditutupStr = ditutupTime.toISOString().replace('T', ' ').substring(0, 19);
            insertHistory.run(ticketId, emp.id, 'Selesai', 'Ditutup', ditutupStr);
          }
        }
      }
    });
  });

  runSeed();
  console.log(`Berhasil menambahkan ${titles.length} tiket demo dengan prefix [DEMO].`);
}

// Jalankan jika dipanggil langsung via CLI
if (require.main === module) {
  seedDemo();
}

module.exports = seedDemo;
