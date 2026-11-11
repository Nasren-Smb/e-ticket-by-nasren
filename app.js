require('dotenv').config();
const express = require('express');
const path = require('path');

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi view engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware untuk file statis
app.use(express.static(path.join(__dirname, 'public')));

// Middleware parsing body request
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rute tes dasar
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Beranda'
  });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server E-Ticket berjalan di http://localhost:${PORT}`);
});

