const express = require('express');
const { db } = require('../config/database');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Route untuk mendapatkan semua data kategori
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM kategori ORDER BY nama_kategori');
    
    res.json({ 
      success: true, 
      message: 'Berhasil mendapatkan data kategori', 
      data: rows 
    });
  } catch (error) {
    console.error('Error getting all kategori:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

module.exports = router;