const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import database dari config
const { db } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const barangRoutes = require('./routes/barangRoutes');
const statusRoutes = require('./routes/statusRoutes');

// Import utils
const logger = require('./utils/logger');

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fungsi untuk menguji koneksi database
const testConnection = async () => {
  try {
    const [rows] = await db.query('SELECT 1');
    console.log('Koneksi database berhasil!');
    return true;
  } catch (error) {
    console.error('Koneksi database gagal:', error.message);
    return false;
  }
};

// Gunakan routes
app.use('/api/auth', authRoutes);
app.use('/api/barang', barangRoutes);
app.use('/api/status', statusRoutes);

// Middleware error handler
app.use(errorHandler);

// Route untuk mendapatkan semua data barang
app.get('/api/barang', async (req, res) => {
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

// Route untuk mendapatkan barang berdasarkan ID
app.get('/api/barang/:id', async (req, res) => {
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
    console.error(`Error getting barang with id ${id}:`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk membuat barang baru
app.post('/api/barang', async (req, res) => {
  try {
    const { kode_barang, nama_barang, id_kategori, id_lokasi, stok, satuan, keterangan } = req.body;
    
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
      'INSERT INTO barang (kode_barang, nama_barang, id_kategori, id_lokasi, stok, satuan, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [kode_barang, nama_barang, id_kategori || null, id_lokasi || null, stok || 0, satuan || '', keterangan || '']
    );
    
    if (result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menambahkan barang'
      });
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
        keterangan
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
app.put('/api/barang/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { kode_barang, nama_barang, id_kategori, id_lokasi, stok, satuan, keterangan } = req.body;
    
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
      'UPDATE barang SET kode_barang = ?, nama_barang = ?, id_kategori = ?, id_lokasi = ?, stok = ?, satuan = ?, keterangan = ? WHERE id_barang = ?',
      [kode_barang, nama_barang, id_kategori || null, id_lokasi || null, stok || 0, satuan || '', keterangan || '', id]
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
        keterangan
      }
    });
  } catch (error) {
    console.error(`Error updating barang with id ${id}:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

// Route untuk menghapus barang
app.delete('/api/barang/:id', async (req, res) => {
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
    console.error(`Error deleting barang with id ${id}:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

// Route untuk mendapatkan semua data inventory
app.get('/api/inventory', async (req, res) => {
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
app.get('/api/inventory/barang/:id_barang', async (req, res) => {
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
    console.error(`Error getting inventory for barang id ${id_barang}:`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk menambah inventory (transaksi masuk/keluar)
app.post('/api/inventory', async (req, res) => {
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

// Route untuk mendapatkan semua data kategori
app.get('/api/kategori', async (req, res) => {
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

// Route untuk mendapatkan semua data lokasi
app.get('/api/lokasi', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM lokasi ORDER BY nama_lokasi');
    
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

// Route untuk mendapatkan semua data supplier
app.get('/api/supplier', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM supplier ORDER BY nama_supplier');
    
    res.json({ 
      success: true, 
      message: 'Berhasil mendapatkan data supplier', 
      data: rows 
    });
  } catch (error) {
    console.error('Error getting all supplier:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk mendapatkan semua transaksi masuk
app.get('/api/transaksi-masuk', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT tm.*, s.nama_supplier 
      FROM transaksi_masuk tm
      LEFT JOIN supplier s ON tm.id_supplier = s.id_supplier
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
app.get('/api/transaksi-masuk/:id', async (req, res) => {
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
    console.error(`Error getting transaksi masuk with id ${id}:`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk membuat transaksi masuk baru
app.post('/api/transaksi-masuk', async (req, res) => {
  try {
    const { 
      no_referensi, 
      tanggal_transaksi, 
      id_supplier, 
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

// Route untuk mendapatkan semua transaksi keluar
app.get('/api/transaksi-keluar', async (req, res) => {
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
app.get('/api/transaksi-keluar/:id', async (req, res) => {
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
    console.error(`Error getting transaksi keluar with id ${id}:`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk membuat transaksi keluar baru
app.post('/api/transaksi-keluar', async (req, res) => {
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

// Route untuk mendapatkan semua stok opname
app.get('/api/stok-opname', async (req, res) => {
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
app.get('/api/stok-opname/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Dapatkan data stok opname
    const [opname] = await db.query(`
      SELECT * FROM stok_opname
      WHERE id_stok_opname = ?
    `, [id]);
    
    if (opname.length === 0) {
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
        opname: opname[0],
        detail_items: detailItems
      }
    });
  } catch (error) {
    console.error(`Error getting stok opname with id ${id}:`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Route untuk membuat stok opname baru
app.post('/api/stok-opname', async (req, res) => {
  try {
    const { 
      tanggal_opname, 
      keterangan, 
      created_by,
      detail_items,
      status
    } = req.body;
    
    // Validasi data
    if (!tanggal_opname || !detail_items || !Array.isArray(detail_items) || detail_items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Tanggal dan detail item harus diisi'
      });
    }
    
    // Mulai transaksi database
    await db.query('START TRANSACTION');
    
    try {
      // Insert stok opname
      const [result] = await db.query(
        'INSERT INTO stok_opname (tanggal_opname, keterangan, status, created_by) VALUES (?, ?, ?, ?)',
        [tanggal_opname, keterangan || '', status || 'draft', created_by || null]
      );
      
      const id_stok_opname = result.insertId;
      
      // Insert detail stok opname
      for (const item of detail_items) {
        const { id_barang, stok_sistem, stok_fisik, keterangan: item_keterangan } = item;
        
        // Validasi item
        if (!id_barang || stok_fisik === undefined) {
          throw new Error('Detail item tidak lengkap');
        }
        
        // Dapatkan stok sistem jika tidak disediakan
        let stok_sistem_value = stok_sistem;
        if (stok_sistem_value === undefined) {
          const [barangResult] = await db.query('SELECT stok FROM barang WHERE id_barang = ?', [id_barang]);
          
          if (barangResult.length === 0) {
            throw new Error(`Barang dengan ID ${id_barang} tidak ditemukan`);
          }
          
          stok_sistem_value = barangResult[0].stok;
        }
        
        // Hitung selisih
        const selisih = stok_fisik - stok_sistem_value;
        
        // Insert detail stok opname
        await db.query(
          'INSERT INTO detail_stok_opname (id_stok_opname, id_barang, stok_sistem, stok_fisik, selisih, keterangan) VALUES (?, ?, ?, ?, ?, ?)',
          [id_stok_opname, id_barang, stok_sistem_value, stok_fisik, selisih, item_keterangan || '']
        );
        
        // Update stok barang jika status selesai
        if (status === 'selesai') {
          await db.query('UPDATE barang SET stok = ? WHERE id_barang = ?', 
            [stok_fisik, id_barang]);
        }
      }
      
      // Commit transaksi
      await db.query('COMMIT');
      
      res.status(201).json({
        success: true,
        message: 'Stok opname berhasil dibuat',
        data: {
          id_stok_opname,
          tanggal_opname,
          status: status || 'draft'
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

// Route untuk mengubah status stok opname menjadi selesai
app.put('/api/stok-opname/:id/selesai', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Cek apakah stok opname ada
    const [opname] = await db.query('SELECT * FROM stok_opname WHERE id_stok_opname = ?', [id]);
    
    if (opname.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stok opname tidak ditemukan'
      });
    }
    
    if (opname[0].status === 'selesai') {
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
      
      // Update stok barang berdasarkan stok fisik
      for (const item of detailItems) {
        await db.query('UPDATE barang SET stok = ? WHERE id_barang = ?', 
          [item.stok_fisik, item.id_barang]);
      }
      
      // Update status stok opname
      await db.query('UPDATE stok_opname SET status = ? WHERE id_stok_opname = ?', 
        ['selesai', id]);
      
      // Commit transaksi
      await db.query('COMMIT');
      
      res.json({
        success: true,
        message: 'Status stok opname berhasil diubah menjadi selesai',
        data: {
          id_stok_opname: parseInt(id),
          status: 'selesai'
        }
      });
    } catch (error) {
      // Rollback jika terjadi error
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error(`Error updating stok opname status with id ${id}:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
});

// Mulai server
app.listen(PORT, () => {
  logger.info(`Server berjalan di port ${PORT}`);
});

// Route untuk pengguna (users)
app.get('/api/pengguna', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id_pengguna, username, nama_lengkap, email, role, status, last_login, created_at, updated_at
      FROM pengguna
      ORDER BY id_pengguna
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

app.get('/api/pengguna/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    const [rows] = await db.query(`
      SELECT id_pengguna, username, nama_lengkap, email, role, status, last_login, created_at, updated_at
      FROM pengguna
      WHERE id_pengguna = ?
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
    console.error(`Error getting user with id ${id}:`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

app.post('/api/pengguna', async (req, res) => {
  try {
    const { 
      username, 
      password, 
      nama_lengkap, 
      email, 
      role 
    } = req.body;
    
    // Validasi data
    if (!username || !password || !nama_lengkap) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Username, password, dan nama lengkap harus diisi'
      });
    }
    
    // Cek apakah username sudah ada
    const [existingUser] = await db.query('SELECT * FROM pengguna WHERE username = ?', [username]);
    
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan'
      });
    }
    
    // Cek apakah email sudah ada (jika email disediakan)
    if (email) {
      const [existingEmail] = await db.query('SELECT * FROM pengguna WHERE email = ?', [email]);
      
      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah digunakan'
        });
      }
    }
    
    // Hash password (dalam implementasi nyata, gunakan bcrypt atau library serupa)
    // Untuk contoh sederhana, kita gunakan password apa adanya
    // const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPassword = password; // Ganti dengan implementasi hash yang aman
    
    // Insert pengguna baru
    const [result] = await db.query(
      'INSERT INTO pengguna (username, password, nama_lengkap, email, role) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, nama_lengkap, email || null, role || 'staff']
    );
    
    res.status(201).json({
      success: true,
      message: 'Pengguna berhasil dibuat',
      data: {
        id_pengguna: result.insertId,
        username,
        nama_lengkap,
        email,
        role: role || 'staff'
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

// Route untuk log aktivitas
app.get('/api/log-aktivitas', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT l.*, p.username, p.nama_lengkap
      FROM log_aktivitas l
      LEFT JOIN pengguna p ON l.id_pengguna = p.id_pengguna
      ORDER BY l.created_at DESC
    `);
    
    res.json({ 
      success: true, 
      message: 'Berhasil mendapatkan data log aktivitas', 
      data: rows 
    });
  } catch (error) {
    console.error('Error getting activity logs:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server', 
      error: error.message 
    });
  }
});

// Fungsi untuk mencatat log aktivitas
const logActivity = async (id_pengguna, aktivitas, tabel, id_referensi, keterangan, req) => {
  try {
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'];
    
    await db.query(
      'INSERT INTO log_aktivitas (id_pengguna, aktivitas, tabel, id_referensi, keterangan, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id_pengguna, aktivitas, tabel, id_referensi, keterangan, ip_address, user_agent]
    );
    
    return true;
  } catch (error) {
    console.error('Error logging activity:', error.message);
    return false;
  }
};

// Contoh penggunaan log aktivitas pada endpoint create barang
app.post('/api/barang', async (req, res) => {
  try {
    const { 
      kode_barang, 
      nama_barang, 
      id_kategori, 
      satuan, 
      harga_beli, 
      harga_jual, 
      id_lokasi, 
      keterangan,
      gambar,
      id_pengguna // ID pengguna yang melakukan aksi
    } = req.body;
    
    // Validasi data
    if (!kode_barang || !nama_barang) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Kode barang dan nama barang harus diisi'
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
    
    // Insert barang baru
    const [result] = await db.query(
      'INSERT INTO barang (kode_barang, nama_barang, id_kategori, satuan, harga_beli, harga_jual, id_lokasi, keterangan, gambar, stok) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [kode_barang, nama_barang, id_kategori || null, satuan || null, harga_beli || 0, harga_jual || 0, id_lokasi || null, keterangan || null, gambar || null, 0]
    );
    
    // Catat log aktivitas
    if (id_pengguna) {
      await logActivity(
        id_pengguna,
        'Tambah Barang',
        'barang',
        result.insertId,
        `Menambahkan barang baru: ${nama_barang}`,
        req
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'Barang berhasil ditambahkan',
      data: {
        id_barang: result.insertId,
        kode_barang,
        nama_barang
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