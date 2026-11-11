const bcrypt = require('bcrypt');
const db = require('./connection');

// Salt rounds untuk hashing bcrypt
const SALT_ROUNDS = 10;

// Catatan: Password default 'password123' ini hanya digunakan untuk keperluan development!
const rawPassword = 'password123';
const passwordHash = bcrypt.hashSync(rawPassword, SALT_ROUNDS);

try {
  console.log('Memulai seeding data awal...');

  // 1. Seed Categories (idempotent dengan INSERT OR IGNORE berdasarkan UNIQUE nama)
  const categories = [
    'Jaringan',
    'Hardware',
    'Software',
    'Akun/Password',
    'Lainnya'
  ];

  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO categories (nama)
    VALUES (?)
  `);

  const insertCategoriesTx = db.transaction((cats) => {
    for (const cat of cats) {
      insertCategory.run(cat);
    }
  });

  insertCategoriesTx(categories);
  console.log('[OK] Seeding categories selesai.');

  // 2. Seed Users (idempotent dengan INSERT OR IGNORE berdasarkan UNIQUE email)
  const users = [
    {
      nama: 'Budi Karyawan',
      email: 'budi@perusahaan.local',
      password_hash: passwordHash,
      divisi: 'Keuangan',
      role: 'employee'
    },
    {
      nama: 'Dewi Karyawan',
      email: 'dewi@perusahaan.local',
      password_hash: passwordHash,
      divisi: 'Pemasaran',
      role: 'employee'
    },
    {
      nama: 'Siti Helpdesk',
      email: 'siti@perusahaan.local',
      password_hash: passwordHash,
      divisi: 'IT Support',
      role: 'helpdesk'
    },
    {
      nama: 'Admin IT',
      email: 'admin@perusahaan.local',
      password_hash: passwordHash,
      divisi: 'IT Infrastructure',
      role: 'admin'
    }
  ];

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (nama, email, password_hash, divisi, role)
    VALUES (@nama, @email, @password_hash, @divisi, @role)
  `);

  const insertUsersTx = db.transaction((userList) => {
    for (const user of userList) {
      insertUser.run(user);
    }
  });

  insertUsersTx(users);
  console.log('[OK] Seeding users selesai.');

  console.log('Seeding data awal berhasil selesai tanpa duplikasi.');
} catch (error) {
  console.error('Gagal menjalankan seeder:', error.message);
  process.exit(1);
}
