const express = require('express');
const bcrypt = require('bcrypt');
const { findByEmail } = require('../db/users');

const router = express.Router();

// GET /login - Menampilkan halaman form login
router.get('/login', (req, res) => {
  // Jika sudah login, langsung arahkan ke dashboard
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }

  res.render('login', {
    title: 'Masuk Akun',
    error: null,
    email: ''
  });
});

// POST /login - Memproses autentikasi pengguna
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const genericErrorMessage = 'Email atau password salah';

  // Validasi input tidak boleh kosong
  if (!email || !password || email.trim() === '' || password.trim() === '') {
    return res.status(400).render('login', {
      title: 'Masuk Akun',
      error: genericErrorMessage,
      email: email || ''
    });
  }

  try {
    // Cari pengguna berdasarkan email di database
    const user = findByEmail(email.trim().toLowerCase());

    // Jika pengguna tidak ditemukan
    if (!user) {
      return res.status(400).render('login', {
        title: 'Masuk Akun',
        error: genericErrorMessage,
        email: email
      });
    }

    // Bandingkan password yang dimasukkan dengan hash di database
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordMatch) {
      return res.status(400).render('login', {
        title: 'Masuk Akun',
        error: genericErrorMessage,
        email: email
      });
    }

    // Regenerate session id untuk mencegah session fixation attack
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regenerate error:', err);
        return res.status(500).render('login', {
          title: 'Masuk Akun',
          error: 'Terjadi kesalahan sistem, silakan coba lagi.',
          email: email
        });
      }

      // Simpan data aman pengguna di session (tanpa password_hash)
      req.session.user = {
        id: user.id,
        nama: user.nama,
        role: user.role
      };

      res.redirect('/dashboard');
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('login', {
      title: 'Masuk Akun',
      error: 'Terjadi kesalahan pada server.',
      email: email
    });
  }
});

// POST /logout - Menghancurkan session dan keluar akun
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  } else {
    res.redirect('/login');
  }
});

module.exports = router;

