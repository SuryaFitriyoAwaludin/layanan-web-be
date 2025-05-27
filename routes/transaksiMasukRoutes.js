const express = require('express');
const { db } = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Route untuk mendapatkan semua transaksi masuk
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT tm.*, s.nama_supplier 
      FROM transaksi_masuk tm
      LEFT JOIN supplier s ON tm.id_supplier = s.id_supplier
      ORDER BY tm.id_transaksi_masuk DESC
    `);
    
    res.json({ 
      success: true, 
      message: 'Berhasil mendapatkan data transaksi masuk', 
      data: rows 
    });
  } catch (error) {
    console.error('Error getting all transaksi masuk:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

module.exports = router;