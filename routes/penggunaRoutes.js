const express = require('express');
const { db } = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Route untuk mendapatkan semua pengguna
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id_user, username, nama_user, role, status, created_at, updated_at 
      FROM users
      ORDER BY id_user DESC
    `);
    
    res.json({ 
      success: true, 
      message: 'Berhasil mendapatkan data pengguna', 
      data: rows 
    });
  } catch (error) {
    console.error('Error getting all users:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk mendapatkan pengguna berdasarkan ID
router.get('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    
    const [rows] = await db.query(`
      SELECT id_user, username, nama_user, role, status, created_at, updated_at 
      FROM users
      WHERE id_user = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pengguna tidak ditemukan' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Berhasil mendapatkan data pengguna', 
      data: rows[0] 
    });
  } catch (error) {
    console.error(`Error getting user with id ${req.params.id}:`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk membuat pengguna baru
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { 
      username, 
      password, 
      nama_user, 
      role 
    } = req.body;
    
    // Validasi data
    if (!username || !password || !nama_user || !role) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Username, password, nama user, dan role harus diisi'
      });
    }
    
    // Cek apakah username sudah digunakan
    const [existingUser] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan'
      });
    }
    
    // Hash password (gunakan bcrypt jika tersedia)
    // Untuk contoh ini, kita asumsikan password sudah di-hash sebelumnya
    
    // Insert pengguna baru
    const [result] = await db.query(
      'INSERT INTO users (username, password, nama_user, role, status) VALUES (?, ?, ?, ?, ?)',
      [username, password, nama_user, role, 'active']
    );
    
    res.status(201).json({
      success: true,
      message: 'Pengguna berhasil dibuat',
      data: {
        id_user: result.insertId,
        username,
        nama_user,
        role
      }
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

module.exports = router;