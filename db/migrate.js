const fs = require('fs');
const path = require('path');
const db = require('./connection');

// Folder tempat file migrasi SQL disimpan
const migrationsDir = path.join(__dirname, 'migrations');

try {
  // Ambil semua file .sql dan urutkan berdasarkan nama file
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log(`Menjalankan migrasi database (${files.length} file ditemukan)...`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    // Eksekusi skema SQL
    db.exec(sql);
    console.log(`[OK] Migrasi selesai: ${file}`);
  }

  console.log('Semua migrasi berhasil dijalankan.');
} catch (error) {
  console.error('Gagal menjalankan migrasi:', error.message);
  process.exit(1);
}

