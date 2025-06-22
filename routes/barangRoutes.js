const express = require('express');
const { db } = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// Route untuk mendapatkan semua data barang (semua user bisa akses)
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, k.nama_kategori, l.nama_lokasi 
      FROM barang b
      LEFT JOIN kategori k ON b.id_kategori = k.id_kategori
      LEFT JOIN lokasi l ON b.id_lokasi = l.id_lokasi
      ORDER BY b.id_barang DESC
    `);
    
    res.json({ 
      success: true, 
      message: 'Berhasil mendapatkan data barang', 
      data: rows 
    });
  } catch (error) {
    console.error('Error getting all barang:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk mendapatkan barang dengan stok rendah
router.get('/stok-rendah', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, k.nama_kategori, l.nama_lokasi 
      FROM barang b
      LEFT JOIN kategori k ON b.id_kategori = k.id_kategori
      LEFT JOIN lokasi l ON b.id_lokasi = l.id_lokasi
      WHERE b.stok <= b.stok_minimum
      ORDER BY b.stok ASC
    `);
    
    res.json({ 
      success: true, 
      message: 'Berhasil mendapatkan data barang dengan stok rendah', 
      data: rows,
      count: rows.length 
    });
  } catch (error) {
    console.error('Error getting barang with low stock:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk mendapatkan barang berdasarkan ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.query(`
      SELECT b.*, k.nama_kategori, l.nama_lokasi 
      FROM barang b
      LEFT JOIN kategori k ON b.id_kategori = k.id_kategori
      LEFT JOIN lokasi l ON b.id_lokasi = l.id_lokasi
      WHERE b.id_barang = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Barang tidak ditemukan' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Berhasil mendapatkan data barang', 
      data: rows[0] 
    });
  } catch (error) {
    console.error(`Error getting barang with id ${req.params.id}:`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk membuat barang baru
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { kode_barang, nama_barang, id_kategori, id_lokasi, stok, satuan, keterangan, harga_beli, harga_jual, gambar, id_pengguna } = req.body;
    
    // Validasi data
    if (!kode_barang || !nama_barang) {
      return res.status(400).json({
        success: false,
        message: 'Kode barang dan nama barang harus diisi'
      });
    }
    
    // Cek apakah kode barang sudah ada
    const [existingBarang] = await db.query('SELECT * FROM barang WHERE kode_barang = ?', [kode_barang]);
    
    if (existingBarang.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Kode barang sudah digunakan'
      });
    }
    
    // Insert data barang baru
    const [result] = await db.query(
      'INSERT INTO barang (kode_barang, nama_barang, id_kategori, id_lokasi, stok, stok_minimum, satuan, keterangan, harga_beli, harga_jual, gambar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [kode_barang, nama_barang, id_kategori || null, id_lokasi || null, stok || 0, req.body.stok_minimum || 5, satuan || '', keterangan || '', harga_beli || 0, harga_jual || 0, gambar || null]
    );
    
    if (result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menambahkan barang'
      });
    }
    
    // Catat log aktivitas jika ada id_pengguna
    if (id_pengguna && req) {
      try {
        const ip_address = req.ip || req.connection.remoteAddress;
        const user_agent = req.headers['user-agent'];
        
        await db.query(
          'INSERT INTO log_aktivitas (id_pengguna, aktivitas, tabel, id_referensi, keterangan, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [id_pengguna, 'Tambah Barang', 'barang', result.insertId, `Menambahkan barang baru: ${nama_barang}`, ip_address, user_agent]
        );
      } catch (logError) {
        console.error('Error logging activity:', logError.message);
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Barang berhasil ditambahkan',
      data: {
        id_barang: result.insertId,
        kode_barang,
        nama_barang,
        id_kategori,
        id_lokasi,
        stok,
        satuan,
        keterangan,
        harga_beli,
        harga_jual,
        gambar
      }
    });
  } catch (error) {
    console.error('Error creating barang:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

// Route untuk mengupdate barang
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { kode_barang, nama_barang, id_kategori, id_lokasi, stok, satuan, keterangan, harga_beli, harga_jual, gambar } = req.body;
    
    // Validasi data
    if (!kode_barang || !nama_barang) {
      return res.status(400).json({
        success: false,
        message: 'Kode barang dan nama barang harus diisi'
      });
    }
    
    // Cek apakah barang ada
    const [existingBarang] = await db.query('SELECT * FROM barang WHERE id_barang = ?', [id]);
    
    if (existingBarang.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan'
      });
    }
    
    // Cek apakah kode barang sudah digunakan oleh barang lain
    const [duplicateKode] = await db.query('SELECT * FROM barang WHERE kode_barang = ? AND id_barang != ?', [kode_barang, id]);
    
    if (duplicateKode.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Kode barang sudah digunakan oleh barang lain'
      });
    }
    
    // Update data barang
    const [result] = await db.query(
      'UPDATE barang SET kode_barang = ?, nama_barang = ?, id_kategori = ?, id_lokasi = ?, stok = ?, stok_minimum = ?, satuan = ?, keterangan = ?, harga_beli = ?, harga_jual = ?, gambar = ? WHERE id_barang = ?',
      [kode_barang, nama_barang, id_kategori || null, id_lokasi || null, stok || 0, req.body.stok_minimum || existingBarang[0].stok_minimum || 5, satuan || '', keterangan || '', harga_beli || existingBarang[0].harga_beli, harga_jual || existingBarang[0].harga_jual, gambar || existingBarang[0].gambar, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengupdate barang'
      });
    }
    
    res.json({
      success: true,
      message: 'Barang berhasil diupdate',
      data: {
        id_barang: parseInt(id),
        kode_barang,
        nama_barang,
        id_kategori,
        id_lokasi,
        stok,
        satuan,
        keterangan,
        harga_beli,
        harga_jual,
        gambar
      }
    });
  } catch (error) {
    console.error(`Error updating barang with id ${req.params.id}:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

// Route untuk menghapus barang
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Cek apakah barang ada
    const [existingBarang] = await db.query('SELECT * FROM barang WHERE id_barang = ?', [id]);
    
    if (existingBarang.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan'
      });
    }
    
    // Hapus data barang
    const [result] = await db.query('DELETE FROM barang WHERE id_barang = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus barang'
      });
    }
    
    res.json({
      success: true,
      message: 'Barang berhasil dihapus',
      data: { id_barang: parseInt(id) }
    });
  } catch (error) {
    console.error(`Error deleting barang with id ${req.params.id}:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

module.exports = router;