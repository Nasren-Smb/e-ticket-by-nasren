const db = require('./connection');

/**
 * Membuat tiket baru dengan format kode otomatis TKT-0001 dalam transaksi database
 * @param {object} data - { judul, deskripsi, category_id, created_by, prioritas }
 * @returns {object} tiket yang baru dibuat
 */
function createTicket(data) {
  const insertTicketTx = db.transaction((ticketData) => {
    // 1. Dapatkan id terakhir untuk menentukan nomor urut berikutnya
    const lastRow = db.prepare('SELECT id FROM tickets ORDER BY id DESC LIMIT 1').get();
    const nextId = (lastRow ? lastRow.id : 0) + 1;

    // 2. Format kode tiket 4 digit (misal: TKT-0001, TKT-0002)
    const formattedCode = 'TKT-' + String(nextId).padStart(4, '0');

    // 3. Masukkan data tiket (status 'Baru' & assigned_to NULL)
    const stmt = db.prepare(`
      INSERT INTO tickets (kode, judul, deskripsi, category_id, created_by, assigned_to, prioritas, status)
      VALUES (?, ?, ?, ?, ?, NULL, ?, 'Baru')
    `);

    const result = stmt.run(
      formattedCode,
      ticketData.judul,
      ticketData.deskripsi,
      ticketData.category_id,
      ticketData.created_by,
      ticketData.prioritas
    );

    return {
      id: result.lastInsertRowid,
      kode: formattedCode
    };
  });

  return insertTicketTx(data);
}

/**
 * Mengambil semua tiket milik pengguna tertentu
 * @param {number|string} userId
 * @returns {Array<object>} daftar tiket milik user
 */
function listByUser(userId) {
  const stmt = db.prepare(`
    SELECT t.id, t.kode, t.judul, t.prioritas, t.status, t.created_at,
           c.nama AS category_nama
    FROM tickets t
    JOIN categories c ON t.category_id = c.id
    WHERE t.created_by = ?
    ORDER BY t.created_at DESC, t.id DESC
  `);
  return stmt.all(userId);
}

/**
 * Mengambil detail satu tiket milik pengguna tertentu (memastikan isolasi)
 * @param {number|string} id
 * @param {number|string} userId
 * @returns {object|undefined} data tiket atau undefined jika bukan milik user
 */
function findByIdForUser(id, userId) {
  const stmt = db.prepare(`
    SELECT t.id, t.kode, t.judul, t.deskripsi, t.prioritas, t.status,
           t.created_at, t.updated_at, t.closed_at,
           c.nama AS category_nama,
           u.nama AS pembuat_nama, u.email AS pembuat_email, u.divisi AS pembuat_divisi
    FROM tickets t
    JOIN categories c ON t.category_id = c.id
    JOIN users u ON t.created_by = u.id
    WHERE t.id = ? AND t.created_by = ?
  `);
  return stmt.get(id, userId);
}

module.exports = {
  createTicket,
  listByUser,
  findByIdForUser
};

