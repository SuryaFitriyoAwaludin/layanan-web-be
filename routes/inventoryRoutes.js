const express = require('express');
const { db } = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Route untuk mendapatkan semua data inventory
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT i.*, b.kode_barang, b.nama_barang, u.nama_user 
      FROM inventory i
      LEFT JOIN barang b ON i.id_barang = b.id_barang
      LEFT JOIN users u ON i.id_user = u.id_user
      ORDER BY i.id_inventory DESC
    `);
    
    res.json({ 
      success: true, 
      message: 'Berhasil mendapatkan data inventory', 
      data: rows 
    });
  } catch (error) {
    console.error('Error getting all inventory:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk mendapatkan inventory berdasarkan ID barang
router.get('/barang/:id_barang', verifyToken, async (req, res) => {
  try {
    const id_barang = req.params.id_barang;
    const [rows] = await db.query(`
      SELECT i.*, b.kode_barang, b.nama_barang, u.nama_user 
      FROM inventory i
      LEFT JOIN barang b ON i.id_barang = b.id_barang
      LEFT JOIN users u ON i.id_user = u.id_user
      WHERE i.id_barang = ?
      ORDER BY i.tanggal DESC
    `, [id_barang]);
    
    res.json({ 
      success: true, 
      message: 'Berhasil mendapatkan data inventory', 
      data: rows 
    });
  } catch (error) {
    console.error(`Error getting inventory for barang id ${req.params.id_barang}:`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk menambah inventory (transaksi masuk/keluar)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id_barang, jenis, jumlah, keterangan, id_user } = req.body;
    
    // Validasi data
    if (!id_barang || !jenis || !jumlah) {
      return res.status(400).json({
        success: false,
        message: 'ID barang, jenis transaksi, dan jumlah harus diisi'
      });
    }
    
    // Validasi jenis transaksi
    if (jenis !== 'masuk' && jenis !== 'keluar') {
      return res.status(400).json({
        success: false,
        message: 'Jenis transaksi harus masuk atau keluar'
      });
    }
    
    // Cek apakah barang ada
    const [existingBarang] = await db.query('SELECT * FROM barang WHERE id_barang = ?', [id_barang]);
    
    if (existingBarang.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan'
      });
    }
    
    // Mulai transaksi database
    await db.query('START TRANSACTION');
    
    try {
      // Insert data inventory
      const [result] = await db.query(
        'INSERT INTO inventory (id_barang, jenis, jumlah, keterangan, id_user, tanggal) VALUES (?, ?, ?, ?, ?, NOW())',
        [id_barang, jenis, jumlah, keterangan || '', id_user || null]
      );
      
      // Update stok barang
      let updateQuery = '';
      if (jenis === 'masuk') {
        updateQuery = 'UPDATE barang SET stok = stok + ? WHERE id_barang = ?';
      } else { // keluar
        updateQuery = 'UPDATE barang SET stok = stok - ? WHERE id_barang = ?';
      }
      
      await db.query(updateQuery, [jumlah, id_barang]);
      
      // Commit transaksi
      await db.query('COMMIT');
      
      res.status(201).json({
        success: true,
        message: `Transaksi ${jenis} berhasil dicatat`,
        data: {
          id_inventory: result.insertId,
          id_barang,
          jenis,
          jumlah,
          keterangan,
          id_user,
          tanggal: new Date()
        }
      });
    } catch (error) {
      // Rollback jika terjadi error
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating inventory:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

module.exports = router;