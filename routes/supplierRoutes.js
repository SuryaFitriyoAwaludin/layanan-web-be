const express = require('express');
const { db } = require('../config/database');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Route untuk mendapatkan semua supplier
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, COUNT(tm.id_transaksi_masuk) AS total_transaksi_masuk
      FROM supplier s
      LEFT JOIN transaksi_masuk tm ON s.id_supplier = tm.id_supplier
      GROUP BY s.id_supplier
      ORDER BY s.nama_supplier ASC
    `);
    
    res.json({ 
      success: true, 
      message: 'Berhasil mendapatkan data supplier', 
      data: rows 
    });
  } catch (error) {
    console.error('Error getting all suppliers:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk mendapatkan supplier berdasarkan ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM supplier WHERE id_supplier = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Supplier tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Berhasil mendapatkan data supplier',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error getting supplier by ID:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

// Route untuk menambahkan supplier baru
router.post('/', verifyToken, async (req, res) => {
  try {
    const { nama_supplier, telepon, alamat, email, kontak_person } = req.body;
    
    if (!nama_supplier) {
      return res.status(400).json({
        success: false,
        message: 'Nama supplier wajib diisi'
      });
    }
    
    const [result] = await db.query(
      'INSERT INTO supplier (nama_supplier, telepon, alamat, email, kontak_person) VALUES (?, ?, ?, ?, ?)',
      [nama_supplier, telepon || null, alamat || null, email || null, kontak_person || null]
    );
    
    res.status(201).json({
      success: true,
      message: 'Supplier berhasil ditambahkan',
      data: {
        id_supplier: result.insertId,
        nama_supplier,
        telepon,
        alamat,
        email,
        kontak_person
      }
    });
  } catch (error) {
    console.error('Error adding supplier:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

// Route untuk mengupdate supplier
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_supplier, telepon, alamat, email, kontak_person } = req.body;
    
    if (!nama_supplier) {
      return res.status(400).json({
        success: false,
        message: 'Nama supplier wajib diisi'
      });
    }
    
    // Cek apakah supplier exists
    const [existingSupplier] = await db.query('SELECT * FROM supplier WHERE id_supplier = ?', [id]);
    if (existingSupplier.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Supplier tidak ditemukan'
      });
    }
    
    await db.query(
      'UPDATE supplier SET nama_supplier = ?, telepon = ?, alamat = ?, email = ?, kontak_person = ? WHERE id_supplier = ?',
      [nama_supplier, telepon || null, alamat || null, email || null, kontak_person || null, id]
    );
    
    res.json({
      success: true,
      message: 'Supplier berhasil diperbarui',
      data: {
        id_supplier: id,
        nama_supplier,
        telepon,
        alamat,
        email,
        kontak_person
      }
    });
  } catch (error) {
    console.error('Error updating supplier:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

// Route untuk menghapus supplier
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cek apakah supplier exists
    const [existingSupplier] = await db.query('SELECT * FROM supplier WHERE id_supplier = ?', [id]);
    if (existingSupplier.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Supplier tidak ditemukan'
      });
    }
    
    await db.query('DELETE FROM supplier WHERE id_supplier = ?', [id]);
    
    res.json({
      success: true,
      message: 'Supplier berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting supplier:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

module.exports = router;