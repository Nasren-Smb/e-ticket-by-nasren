const db = require('./connection');

/**
 * Mengambil hanya komentar publik (is_internal = 0) untuk tampilan karyawan
 * @param {number|string} ticketId
 * @returns {Array<object>} daftar komentar publik urut waktu naik (ASC)
 */
function listPublicByTicket(ticketId) {
  const stmt = db.prepare(`
    SELECT c.id, c.ticket_id, c.user_id, c.isi, c.is_internal, c.created_at,
           u.nama AS penulis_nama, u.role AS penulis_role
    FROM ticket_comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.ticket_id = ? AND c.is_internal = 0
    ORDER BY c.id ASC
  `);
  return stmt.all(ticketId);
}

/**
 * Mengambil semua komentar (publik dan internal) untuk tampilan helpdesk
 * @param {number|string} ticketId
 * @returns {Array<object>} daftar seluruh komentar urut waktu naik (ASC)
 */
function listAllByTicket(ticketId) {
  const stmt = db.prepare(`
    SELECT c.id, c.ticket_id, c.user_id, c.isi, c.is_internal, c.created_at,
           u.nama AS penulis_nama, u.role AS penulis_role
    FROM ticket_comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.ticket_id = ?
    ORDER BY c.id ASC
  `);
  return stmt.all(ticketId);
}

/**
 * Menyimpan komentar baru ke database
 * @param {object} params - { ticketId, userId, isi, isInternal }
 * @returns {object} hasil insert
 */
function create({ ticketId, userId, isi, isInternal = 0 }) {
  const stmt = db.prepare(`
    INSERT INTO ticket_comments (ticket_id, user_id, isi, is_internal, created_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);
  const result = stmt.run(ticketId, userId, isi, isInternal ? 1 : 0);
  return {
    id: result.lastInsertRowid
  };
}

module.exports = {
  listPublicByTicket,
  listAllByTicket,
  create
};

