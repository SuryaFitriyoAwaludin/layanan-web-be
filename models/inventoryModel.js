const { pool } = require('../config/database');

const inventoryModel = {
  // Mendapatkan semua data inventory
  getAll: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT i.*, b.kode_barang, b.nama_barang, u.nama_user 
        FROM inventory i
        LEFT JOIN barang b ON i.id_barang = b.id_barang
        LEFT JOIN users u ON i.id_user = u.id_user
        ORDER BY i.id_inventory DESC
      `);
      return { success: true, data: rows };
    } catch (error) {
      console.error('Error getting all inventory:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mendapatkan inventory berdasarkan ID
  getById: async (id) => {
    try {
      const [rows] = await pool.query(`
        SELECT i.*, b.kode_barang, b.nama_barang, u.nama_user 
        FROM inventory i
        LEFT JOIN barang b ON i.id_barang = b.id_barang
        LEFT JOIN users u ON i.id_user = u.id_user
        WHERE i.id_inventory = ?
      `, [id]);
      
      if (rows.length === 0) {
        return { success: false, error: 'Inventory tidak ditemukan' };
      }
      
      return { success: true, data: rows[0] };
    } catch (error) {
      console.error(`Error getting inventory with id ${id}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  // Membuat inventory baru (barang masuk/keluar)
  create: async (inventoryData) => {
    try {
      // Mulai transaksi
      await pool.query('START TRANSACTION');
      
      // Insert data inventory
      const [result] = await pool.query(`
        INSERT INTO inventory (
          id_barang, tanggal, jenis, jumlah, keterangan, id_user
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        inventoryData.id_barang,
        inventoryData.tanggal || new Date(),
        inventoryData.jenis, // 'masuk' atau 'keluar'
        inventoryData.jumlah,
        inventoryData.keterangan,
        inventoryData.id_user
      ]);
      
      // Update stok barang
      const stokAdjustment = inventoryData.jenis === 'masuk' ? 
        `stok = stok + ${inventoryData.jumlah}` : 
        `stok = stok - ${inventoryData.jumlah}`;
      
      await pool.query(`
        UPDATE barang SET ${stokAdjustment}, updated_at = CURRENT_TIMESTAMP
        WHERE id_barang = ?
      `, [inventoryData.id_barang]);
      
      // Commit transaksi
      await pool.query('COMMIT');
      
      return { 
        success: true, 
        message: 'Inventory berhasil ditambahkan', 
        id: result.insertId 
      };
    } catch (error) {
      // Rollback jika terjadi error
      await pool.query('ROLLBACK');
      console.error('Error creating inventory:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mendapatkan riwayat inventory berdasarkan ID barang
  getByBarangId: async (id_barang) => {
    try {
      const [rows] = await pool.query(`
        SELECT i.*, b.kode_barang, b.nama_barang, u.nama_user 
        FROM inventory i
        LEFT JOIN barang b ON i.id_barang = b.id_barang
        LEFT JOIN users u ON i.id_user = u.id_user
        WHERE i.id_barang = ?
        ORDER BY i.tanggal DESC
      `, [id_barang]);
      
      return { success: true, data: rows };
    } catch (error) {
      console.error(`Error getting inventory for barang id ${id_barang}:`, error.message);
      return { success: false, error: error.message };
    }
  }
};

module.exports = inventoryModel;