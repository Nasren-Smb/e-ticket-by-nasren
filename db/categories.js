const db = require('./connection');

/**
 * Mengambil semua daftar kategori yang tersedia
 * @returns {Array<object>} daftar kategori urut berdasarkan nama
 */
function listAll() {
  const stmt = db.prepare('SELECT id, nama FROM categories ORDER BY nama ASC');
  return stmt.all();
}

module.exports = {
  listAll
};

