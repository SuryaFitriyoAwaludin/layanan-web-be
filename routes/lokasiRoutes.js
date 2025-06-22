const express = require('express');
const { db } = require('../config/database');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Route untuk mendapatkan semua data lokasi
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT l.*, 
             COALESCE(COUNT(b.id_barang), 0) as total_barang
      FROM lokasi l
      LEFT JOIN barang b ON l.id_lokasi = b.id_lokasi
      GROUP BY l.id_lokasi, l.nama_lokasi, l.deskripsi, l.created_at, l.updated_at
      ORDER BY l.nama_lokasi
    `);
    
    res.json({ 
      success: true, 
      message: 'Berhasil mendapatkan data lokasi', 
      data: rows 
    });
  } catch (error) {
    console.error('Error getting all lokasi:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk mendapatkan lokasi berdasarkan ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM lokasi WHERE id_lokasi = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lokasi tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Berhasil mendapatkan data lokasi',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error getting lokasi by ID:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

// Route untuk menambahkan lokasi baru
router.post('/', verifyToken, async (req, res) => {
  try {
    const { nama_lokasi, deskripsi } = req.body;
    
    if (!nama_lokasi) {
      return res.status(400).json({
        success: false,
        message: 'Nama lokasi wajib diisi'
      });
    }
    
    const [result] = await db.query(
      'INSERT INTO lokasi (nama_lokasi, deskripsi) VALUES (?, ?)',
      [nama_lokasi, deskripsi || null]
    );
    
    res.status(201).json({
      success: true,
      message: 'Lokasi berhasil ditambahkan',
      data: {
        id_lokasi: result.insertId,
        nama_lokasi,
        deskripsi
      }
    });
  } catch (error) {
    console.error('Error adding lokasi:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

// Route untuk mengupdate lokasi
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_lokasi, deskripsi } = req.body;
    
    if (!nama_lokasi) {
      return res.status(400).json({
        success: false,
        message: 'Nama lokasi wajib diisi'
      });
    }
    
    // Cek apakah lokasi exists
    const [existingLokasi] = await db.query('SELECT * FROM lokasi WHERE id_lokasi = ?', [id]);
    if (existingLokasi.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lokasi tidak ditemukan'
      });
    }
    
    await db.query(
      'UPDATE lokasi SET nama_lokasi = ?, deskripsi = ? WHERE id_lokasi = ?',
      [nama_lokasi, deskripsi || null, id]
    );
    
    res.json({
      success: true,
      message: 'Lokasi berhasil diperbarui',
      data: {
        id_lokasi: id,
        nama_lokasi,
        deskripsi
      }
    });
  } catch (error) {
    console.error('Error updating lokasi:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

// Route untuk menghapus lokasi
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cek apakah lokasi exists
    const [existingLokasi] = await db.query('SELECT * FROM lokasi WHERE id_lokasi = ?', [id]);
    if (existingLokasi.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lokasi tidak ditemukan'
      });
    }
    
    await db.query('DELETE FROM lokasi WHERE id_lokasi = ?', [id]);
    
    res.json({
      success: true,
      message: 'Lokasi berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting lokasi:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

module.exports = router;