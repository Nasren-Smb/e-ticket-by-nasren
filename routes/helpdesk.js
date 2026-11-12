const express = require('express');
const { query, validationResult } = require('express-validator');
const { requireRole } = require('../middleware/auth');
const {
  ALLOWED_TRANSITIONS,
  listAll,
  findById,
  assignToUser,
  changeStatus
} = require('../db/tickets');
const { listByTicket } = require('../db/ticketHistory');

const router = express.Router();

// 1. GET /helpdesk/tickets - Daftar seluruh tiket dengan filter & pencarian
router.get(
  '/helpdesk/tickets',
  requireRole('helpdesk'),
  [
    query('status')
      .optional()
      .trim()
      .isIn(['', 'Baru', 'Diproses', 'Selesai', 'Ditutup'])
      .withMessage('Status filter tidak valid.'),
    query('q')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Pencarian maksimal 100 karakter.')
  ],
  (req, res) => {
    const errors = validationResult(req);
    const filterStatus = errors.isEmpty() ? (req.query.status || '') : '';
    const searchQuery = errors.isEmpty() ? (req.query.q || '') : '';

    const tickets = listAll({
      status: filterStatus,
      q: searchQuery
    });

    res.render('helpdesk/index', {
      title: 'Semua Tiket - IT Helpdesk',
      tickets,
      currentStatus: filterStatus,
      currentQuery: searchQuery
    });
  }
);

// 2. GET /helpdesk/tickets/:id - Detail tiket bagi Helpdesk + Riwayat Status
router.get('/helpdesk/tickets/:id', requireRole('helpdesk'), (req, res) => {
  const ticketId = parseInt(req.params.id, 10);

  // Parameter ID harus bilangan bulat positif
  if (isNaN(ticketId) || ticketId <= 0) {
    return res.status(404).render('404', {
      title: 'Tiket Tidak Ditemukan',
      message: 'ID tiket tidak valid.'
    });
  }

  const ticket = findById(ticketId);
  if (!ticket) {
    return res.status(404).render('404', {
      title: 'Tiket Tidak Ditemukan',
      message: 'Tiket yang Anda cari tidak ditemukan.'
    });
  }

  const history = listByTicket(ticketId);
  const nextAllowedStatus = ALLOWED_TRANSITIONS[ticket.status] || [];

  res.render('helpdesk/show', {
    title: `Detail Tiket ${ticket.kode} - IT Helpdesk`,
    ticket,
    history,
    nextAllowedStatus
  });
});

// 3. POST /helpdesk/tickets/:id/assign - Ambil tiket
router.post('/helpdesk/tickets/:id/assign', requireRole('helpdesk'), (req, res) => {
  const ticketId = parseInt(req.params.id, 10);

  if (isNaN(ticketId) || ticketId <= 0) {
    return res.status(404).render('404', {
      title: 'Tiket Tidak Ditemukan',
      message: 'ID tiket tidak valid.'
    });
  }

  const result = assignToUser(ticketId, req.session.user.id);

  if (result.success) {
    req.session.flash = { type: 'success', message: result.message };
  } else {
    req.session.flash = { type: 'danger', message: result.message };
  }

  res.redirect(`/helpdesk/tickets/${ticketId}`);
});

// 4. POST /helpdesk/tickets/:id/status - Ubah status tiket
router.post('/helpdesk/tickets/:id/status', requireRole('helpdesk'), (req, res) => {
  const ticketId = parseInt(req.params.id, 10);
  const newStatus = (req.body.status || '').trim();

  if (isNaN(ticketId) || ticketId <= 0) {
    return res.status(404).render('404', {
      title: 'Tiket Tidak Ditemukan',
      message: 'ID tiket tidak valid.'
    });
  }

  const result = changeStatus(ticketId, newStatus, req.session.user.id);

  if (result.success) {
    req.session.flash = { type: 'success', message: result.message };
  } else {
    req.session.flash = { type: 'danger', message: result.message };
  }

  res.redirect(`/helpdesk/tickets/${ticketId}`);
});

module.exports = router;
