const express = require('express');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /admin - Halaman khusus admin
// Catatan: Ini hanya untuk uji proteksi role, akan diganti di Tahap 08
router.get('/admin', requireRole('admin'), (req, res) => {
  res.render('admin', {
    title: 'Halaman Admin'
  });
});

module.exports = router;

