const express = require('express');
const { db } = require('../config/database');

const router = express.Router();

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

// Route untuk mengecek status API
router.get('/', async (req, res) => {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      res.json({
        success: true,
        message: 'API BERJALAN DENGAN BAIK',
        database: 'Terhubung'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'API berjalan, tetapi database tidak terhubung',
        database: 'Tidak terhubung'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada API',
      error: error.message
    });
  }
});

module.exports = router;