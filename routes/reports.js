const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const reports = require('../db/reports');

/**
 * GET /reports
 * Menampilkan ringkasan metrik dan grafik laporan tiket
 * Hanya dapat diakses oleh peran 'helpdesk' dan 'admin'
 */
router.get('/reports', requireRole('helpdesk', 'admin'), (req, res) => {
  const summary = reports.getSummary();
  const byStatus = reports.countByStatus();
  const byCategory = reports.countByCategory();
  const byMonth = reports.countByMonthLast12();
  const workloads = reports.workloadByAgent();
  const staleTickets = reports.listStale(10);

  // Format data grafik untuk data attributes
  const statusLabels = byStatus.map(s => s.status);
  const statusValues = byStatus.map(s => s.count);

  const categoryLabels = byCategory.map(c => c.category);
  const categoryValues = byCategory.map(c => c.count);

  const monthLabels = byMonth.map(m => m.month);
  const monthValues = byMonth.map(m => m.count);

  res.render('reports/index', {
    title: 'Laporan & Analisis Tiket',
    user: req.session.user,
    summary,
    byStatus,
    byCategory,
    byMonth,
    workloads,
    staleTickets,
    chartData: {
      statusLabels,
      statusValues,
      categoryLabels,
      categoryValues,
      monthLabels,
      monthValues
    }
  });
});

module.exports = router;

