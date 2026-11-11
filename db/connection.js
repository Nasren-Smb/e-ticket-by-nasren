const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

// Ambil path database dari .env atau default ke ./db/eticket.db
const dbPath = process.env.DB_PATH || path.join(__dirname, 'eticket.db');

// Inisialisasi koneksi SQLite
const db = new Database(dbPath);

// Aktifkan penegakan Foreign Key di SQLite
db.pragma('foreign_keys = ON');

module.exports = db;

