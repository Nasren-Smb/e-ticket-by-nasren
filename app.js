require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

// Inisialisasi rute
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi view engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware untuk file statis
app.use(express.static(path.join(__dirname, 'public')));

// Middleware parsing body request (JSON & URL-Encoded Form)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Konfigurasi middleware session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'eticket_fallback_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 // 1 hari
    }
  })
);

// Middleware agar variabel pengguna login tersedia di semua view template
app.use((req, res, next) => {
  res.locals.user = req.session && req.session.user ? req.session.user : null;
  next();
});

// Rute tes beranda
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Beranda'
  });
});

// Daftarkan modul rute
app.use(authRoutes);
app.use(dashboardRoutes);
app.use(adminRoutes);

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server E-Ticket berjalan di http://localhost:${PORT}`);
});
