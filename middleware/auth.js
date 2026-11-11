/**
 * Middleware untuk memastikan pengguna sudah login
 */
function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }
  next();
}

/**
 * Middleware untuk membatasi akses berdasarkan peran (role)
 * @param  {...string} roles - daftar peran yang diizinkan (misal: 'admin')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    // Pastikan pengguna sudah login terlebih dahulu
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    // Periksa apakah peran pengguna ada di dalam daftar roles yang diizinkan
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).render('403', {
        title: 'Akses Ditolak',
        message: 'Anda tidak memiliki hak akses untuk membuka halaman ini.'
      });
    }

    next();
  };
}

module.exports = {
  requireLogin,
  requireRole
};

