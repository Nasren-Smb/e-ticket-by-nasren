const db = require('./connection');

/**
 * Mengambil ringkasan metrik tiket (KPI)
 * Menghitung total tiket, jumlah per status, dan rata-rata waktu penyelesaian (jam)
 */
function getSummary() {
  const counts = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'Baru' THEN 1 ELSE 0 END) AS baru,
      SUM(CASE WHEN status = 'Diproses' THEN 1 ELSE 0 END) AS diproses,
      SUM(CASE WHEN status = 'Selesai' THEN 1 ELSE 0 END) AS selesai,
      SUM(CASE WHEN status = 'Ditutup' THEN 1 ELSE 0 END) AS ditutup
    FROM tickets
  `).get();

  // Hitung rata-rata waktu penyelesaian (jam) dari tiket yang pernah berpindah ke 'Selesai'
  // Menggunakan selisih waktu dibuatnya tiket (tickets.created_at)
  // dengan transisi pertama ke status 'Selesai' di ticket_status_history
  const avgRow = db.prepare(`
    SELECT AVG(
      (julianday(h.created_at) - julianday(t.created_at)) * 24
    ) AS avg_hours
    FROM tickets t
    JOIN (
      SELECT ticket_id, MIN(created_at) AS created_at
      FROM ticket_status_history
      WHERE status_baru = 'Selesai'
      GROUP BY ticket_id
    ) h ON t.id = h.ticket_id
  `).get();

  const avgResolutionHours = avgRow && avgRow.avg_hours !== null
    ? Math.round(avgRow.avg_hours * 10) / 10
    : 0;

  return {
    total: counts.total || 0,
    baru: counts.baru || 0,
    diproses: counts.diproses || 0,
    selesai: counts.selesai || 0,
    ditutup: counts.ditutup || 0,
    avgResolutionHours
  };
}

/**
 * Menghitung jumlah tiket per status
 * Memastikan urutan tetap: 'Baru', 'Diproses', 'Selesai', 'Ditutup'
 * Status tanpa tiket tetap bernilai 0
 */
function countByStatus() {
  const statusList = ['Baru', 'Diproses', 'Selesai', 'Ditutup'];
  const rows = db.prepare(`
    SELECT status, COUNT(*) AS count
    FROM tickets
    GROUP BY status
  `).all();

  const countMap = {};
  for (const row of rows) {
    countMap[row.status] = row.count;
  }

  return statusList.map(status => ({
    status,
    count: countMap[status] || 0
  }));
}

/**
 * Menghitung jumlah tiket per kategori
 * Menampilkan semua kategori dari tabel categories (meski jumlah tiket 0), urut nama asc
 */
function countByCategory() {
  return db.prepare(`
    SELECT c.nama AS category, COUNT(t.id) AS count
    FROM categories c
    LEFT JOIN tickets t ON c.id = t.category_id
    GROUP BY c.id, c.nama
    ORDER BY c.nama ASC
  `).all();
}

/**
 * Menghitung tren tiket dibuat selama 12 bulan terakhir
 * Menghasilkan array objek [{ month: 'YYYY-MM', count: number }] terurut dari terlama ke terbaru
 */
function countByMonthLast12() {
  // Ambil data agregasi dari SQLite (format YYYY-MM)
  const rows = db.prepare(`
    SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS count
    FROM tickets
    WHERE created_at >= datetime('now', '-12 months', 'start of month')
    GROUP BY strftime('%Y-%m', created_at)
  `).all();

  const countMap = {};
  for (const row of rows) {
    countMap[row.month] = row.count;
  }

  // Bangun daftar 12 bulan kalender terakhir agar bulan dengan 0 tiket tetap tampil
  const result = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${month}`;
    result.push({
      month: monthKey,
      count: countMap[monthKey] || 0
    });
  }

  return result;
}

/**
 * Mengambil rekap beban kerja per staf helpdesk
 * Menampilkan nama petugas dan jumlah tiket yang sedang diproses, selesai, atau ditutup
 */
function workloadByAgent() {
  return db.prepare(`
    SELECT
      u.id AS user_id,
      u.nama AS agent_name,
      SUM(CASE WHEN t.status = 'Diproses' THEN 1 ELSE 0 END) AS diproses,
      SUM(CASE WHEN t.status = 'Selesai' THEN 1 ELSE 0 END) AS selesai,
      SUM(CASE WHEN t.status = 'Ditutup' THEN 1 ELSE 0 END) AS ditutup,
      COUNT(t.id) AS total_handled
    FROM users u
    LEFT JOIN tickets t ON u.id = t.assigned_to
    WHERE u.role = 'helpdesk'
    GROUP BY u.id, u.nama
    ORDER BY u.nama ASC
  `).all();
}

/**
 * Menampilkan daftar tiket yang masih 'Baru' atau 'Diproses' lebih dari 7 hari
 * Terurut dari yang paling lama dibuat
 */
function listStale(limit = 10) {
  return db.prepare(`
    SELECT
      t.id,
      t.kode,
      t.judul,
      t.prioritas,
      t.status,
      t.created_at,
      ROUND(julianday('now') - julianday(t.created_at), 1) AS age_days,
      c.nama AS category_name,
      u.nama AS pembuat_nama,
      p.nama AS petugas_nama
    FROM tickets t
    JOIN categories c ON t.category_id = c.id
    JOIN users u ON t.created_by = u.id
    LEFT JOIN users p ON t.assigned_to = p.id
    WHERE t.status IN ('Baru', 'Diproses')
      AND julianday('now') - julianday(t.created_at) > 7
    ORDER BY t.created_at ASC
    LIMIT ?
  `).all(limit);
}

module.exports = {
  getSummary,
  countByStatus,
  countByCategory,
  countByMonthLast12,
  workloadByAgent,
  listStale
};
