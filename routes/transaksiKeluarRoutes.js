const express = require('express');
const { db } = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Route untuk mendapatkan semua transaksi keluar
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM transaksi_keluar
      ORDER BY id_transaksi_keluar DESC
    `);
    
    res.json({ 
      success: true, 
      message: 'Berhasil mendapatkan data transaksi keluar', 
      data: rows 
    });
  } catch (error) {
    console.error('Error getting all transaksi keluar:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk mendapatkan detail transaksi keluar berdasarkan ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Dapatkan data transaksi keluar
    const [transaksi] = await db.query(`
      SELECT * FROM transaksi_keluar
      WHERE id_transaksi_keluar = ?
    `, [id]);
    
    if (transaksi.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaksi keluar tidak ditemukan' 
      });
    }
    
    // Dapatkan detail item transaksi
    const [detailItems] = await db.query(`
      SELECT dtk.*, b.kode_barang, b.nama_barang, b.satuan
      FROM detail_transaksi_keluar dtk
      LEFT JOIN barang b ON dtk.id_barang = b.id_barang
      WHERE dtk.id_transaksi_keluar = ?
    `, [id]);
    
    res.json({ 
      success: true, 
      message: 'Berhasil mendapatkan data transaksi keluar', 
      data: {
        transaksi: transaksi[0],
        detail_items: detailItems
      }
    });
  } catch (error) {
    console.error(`Error getting transaksi keluar with id ${req.params.id}:`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk membuat transaksi keluar baru
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { 
      no_referensi, 
      tanggal_transaksi, 
      tujuan, 
      keterangan, 
      created_by,
      detail_items 
    } = req.body;
    
    // Validasi data
    if (!no_referensi || !tanggal_transaksi || !detail_items || !Array.isArray(detail_items) || detail_items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. No referensi, tanggal, dan detail item harus diisi'
      });
    }
    
    // Mulai transaksi database
    await db.query('START TRANSACTION');
    
    try {
      // Hitung total barang
      let total_barang = 0;
      for (const item of detail_items) {
        total_barang += parseInt(item.jumlah);
      }
      
      // Insert transaksi keluar
      const [result] = await db.query(
        'INSERT INTO transaksi_keluar (no_referensi, tanggal_transaksi, tujuan, total_barang, keterangan, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [no_referensi, tanggal_transaksi, tujuan || '', total_barang, keterangan || '', 'selesai', created_by || null]
      );
      
      const id_transaksi_keluar = result.insertId;
      
      // Insert detail transaksi dan update stok barang
      for (const item of detail_items) {
        const { id_barang, jumlah, harga_satuan, keterangan: item_keterangan } = item;
        
        // Validasi item
        if (!id_barang || !jumlah) {
          throw new Error('Detail item tidak lengkap');
        }
        
        // Cek stok barang
        const [barangResult] = await db.query('SELECT stok FROM barang WHERE id_barang = ?', [id_barang]);
        
        if (barangResult.length === 0) {
          throw new Error(`Barang dengan ID ${id_barang} tidak ditemukan`);
        }
        
        if (barangResult[0].stok < jumlah) {
          throw new Error(`Stok barang dengan ID ${id_barang} tidak mencukupi`);
        }
        
        // Hitung subtotal
        const subtotal = jumlah * (harga_satuan || 0);
        
        // Insert detail transaksi
        await db.query(
          'INSERT INTO detail_transaksi_keluar (id_transaksi_keluar, id_barang, jumlah, harga_satuan, subtotal, keterangan) VALUES (?, ?, ?, ?, ?, ?)',
          [id_transaksi_keluar, id_barang, jumlah, harga_satuan || 0, subtotal, item_keterangan || '']
        );
        
        // Update stok barang
        await db.query('UPDATE barang SET stok = stok - ? WHERE id_barang = ?', 
          [jumlah, id_barang]);
      }
      
      // Commit transaksi
      await db.query('COMMIT');
      
      res.status(201).json({
        success: true,
        message: 'Transaksi keluar berhasil dibuat',
        data: {
          id_transaksi_keluar,
          no_referensi,
          tanggal_transaksi,
          total_barang
        }
      });
    } catch (error) {
      // Rollback jika terjadi error
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating transaksi keluar:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

module.exports = router;