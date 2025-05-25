const express = require('express');
const router = express.Router();
const { testConnection } = require('../config/database');

// Route untuk mengecek status API dan koneksi database
router.get('/status', async (req, res) => {
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