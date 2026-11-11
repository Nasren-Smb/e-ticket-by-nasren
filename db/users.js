const db = require('./connection');

/**
 * Mencari data pengguna berdasarkan email
 * @param {string} email
 * @returns {object|undefined} data user lengkap termasuk password_hash
 */
function findByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
}

/**
 * Mencari data pengguna berdasarkan ID
 * @param {number|string} id
 * @returns {object|undefined} data user
 */
function findById(id) {
  const stmt = db.prepare('SELECT id, nama, email, divisi, role, created_at FROM users WHERE id = ?');
  return stmt.get(id);
}

module.exports = {
  findByEmail,
  findById
};

