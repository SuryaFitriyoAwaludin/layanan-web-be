const express = require('express');
const { db } = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Route untuk mendapatkan semua stok opname
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM stok_opname
      ORDER BY id_stok_opname DESC
    `);
    
    res.json({ 
      success: true, 
      message: 'Berhasil mendapatkan data stok opname', 
      data: rows 
    });
  } catch (error) {
    console.error('Error getting all stok opname:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk mendapatkan detail stok opname berdasarkan ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Dapatkan data stok opname
    const [stokOpname] = await db.query(`
      SELECT * FROM stok_opname
      WHERE id_stok_opname = ?
    `, [id]);
    
    if (stokOpname.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Stok opname tidak ditemukan' 
      });
    }
    
    // Dapatkan detail item stok opname
    const [detailItems] = await db.query(`
      SELECT dso.*, b.kode_barang, b.nama_barang, b.satuan
      FROM detail_stok_opname dso
      LEFT JOIN barang b ON dso.id_barang = b.id_barang
      WHERE dso.id_stok_opname = ?
    `, [id]);
    
    res.json({ 
      success: true, 
      message: 'Berhasil mendapatkan data stok opname', 
      data: {
        stok_opname: stokOpname[0],
        detail_items: detailItems
      }
    });
  } catch (error) {
    console.error(`Error getting stok opname with id ${req.params.id}:`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk membuat stok opname baru
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { 
      no_referensi, 
      tanggal_stok_opname, 
      keterangan, 
      created_by,
      detail_items 
    } = req.body;
    
    // Validasi data
    if (!no_referensi || !tanggal_stok_opname || !detail_items || !Array.isArray(detail_items) || detail_items.length === 0) {
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
        total_barang += parseInt(item.jumlah_fisik || 0);
      }
      
      // Insert stok opname
      const [result] = await db.query(
        'INSERT INTO stok_opname (no_referensi, tanggal_stok_opname, total_barang, keterangan, status, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [no_referensi, tanggal_stok_opname, total_barang, keterangan || '', 'draft', created_by || null]
      );
      
      const id_stok_opname = result.insertId;
      
      // Insert detail stok opname
      for (const item of detail_items) {
        const { 
          id_barang, 
          jumlah_sistem, 
          jumlah_fisik, 
          selisih, 
          keterangan: item_keterangan 
        } = item;
        
        // Validasi item
        if (!id_barang || jumlah_sistem === undefined || jumlah_fisik === undefined) {
          throw new Error('Detail item tidak lengkap');
        }
        
        // Cek barang
        const [barangResult] = await db.query('SELECT * FROM barang WHERE id_barang = ?', [id_barang]);
        
        if (barangResult.length === 0) {
          throw new Error(`Barang dengan ID ${id_barang} tidak ditemukan`);
        }
        
        // Hitung selisih
        const selisihValue = parseInt(jumlah_fisik) - parseInt(jumlah_sistem);
        
        // Insert detail stok opname
        await db.query(
          'INSERT INTO detail_stok_opname (id_stok_opname, id_barang, jumlah_sistem, jumlah_fisik, selisih, keterangan) VALUES (?, ?, ?, ?, ?, ?)',
          [id_stok_opname, id_barang, jumlah_sistem, jumlah_fisik, selisihValue, item_keterangan || '']
        );
      }
      
      // Commit transaksi
      await db.query('COMMIT');
      
      res.status(201).json({
        success: true,
        message: 'Stok opname berhasil dibuat',
        data: {
          id_stok_opname,
          no_referensi,
          tanggal_stok_opname,
          total_barang,
          status: 'draft'
        }
      });
    } catch (error) {
      // Rollback jika terjadi error
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating stok opname:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

// Route untuk mengubah status stok opname menjadi 'selesai' dan update stok
router.put('/:id/selesai', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Cek stok opname
    const [stokOpname] = await db.query('SELECT * FROM stok_opname WHERE id_stok_opname = ?', [id]);
    
    if (stokOpname.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stok opname tidak ditemukan'
      });
    }
    
    if (stokOpname[0].status === 'selesai') {
      return res.status(400).json({
        success: false,
        message: 'Stok opname sudah berstatus selesai'
      });
    }
    
    // Mulai transaksi database
    await db.query('START TRANSACTION');
    
    try {
      // Dapatkan detail stok opname
      const [detailItems] = await db.query(
        'SELECT * FROM detail_stok_opname WHERE id_stok_opname = ?',
        [id]
      );
      
      // Update stok barang berdasarkan selisih
      for (const item of detailItems) {
        await db.query(
          'UPDATE barang SET stok = ? WHERE id_barang = ?',
          [item.jumlah_fisik, item.id_barang]
        );
      }
      
      // Update status stok opname
      await db.query(
        'UPDATE stok_opname SET status = ? WHERE id_stok_opname = ?',
        ['selesai', id]
      );
      
      // Commit transaksi
      await db.query('COMMIT');
      
      res.json({
        success: true,
        message: 'Stok opname berhasil diselesaikan dan stok barang telah diperbarui'
      });
    } catch (error) {
      // Rollback jika terjadi error
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error(`Error updating stok opname status with id ${req.params.id}:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

module.exports = router;