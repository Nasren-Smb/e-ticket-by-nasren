const db = require('./connection');

/**
 * Mengambil semua daftar kategori yang tersedia
 * @returns {Array<object>} daftar kategori urut berdasarkan nama
 */
function listAll() {
  const stmt = db.prepare('SELECT id, nama FROM categories ORDER BY nama ASC');
  return stmt.all();
}

/**
 * Mengambil semua kategori beserta jumlah tiket yang memakainya (LEFT JOIN), urut nama
 * @returns {Array<object>}
 */
function listAllWithCount() {
  const stmt = db.prepare(`
    SELECT c.id, c.nama, COUNT(t.id) AS ticket_count
    FROM categories c
    LEFT JOIN tickets t ON c.id = t.category_id
    GROUP BY c.id, c.nama
    ORDER BY c.nama ASC
  `);
  return stmt.all();
}

/**
 * Mengambil satu kategori berdasarkan id
 * @param {number|string} id
 * @returns {object|undefined}
 */
function findById(id) {
  const stmt = db.prepare('SELECT id, nama FROM categories WHERE id = ?');
  return stmt.get(id);
}

/**
 * Memeriksa apakah nama kategori sudah dipakai oleh kategori lain (case-insensitive)
 * @param {string} nama
 * @param {number|string} id
 * @returns {boolean}
 */
function nameTakenByOther(nama, id) {
  const row = db.prepare('SELECT id FROM categories WHERE LOWER(nama) = LOWER(?) AND id != ?').get(nama, id);
  return !!row;
}

/**
 * Menambahkan kategori baru
 * @param {string} nama
 * @returns {object} { id }
 */
function create(nama) {
  const stmt = db.prepare('INSERT INTO categories (nama) VALUES (?)');
  const result = stmt.run(nama);
  return { id: result.lastInsertRowid };
}

/**
 * Mengganti nama kategori
 * @param {number|string} id
 * @param {string} nama
 * @returns {boolean}
 */
function rename(id, nama) {
  const stmt = db.prepare('UPDATE categories SET nama = ? WHERE id = ?');
  const result = stmt.run(nama, id);
  return result.changes > 0;
}

/**
 * Menghitung jumlah tiket yang memakai kategori ini
 * @param {number|string} id
 * @returns {number}
 */
function countTickets(id) {
  const row = db.prepare('SELECT COUNT(*) AS total FROM tickets WHERE category_id = ?').get(id);
  return row ? row.total : 0;
}

/**
 * Menghitung total jumlah seluruh kategori
 * @returns {number}
 */
function countAll() {
  const row = db.prepare('SELECT COUNT(*) AS total FROM categories').get();
  return row ? row.total : 0;
}

/**
 * Menghapus kategori berdasarkan id
 * @param {number|string} id
 * @returns {boolean}
 */
function remove(id) {
  const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

module.exports = {
  listAll,
  listAllWithCount,
  findById,
  nameTakenByOther,
  create,
  rename,
  countTickets,
  countAll,
  remove
};
