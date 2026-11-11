const express = require('express');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

// GET /dashboard - Halaman dashboard utama pengguna
router.get('/dashboard', requireLogin, (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard'
  });
});

module.exports = router;

