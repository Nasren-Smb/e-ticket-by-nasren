const db = require('./connection');

/**
 * Mengambil daftar riwayat perubahan status untuk suatu tiket tertentu
 * @param {number|string} ticketId
 * @returns {Array<object>} daftar riwayat status terurut waktu naik (ASC)
 */
function listByTicket(ticketId) {
  const stmt = db.prepare(`
    SELECT h.id, h.ticket_id, h.status_lama, h.status_baru, h.created_at,
           u.nama AS diubah_oleh_nama, u.email AS diubah_oleh_email, u.role AS diubah_oleh_role
    FROM ticket_status_history h
    JOIN users u ON h.diubah_oleh = u.id
    WHERE h.ticket_id = ?
    ORDER BY h.id ASC
  `);
  return stmt.all(ticketId);
}

module.exports = {
  listByTicket
};

