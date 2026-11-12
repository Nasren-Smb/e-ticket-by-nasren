const db = require('./connection');

/**
 * Peta transisi status yang sah (diizinkan) dalam sistem
 */
const ALLOWED_TRANSITIONS = {
  Baru: ['Diproses'],
  Diproses: ['Selesai'],
  Selesai: ['Ditutup', 'Diproses'],
  Ditutup: []
};

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
 * Mengambil semua tiket milik pengguna tertentu (karyawan)
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

/**
 * Mengambil seluruh tiket untuk tampilan Helpdesk dengan filter status dan pencarian q
 * @param {object} filter - { status, q }
 * @returns {Array<object>} daftar tiket (maksimal 200)
 */
function listAll(filter = {}) {
  let sql = `
    SELECT t.id, t.kode, t.judul, t.prioritas, t.status, t.created_at, t.updated_at,
           c.nama AS category_nama,
           u.nama AS pembuat_nama,
           p.nama AS petugas_nama
    FROM tickets t
    JOIN categories c ON t.category_id = c.id
    JOIN users u ON t.created_by = u.id
    LEFT JOIN users p ON t.assigned_to = p.id
    WHERE 1=1
  `;
  const params = [];

  if (filter.status && filter.status.trim() !== '') {
    sql += ` AND t.status = ?`;
    params.push(filter.status.trim());
  }

  if (filter.q && filter.q.trim() !== '') {
    sql += ` AND (t.kode LIKE ? OR t.judul LIKE ?)`;
    const searchParam = `%${filter.q.trim()}%`;
    params.push(searchParam, searchParam);
  }

  sql += ` ORDER BY t.created_at DESC, t.id DESC LIMIT 200`;

  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

/**
 * Mengambil detail satu tiket lengkap untuk Helpdesk
 * @param {number|string} id
 * @returns {object|undefined} data tiket lengkap
 */
function findById(id) {
  const stmt = db.prepare(`
    SELECT t.id, t.kode, t.judul, t.deskripsi, t.prioritas, t.status,
           t.assigned_to, t.created_at, t.updated_at, t.closed_at,
           c.nama AS category_nama,
           u.nama AS pembuat_nama, u.email AS pembuat_email, u.divisi AS pembuat_divisi,
           p.nama AS petugas_nama, p.email AS petugas_email
    FROM tickets t
    JOIN categories c ON t.category_id = c.id
    JOIN users u ON t.created_by = u.id
    LEFT JOIN users p ON t.assigned_to = p.id
    WHERE t.id = ?
  `);
  return stmt.get(id);
}

/**
 * Transaksi pengambilan tiket oleh petugas Helpdesk
 * Hanya bisa diambil jika tiket berstatus 'Baru' dan assigned_to masih NULL
 * @param {number|string} id
 * @param {number|string} userId
 * @returns {{ success: boolean, message?: string }}
 */
function assignToUser(id, userId) {
  const assignTx = db.transaction((ticketId, petugasId) => {
    // 1. Update ticket: assigned_to = petugasId, status = 'Diproses', updated_at = CURRENT_TIMESTAMP
    const updateStmt = db.prepare(`
      UPDATE tickets
      SET assigned_to = ?,
          status = 'Diproses',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND assigned_to IS NULL AND status = 'Baru'
    `);

    const result = updateStmt.run(petugasId, ticketId);

    // Jika jumlah baris berubah bukan 1, batalkan
    if (result.changes !== 1) {
      return {
        success: false,
        message: 'Tiket sudah diambil oleh petugas lain atau status tiket bukan Baru.'
      };
    }

    // 2. Tambah catatan riwayat status ke ticket_status_history
    const historyStmt = db.prepare(`
      INSERT INTO ticket_status_history (ticket_id, status_lama, status_baru, diubah_oleh)
      VALUES (?, 'Baru', 'Diproses', ?)
    `);
    historyStmt.run(ticketId, petugasId);

    return {
      success: true,
      message: 'Tiket berhasil diambil dan status kini Diproses.'
    };
  });

  return assignTx(id, userId);
}

/**
 * Transaksi pengubahan status tiket oleh petugas pemilik tiket
 * @param {number|string} id
 * @param {string} newStatus
 * @param {number|string} userId
 * @returns {{ success: boolean, message?: string }}
 */
function changeStatus(id, newStatus, userId) {
  const changeTx = db.transaction((ticketId, statusTujuan, petugasId) => {
    // 1. Ambil data tiket saat ini
    const ticket = db.prepare('SELECT id, status, assigned_to FROM tickets WHERE id = ?').get(ticketId);

    if (!ticket) {
      return { success: false, message: 'Tiket tidak ditemukan.' };
    }

    // 2. Validasi petugas tiket (hanya petugas yang ditugaskan yang boleh mengubah status)
    if (ticket.assigned_to !== petugasId) {
      return { success: false, message: 'Hanya petugas yang ditugaskan yang dapat mengubah status tiket ini.' };
    }

    // 3. Validasi alur transisi status yang sah
    const allowed = ALLOWED_TRANSITIONS[ticket.status] || [];
    if (!allowed.includes(statusTujuan)) {
      return {
        success: false,
        message: `Transisi status dari '${ticket.status}' ke '${statusTujuan}' tidak diizinkan.`
      };
    }

    // 4. Update status tiket
    if (statusTujuan === 'Ditutup') {
      const updateStmt = db.prepare(`
        UPDATE tickets
        SET status = ?,
            closed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      updateStmt.run(statusTujuan, ticketId);
    } else {
      const updateStmt = db.prepare(`
        UPDATE tickets
        SET status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      updateStmt.run(statusTujuan, ticketId);
    }

    // 5. Masukkan catatan ke ticket_status_history
    const historyStmt = db.prepare(`
      INSERT INTO ticket_status_history (ticket_id, status_lama, status_baru, diubah_oleh)
      VALUES (?, ?, ?, ?)
    `);
    historyStmt.run(ticketId, ticket.status, statusTujuan, petugasId);

    return {
      success: true,
      message: `Status tiket berhasil diubah menjadi '${statusTujuan}'.`
    };
  });

  return changeTx(id, newStatus, userId);
}

module.exports = {
  ALLOWED_TRANSITIONS,
  createTicket,
  listByUser,
  findByIdForUser,
  listAll,
  findById,
  assignToUser,
  changeStatus
};
