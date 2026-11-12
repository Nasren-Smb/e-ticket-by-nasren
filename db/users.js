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
 * Mencari data pengguna berdasarkan ID (termasuk created_at)
 * @param {number|string} id
 * @returns {object|undefined} data user
 */
function findById(id) {
  const stmt = db.prepare('SELECT id, nama, email, divisi, role, created_at FROM users WHERE id = ?');
  return stmt.get(id);
}

/**
 * Mengambil semua user terurut berdasarkan nama, tanpa menyertakan password_hash
 * @returns {Array<object>} daftar user
 */
function listAll() {
  const stmt = db.prepare('SELECT id, nama, email, divisi, role, created_at FROM users ORDER BY nama ASC');
  return stmt.all();
}

/**
 * Mengambil data dasar user (id, nama, email, divisi, role) tanpa hash
 * @param {number|string} id
 * @returns {object|undefined}
 */
function findByIdBasic(id) {
  const stmt = db.prepare('SELECT id, nama, email, divisi, role FROM users WHERE id = ?');
  return stmt.get(id);
}

/**
 * Memeriksa apakah email sudah digunakan oleh user lain
 * @param {string} email
 * @param {number|string} id
 * @returns {boolean}
 */
function emailTakenByOther(email, id) {
  const row = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?').get(email, id);
  return !!row;
}

/**
 * Menambahkan user baru
 * @param {object} param0 { nama, email, divisi, role, passwordHash }
 * @returns {object} { id }
 */
function createUser({ nama, email, divisi, role, passwordHash }) {
  const stmt = db.prepare(`
    INSERT INTO users (nama, email, divisi, role, password_hash)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(nama, email, divisi || null, role, passwordHash);
  return { id: result.lastInsertRowid };
}

/**
 * Mengubah nama, divisi, dan role user
 * @param {number|string} id
 * @param {object} param1 { nama, divisi, role }
 * @returns {boolean}
 */
function updateUser(id, { nama, divisi, role }) {
  const stmt = db.prepare(`
    UPDATE users
    SET nama = ?, divisi = ?, role = ?
    WHERE id = ?
  `);
  const result = stmt.run(nama, divisi || null, role, id);
  return result.changes > 0;
}

/**
 * Memperbarui password user
 * @param {number|string} id
 * @param {string} passwordHash
 * @returns {boolean}
 */
function updatePassword(id, passwordHash) {
  const stmt = db.prepare(`
    UPDATE users
    SET password_hash = ?
    WHERE id = ?
  `);
  const result = stmt.run(passwordHash, id);
  return result.changes > 0;
}

/**
 * Menghitung jumlah pengguna dengan role admin
 * @returns {number}
 */
function countAdmins() {
  const row = db.prepare("SELECT COUNT(*) AS total FROM users WHERE role = 'admin'").get();
  return row ? row.total : 0;
}

/**
 * Menghitung tiket yang di-assign ke user ini dengan status 'Diproses' atau 'Selesai'
 * @param {number|string} id
 * @returns {number}
 */
function countOpenAssigned(id) {
  const row = db.prepare(`
    SELECT COUNT(*) AS total
    FROM tickets
    WHERE assigned_to = ? AND status IN ('Diproses', 'Selesai')
  `).get(id);
  return row ? row.total : 0;
}

module.exports = {
  findByEmail,
  findById,
  listAll,
  findByIdBasic,
  emailTakenByOther,
  createUser,
  updateUser,
  updatePassword,
  countAdmins,
  countOpenAssigned
};
