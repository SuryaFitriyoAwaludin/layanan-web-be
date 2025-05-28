const express = require('express');
const { db } = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Route untuk mendapatkan semua log aktivitas
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT la.*, u.username, u.nama_lengkap
      FROM log_aktivitas la
      LEFT JOIN users u ON la.id_user = u.id_user
      ORDER BY la.created_at DESC
    `);
    
    res.json({ 
      success: true, 
      message: 'Berhasil mendapatkan data log aktivitas', 
      data: rows 
    });
  } catch (error) {
    console.error('Error getting all activity logs:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

module.exports = router;