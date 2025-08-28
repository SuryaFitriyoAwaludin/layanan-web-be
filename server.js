const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import database dari config
const { db } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const barangRoutes = require('./routes/barangRoutes');
const statusRoutes = require('./routes/statusRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const kategoriRoutes = require('./routes/kategoriRoutes');
const lokasiRoutes = require('./routes/lokasiRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const transaksiMasukRoutes = require('./routes/transaksiMasukRoutes');
const transaksiKeluarRoutes = require('./routes/transaksiKeluarRoutes');
const stokOpnameRoutes = require('./routes/stokOpnameRoutes');
const penggunaRoutes = require('./routes/penggunaRoutes');
const logAktivitasRoutes = require('./routes/logAktivitasRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Import utils
const logger = require('./utils/logger');

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fungsi untuk menguji koneksi database
const testConnection = async () => {
  try {
    const [rows] = await db.query('SELECT 1');
    console.log('Koneksi database berhasil!');
    return true;
  } catch (error) {
    console.error('Koneksi database gagal:', error.message);
    return false;
  }
};

// Gunakan routes
app.use('/api/auth', authRoutes);
app.use('/api/barang', barangRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/lokasi', lokasiRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/transaksi-masuk', transaksiMasukRoutes);
app.use('/api/transaksi-keluar', transaksiKeluarRoutes);
app.use('/api/stok-opname', stokOpnameRoutes);
app.use('/api/pengguna', penggunaRoutes);
app.use('/api/log-aktivitas', logAktivitasRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Middleware error handler
app.use(errorHandler);

// Fungsi untuk mencatat log aktivitas
const logActivity = async (id_pengguna, aktivitas, tabel, id_referensi, keterangan, req) => {
  try {
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'];
    
    await db.query(
      'INSERT INTO log_aktivitas (id_pengguna, aktivitas, tabel, id_referensi, keterangan, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id_pengguna, aktivitas, tabel, id_referensi, keterangan, ip_address, user_agent]
    );
    
    return true;
  } catch (error) {
    console.error('Error logging activity:', error.message);
    return false;
  }
};

// Export fungsi logActivity agar bisa digunakan di file lain
module.exports = { logActivity };

// Mulai server
app.listen(PORT, () => {
  logger.info(`Server berjalan di port ${PORT}`);
});