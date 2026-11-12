const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { requireRole } = require('../middleware/auth');
const usersDb = require('../db/users');
const categoriesDb = require('../db/categories');

const router = express.Router();

// Helper untuk validasi integer id positif
function parseValidId(idParam) {
  if (!/^\d+$/.test(idParam)) return null;
  const id = parseInt(idParam, 10);
  return id > 0 ? id : null;
}

// -------------------------------------------------------------
// 1. GET /admin - Dashboard Admin
// -------------------------------------------------------------
router.get('/admin', requireRole('admin'), (req, res) => {
  const users = usersDb.listAll();
  const categoryCount = categoriesDb.countAll();

  res.render('admin', {
    title: 'Dashboard Admin',
    userCount: users.length,
    categoryCount: categoryCount
  });
});

// -------------------------------------------------------------
// 2. MODUL PENGGUNA (USERS)
// -------------------------------------------------------------

// GET /admin/users - Daftar Pengguna
router.get('/admin/users', requireRole('admin'), (req, res) => {
  const users = usersDb.listAll();
  res.render('admin/users/index', {
    title: 'Kelola Pengguna - Admin',
    users
  });
});

// GET /admin/users/new - Form Tambah Pengguna (wajib sebelum :id)
router.get('/admin/users/new', requireRole('admin'), (req, res) => {
  res.render('admin/users/new', {
    title: 'Tambah Pengguna Baru - Admin',
    formData: {},
    errors: {}
  });
});

// POST /admin/users - Simpan Pengguna Baru
router.post(
  '/admin/users',
  requireRole('admin'),
  [
    body('nama')
      .trim()
      .notEmpty()
      .withMessage('Nama pengguna wajib diisi.')
      .isLength({ max: 100 })
      .withMessage('Nama maksimal 100 karakter.'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email wajib diisi.')
      .isEmail()
      .withMessage('Format email tidak valid.')
      .isLength({ max: 150 })
      .withMessage('Email maksimal 150 karakter.')
      .custom(async (value) => {
        const existing = usersDb.findByEmail(value.toLowerCase());
        if (existing) {
          throw new Error('Email sudah digunakan oleh akun lain.');
        }
        return true;
      }),
    body('divisi')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 100 })
      .withMessage('Divisi maksimal 100 karakter.'),
    body('role')
      .trim()
      .isIn(['employee', 'helpdesk', 'admin'])
      .withMessage('Peran harus salah satu dari: employee, helpdesk, admin.'),
    body('password')
      .notEmpty()
      .withMessage('Password wajib diisi.')
      .isLength({ min: 8, max: 72 })
      .withMessage('Password minimal 8 dan maksimal 72 karakter.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const { nama, email, divisi, role } = req.body;

    if (!errors.isEmpty()) {
      const errorMap = {};
      errors.array().forEach((err) => {
        if (!errorMap[err.path]) {
          errorMap[err.path] = err.msg;
        }
      });

      return res.status(400).render('admin/users/new', {
        title: 'Tambah Pengguna Baru - Admin',
        formData: { nama, email, divisi, role },
        errors: errorMap
      });
    }

    try {
      const passwordHash = await bcrypt.hash(req.body.password, 10);
      usersDb.createUser({
        nama,
        email: email.toLowerCase(),
        divisi: divisi || null,
        role,
        passwordHash
      });

      req.session.flash = {
        type: 'success',
        message: `Pengguna '${nama}' berhasil ditambahkan.`
      };
      res.redirect('/admin/users');
    } catch (err) {
      if (err.message && err.message.includes('UNIQUE')) {
        return res.status(400).render('admin/users/new', {
          title: 'Tambah Pengguna Baru - Admin',
          formData: { nama, email, divisi, role },
          errors: { email: 'Email sudah terdaftar di sistem.' }
        });
      }
      console.error('Error createUser:', err);
      req.session.flash = {
        type: 'danger',
        message: 'Terjadi kesalahan sistem saat membuat pengguna.'
      };
      res.redirect('/admin/users');
    }
  }
);

// GET /admin/users/:id/edit - Form Edit Pengguna & Reset Password
router.get('/admin/users/:id/edit', requireRole('admin'), (req, res) => {
  const userId = parseValidId(req.params.id);
  if (!userId) {
    return res.status(404).render('404', { title: 'Pengguna Tidak Ditemukan' });
  }

  const targetUser = usersDb.findByIdBasic(userId);
  if (!targetUser) {
    return res.status(404).render('404', { title: 'Pengguna Tidak Ditemukan' });
  }

  res.render('admin/users/edit', {
    title: `Ubah Pengguna - ${targetUser.nama}`,
    targetUser,
    formData: targetUser,
    errors: {},
    passwordErrors: {}
  });
});

// POST /admin/users/:id - Simpan Perubahan Pengguna
router.post(
  '/admin/users/:id',
  requireRole('admin'),
  [
    body('nama')
      .trim()
      .notEmpty()
      .withMessage('Nama pengguna wajib diisi.')
      .isLength({ max: 100 })
      .withMessage('Nama maksimal 100 karakter.'),
    body('divisi')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 100 })
      .withMessage('Divisi maksimal 100 karakter.'),
    body('role')
      .trim()
      .isIn(['employee', 'helpdesk', 'admin'])
      .withMessage('Peran harus salah satu dari: employee, helpdesk, admin.')
  ],
  (req, res) => {
    const userId = parseValidId(req.params.id);
    if (!userId) {
      return res.status(404).render('404', { title: 'Pengguna Tidak Ditemukan' });
    }

    const targetUser = usersDb.findByIdBasic(userId);
    if (!targetUser) {
      return res.status(404).render('404', { title: 'Pengguna Tidak Ditemukan' });
    }

    const errors = validationResult(req);
    const { nama, divisi, role } = req.body;

    if (!errors.isEmpty()) {
      const errorMap = {};
      errors.array().forEach((err) => {
        if (!errorMap[err.path]) {
          errorMap[err.path] = err.msg;
        }
      });

      return res.status(400).render('admin/users/edit', {
        title: `Ubah Pengguna - ${targetUser.nama}`,
        targetUser,
        formData: { ...targetUser, nama, divisi, role },
        errors: errorMap,
        passwordErrors: {}
      });
    }

    const currentAdminId = req.session.user.id;

    // Aturan bisnis perubahan peran:
    // a. Admin tidak boleh mengubah perannya sendiri
    if (userId === currentAdminId && role !== targetUser.role) {
      req.session.flash = {
        type: 'danger',
        message: 'Anda tidak dapat mengubah peran akun Anda sendiri.'
      };
      return res.redirect(`/admin/users/${userId}/edit`);
    }

    // b. Peran admin tidak boleh diturunkan jika countAdmins() tinggal 1
    if (targetUser.role === 'admin' && role !== 'admin') {
      const adminCount = usersDb.countAdmins();
      if (adminCount <= 1) {
        req.session.flash = {
          type: 'danger',
          message: 'Peran admin tidak dapat diubah karena ini adalah satu-satunya akun admin yang tersisa.'
        };
        return res.redirect(`/admin/users/${userId}/edit`);
      }
    }

    // c. Peran helpdesk tidak boleh diubah jika countOpenAssigned(id) > 0
    if (targetUser.role === 'helpdesk' && role !== 'helpdesk') {
      const openCount = usersDb.countOpenAssigned(userId);
      if (openCount > 0) {
        req.session.flash = {
          type: 'danger',
          message: `Peran tidak dapat diubah karena petugas helpdesk ini masih menangani ${openCount} tiket aktif (Diproses/Selesai).`
        };
        return res.redirect(`/admin/users/${userId}/edit`);
      }
    }

    usersDb.updateUser(userId, { nama, divisi, role });

    req.session.flash = {
      type: 'success',
      message: `Data pengguna '${nama}' berhasil diperbarui.`
    };
    res.redirect('/admin/users');
  }
);

// POST /admin/users/:id/password - Reset Password Pengguna
router.post(
  '/admin/users/:id/password',
  requireRole('admin'),
  [
    body('newPassword')
      .notEmpty()
      .withMessage('Password baru wajib diisi.')
      .isLength({ min: 8, max: 72 })
      .withMessage('Password baru minimal 8 dan maksimal 72 karakter.')
  ],
  async (req, res) => {
    const userId = parseValidId(req.params.id);
    if (!userId) {
      return res.status(404).render('404', { title: 'Pengguna Tidak Ditemukan' });
    }

    const targetUser = usersDb.findByIdBasic(userId);
    if (!targetUser) {
      return res.status(404).render('404', { title: 'Pengguna Tidak Ditemukan' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMap = {};
      errors.array().forEach((err) => {
        if (!errorMap[err.path]) {
          errorMap[err.path] = err.msg;
        }
      });

      return res.status(400).render('admin/users/edit', {
        title: `Ubah Pengguna - ${targetUser.nama}`,
        targetUser,
        formData: targetUser,
        errors: {},
        passwordErrors: errorMap
      });
    }

    const passwordHash = await bcrypt.hash(req.body.newPassword, 10);
    usersDb.updatePassword(userId, passwordHash);

    req.session.flash = {
      type: 'success',
      message: `Password untuk pengguna '${targetUser.nama}' berhasil diatur ulang.`
    };
    res.redirect(`/admin/users/${userId}/edit`);
  }
);

// -------------------------------------------------------------
// 3. MODUL KATEGORI (CATEGORIES)
// -------------------------------------------------------------

// GET /admin/categories - Daftar & Form Tambah Kategori
router.get('/admin/categories', requireRole('admin'), (req, res) => {
  const categories = categoriesDb.listAllWithCount();
  res.render('admin/categories/index', {
    title: 'Kelola Kategori Tiket - Admin',
    categories,
    formData: {},
    errors: {}
  });
});

// POST /admin/categories - Tambah Kategori Baru
router.post(
  '/admin/categories',
  requireRole('admin'),
  [
    body('nama')
      .trim()
      .notEmpty()
      .withMessage('Nama kategori wajib diisi.')
      .isLength({ max: 50 })
      .withMessage('Nama kategori maksimal 50 karakter.')
      .custom((value) => {
        if (categoriesDb.nameTakenByOther(value, 0)) {
          throw new Error('Nama kategori sudah digunakan.');
        }
        return true;
      })
  ],
  (req, res) => {
    const errors = validationResult(req);
    const { nama } = req.body;

    if (!errors.isEmpty()) {
      const errorMap = {};
      errors.array().forEach((err) => {
        if (!errorMap[err.path]) {
          errorMap[err.path] = err.msg;
        }
      });

      const categories = categoriesDb.listAllWithCount();
      return res.status(400).render('admin/categories/index', {
        title: 'Kelola Kategori Tiket - Admin',
        categories,
        formData: { nama },
        errors: errorMap
      });
    }

    try {
      categoriesDb.create(nama);
      req.session.flash = {
        type: 'success',
        message: `Kategori '${nama}' berhasil ditambahkan.`
      };
      res.redirect('/admin/categories');
    } catch (err) {
      console.error('Error create category:', err);
      req.session.flash = {
        type: 'danger',
        message: 'Gagal menambahkan kategori. Pastikan nama belum terdaftar.'
      };
      res.redirect('/admin/categories');
    }
  }
);

// GET /admin/categories/:id/edit - Form Ganti Nama Kategori
router.get('/admin/categories/:id/edit', requireRole('admin'), (req, res) => {
  const categoryId = parseValidId(req.params.id);
  if (!categoryId) {
    return res.status(404).render('404', { title: 'Kategori Tidak Ditemukan' });
  }

  const category = categoriesDb.findById(categoryId);
  if (!category) {
    return res.status(404).render('404', { title: 'Kategori Tidak Ditemukan' });
  }

  res.render('admin/categories/edit', {
    title: `Ubah Nama Kategori - ${category.nama}`,
    category,
    formData: category,
    errors: {}
  });
});

// POST /admin/categories/:id - Simpan Nama Baru Kategori
router.post(
  '/admin/categories/:id',
  requireRole('admin'),
  [
    body('nama')
      .trim()
      .notEmpty()
      .withMessage('Nama kategori wajib diisi.')
      .isLength({ max: 50 })
      .withMessage('Nama kategori maksimal 50 karakter.')
      .custom((value, { req }) => {
        const categoryId = parseValidId(req.params.id);
        if (categoryId && categoriesDb.nameTakenByOther(value, categoryId)) {
          throw new Error('Nama kategori sudah digunakan.');
        }
        return true;
      })
  ],
  (req, res) => {
    const categoryId = parseValidId(req.params.id);
    if (!categoryId) {
      return res.status(404).render('404', { title: 'Kategori Tidak Ditemukan' });
    }

    const category = categoriesDb.findById(categoryId);
    if (!category) {
      return res.status(404).render('404', { title: 'Kategori Tidak Ditemukan' });
    }

    const errors = validationResult(req);
    const { nama } = req.body;

    if (!errors.isEmpty()) {
      const errorMap = {};
      errors.array().forEach((err) => {
        if (!errorMap[err.path]) {
          errorMap[err.path] = err.msg;
        }
      });

      return res.status(400).render('admin/categories/edit', {
        title: `Ubah Nama Kategori - ${category.nama}`,
        category,
        formData: { ...category, nama },
        errors: errorMap
      });
    }

    categoriesDb.rename(categoryId, nama);

    req.session.flash = {
      type: 'success',
      message: `Nama kategori berhasil diubah menjadi '${nama}'.`
    };
    res.redirect('/admin/categories');
  }
);

// POST /admin/categories/:id/delete - Hapus Kategori
router.post('/admin/categories/:id/delete', requireRole('admin'), (req, res) => {
  const categoryId = parseValidId(req.params.id);
  if (!categoryId) {
    return res.status(404).render('404', { title: 'Kategori Tidak Ditemukan' });
  }

  const category = categoriesDb.findById(categoryId);
  if (!category) {
    return res.status(404).render('404', { title: 'Kategori Tidak Ditemukan' });
  }

  // Aturan bisnis penghapusan kategori:
  // 1. Ditolak jika countTickets(id) > 0
  const ticketCount = categoriesDb.countTickets(categoryId);
  if (ticketCount > 0) {
    req.session.flash = {
      type: 'danger',
      message: `Kategori '${category.nama}' tidak dapat dihapus karena masih digunakan oleh ${ticketCount} tiket.`
    };
    return res.redirect('/admin/categories');
  }

  // 2. Ditolak jika countAll() tinggal 1
  const totalCategories = categoriesDb.countAll();
  if (totalCategories <= 1) {
    req.session.flash = {
      type: 'danger',
      message: 'Kategori tidak dapat dihapus karena merupakan satu-satunya kategori yang tersisa di sistem.'
    };
    return res.redirect('/admin/categories');
  }

  categoriesDb.remove(categoryId);

  req.session.flash = {
    type: 'success',
    message: `Kategori '${category.nama}' berhasil dihapus.`
  };
  res.redirect('/admin/categories');
});

module.exports = router;
