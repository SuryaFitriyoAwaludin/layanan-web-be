const express = require('express');
const { db } = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Route untuk mendapatkan semua transaksi masuk
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        tm.*, 
        s.nama_supplier, 
        SUM(dtm.jumlah) AS total_barang
      FROM transaksi_masuk tm
      LEFT JOIN supplier s ON tm.id_supplier = s.id_supplier
      LEFT JOIN detail_transaksi_masuk dtm ON tm.id_transaksi_masuk = dtm.id_transaksi_masuk
      GROUP BY tm.id_transaksi_masuk
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

// Route untuk mendapatkan detail transaksi masuk berdasarkan ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Dapatkan data transaksi masuk
    const [transaksi] = await db.query(`
      SELECT tm.*, s.nama_supplier 
      FROM transaksi_masuk tm
      LEFT JOIN supplier s ON tm.id_supplier = s.id_supplier
      WHERE tm.id_transaksi_masuk = ?
    `, [id]);
    
    if (transaksi.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaksi masuk tidak ditemukan' 
      });
    }
    
    // Dapatkan detail item transaksi
    const [detailItems] = await db.query(`
      SELECT dtm.*, b.kode_barang, b.nama_barang, b.satuan
      FROM detail_transaksi_masuk dtm
      LEFT JOIN barang b ON dtm.id_barang = b.id_barang
      WHERE dtm.id_transaksi_masuk = ?
    `, [id]);
    
    res.json({ 
      success: true, 
      message: 'Berhasil mendapatkan data transaksi masuk', 
      data: {
        transaksi: transaksi[0],
        detail_items: detailItems
      }
    });
  } catch (error) {
    console.error(`Error getting transaksi masuk with id ${req.params.id}:`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk membuat transaksi masuk baru
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { 
      tanggal_transaksi, 
      id_supplier, 
      keterangan, 
      created_by,
      detail_items 
    } = req.body;
    
    // Validasi data
    if (!tanggal_transaksi || !detail_items || !Array.isArray(detail_items) || detail_items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Tanggal dan detail item harus diisi'
      });
    }

    // Generate no_referensi
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
    const no_referensi = `TM-${year}${month}${day}-${hours}${minutes}${seconds}${milliseconds}`;
    
    // Mulai transaksi database
    await db.query('START TRANSACTION');
    
    try {
      // Hitung total harga
      let total_harga = 0;
      for (const item of detail_items) {
        total_harga += (item.jumlah * item.harga_satuan);
      }
      
      // Insert transaksi masuk
      const [result] = await db.query(
        'INSERT INTO transaksi_masuk (no_referensi, tanggal_transaksi, id_supplier, total_harga, keterangan, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [no_referensi, tanggal_transaksi, id_supplier || null, total_harga, keterangan || '', 'selesai', created_by || null]
      );
      
      const id_transaksi_masuk = result.insertId;
      
      // Insert detail transaksi dan update stok barang
      for (const item of detail_items) {
        const { id_barang, jumlah, harga_satuan, keterangan: item_keterangan } = item;
        
        // Validasi item
        if (!id_barang || !jumlah || !harga_satuan) {
          throw new Error('Detail item tidak lengkap');
        }
        
        // Hitung subtotal
        const subtotal = jumlah * harga_satuan;
        
        // Insert detail transaksi
        await db.query(
          'INSERT INTO detail_transaksi_masuk (id_transaksi_masuk, id_barang, jumlah, harga_satuan, subtotal, keterangan) VALUES (?, ?, ?, ?, ?, ?)',
          [id_transaksi_masuk, id_barang, jumlah, harga_satuan, subtotal, item_keterangan || '']
        );
        
        // Update stok barang
        await db.query('UPDATE barang SET stok = stok + ?, harga_beli = ? WHERE id_barang = ?', 
          [jumlah, harga_satuan, id_barang]);
      }
      
      // Commit transaksi
      await db.query('COMMIT');
      
      res.status(201).json({
        success: true,
        message: 'Transaksi masuk berhasil dibuat',
        data: {
          id_transaksi_masuk,
          no_referensi,
          tanggal_transaksi,
          total_harga
        }
      });
    } catch (error) {
      // Rollback jika terjadi error
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating transaksi masuk:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

module.exports = router;