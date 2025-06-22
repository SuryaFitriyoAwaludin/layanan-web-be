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

// Route untuk mendapatkan kategori berdasarkan ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM kategori WHERE id_kategori = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Berhasil mendapatkan data kategori',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error getting kategori by ID:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

// Route untuk menambahkan kategori baru
router.post('/', verifyToken, async (req, res) => {
  try {
    const { nama_kategori, deskripsi } = req.body;
    
    if (!nama_kategori) {
      return res.status(400).json({
        success: false,
        message: 'Nama kategori wajib diisi'
      });
    }
    
    const [result] = await db.query(
      'INSERT INTO kategori (nama_kategori, deskripsi) VALUES (?, ?)',
      [nama_kategori, deskripsi || null]
    );
    
    res.status(201).json({
      success: true,
      message: 'Kategori berhasil ditambahkan',
      data: {
        id_kategori: result.insertId,
        nama_kategori,
        deskripsi
      }
    });
  } catch (error) {
    console.error('Error adding kategori:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

// Route untuk mengupdate kategori
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_kategori, deskripsi } = req.body;
    
    if (!nama_kategori) {
      return res.status(400).json({
        success: false,
        message: 'Nama kategori wajib diisi'
      });
    }
    
    // Cek apakah kategori exists
    const [existingKategori] = await db.query('SELECT * FROM kategori WHERE id_kategori = ?', [id]);
    if (existingKategori.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan'
      });
    }
    
    await db.query(
      'UPDATE kategori SET nama_kategori = ?, deskripsi = ? WHERE id_kategori = ?',
      [nama_kategori, deskripsi || null, id]
    );
    
    res.json({
      success: true,
      message: 'Kategori berhasil diperbarui',
      data: {
        id_kategori: id,
        nama_kategori,
        deskripsi
      }
    });
  } catch (error) {
    console.error('Error updating kategori:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

// Route untuk menghapus kategori
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cek apakah kategori exists
    const [existingKategori] = await db.query('SELECT * FROM kategori WHERE id_kategori = ?', [id]);
    if (existingKategori.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan'
      });
    }
    
    await db.query('DELETE FROM kategori WHERE id_kategori = ?', [id]);
    
    res.json({
      success: true,
      message: 'Kategori berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting kategori:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

module.exports = router;