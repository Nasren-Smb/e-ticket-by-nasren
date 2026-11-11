const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireRole } = require('../middleware/auth');
const { listAll: listCategories } = require('../db/categories');
const { createTicket, listByUser, findByIdForUser } = require('../db/tickets');

const router = express.Router();

// Semua rute tiket ini hanya boleh diakses oleh pengguna dengan peran 'employee'
router.use(requireRole('employee'));

// 1. GET /tickets - Daftar tiket milik pengguna login
router.get('/tickets', (req, res) => {
  const tickets = listByUser(req.session.user.id);
  res.render('tickets/index', {
    title: 'Tiket Saya',
    tickets
  });
});

// 2. GET /tickets/new - Formulir pembuatan tiket baru (Diletakkan SEBELUM /tickets/:id)
router.get('/tickets/new', (req, res) => {
  const categories = listCategories();
  res.render('tickets/new', {
    title: 'Buat Tiket Baru',
    categories,
    errors: {},
    values: {
      judul: '',
      category_id: '',
      prioritas: 'Sedang',
      deskripsi: ''
    }
  });
});

// 3. POST /tickets - Memvalidasi dan menyimpan tiket baru
router.post(
  '/tickets',
  [
    body('judul')
      .trim()
      .notEmpty()
      .withMessage('Judul tiket wajib diisi.')
      .isLength({ max: 150 })
      .withMessage('Judul tiket maksimal 150 karakter.'),
    body('category_id')
      .trim()
      .notEmpty()
      .withMessage('Kategori tiket wajib dipilih.')
      .isInt()
      .withMessage('Kategori tiket tidak valid.')
      .custom((value) => {
        const categories = listCategories();
        const exists = categories.some((cat) => String(cat.id) === String(value));
        if (!exists) {
          throw new Error('Kategori yang dipilih tidak tersedia.');
        }
        return true;
      }),
    body('prioritas')
      .trim()
      .isIn(['Rendah', 'Sedang', 'Tinggi', 'Urgent'])
      .withMessage('Prioritas harus salah satu dari: Rendah, Sedang, Tinggi, atau Urgent.'),
    body('deskripsi')
      .trim()
      .notEmpty()
      .withMessage('Deskripsi kendala wajib diisi.')
      .isLength({ max: 2000 })
      .withMessage('Deskripsi kendala maksimal 2000 karakter.')
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMap = {};
      errors.array().forEach((err) => {
        errorMap[err.path] = err.msg;
      });

      const categories = listCategories();
      return res.status(400).render('tickets/new', {
        title: 'Buat Tiket Baru',
        categories,
        errors: errorMap,
        values: {
          judul: req.body.judul || '',
          category_id: req.body.category_id || '',
          prioritas: req.body.prioritas || 'Sedang',
          deskripsi: req.body.deskripsi || ''
        }
      });
    }

    try {
      // Simpan tiket baru; created_by dari session pengguna, bukan dari form
      const newTicket = createTicket({
        judul: req.body.judul.trim(),
        category_id: parseInt(req.body.category_id, 10),
        prioritas: req.body.prioritas.trim(),
        deskripsi: req.body.deskripsi.trim(),
        created_by: req.session.user.id
      });

      // Redirect ke detail tiket yang baru dibuat
      res.redirect(`/tickets/${newTicket.id}`);
    } catch (error) {
      console.error('Error saat membuat tiket:', error);
      const categories = listCategories();
      res.status(500).render('tickets/new', {
        title: 'Buat Tiket Baru',
        categories,
        errors: { general: 'Terjadi kesalahan sistem saat menyimpan tiket.' },
        values: req.body
      });
    }
  }
);

// 4. GET /tickets/:id - Detail tiket milik sendiri
router.get('/tickets/:id', (req, res) => {
  const ticketId = req.params.id;
  const ticket = findByIdForUser(ticketId, req.session.user.id);

  // Jika tiket tidak ada atau bukan milik user, berikan status 404 (bukan 403) agar keberadaan tiket tidak bocor
  if (!ticket) {
    return res.status(404).render('404', {
      title: 'Tiket Tidak Ditemukan',
      message: 'Tiket yang Anda cari tidak ditemukan atau bukan milik Anda.'
    });
  }

  res.render('tickets/show', {
    title: `Detail Tiket ${ticket.kode}`,
    ticket
  });
});

module.exports = router;

