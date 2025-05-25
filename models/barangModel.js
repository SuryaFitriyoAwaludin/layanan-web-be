const { pool } = require('../config/database');

const barangModel = {
  // Mendapatkan semua data barang
  getAll: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT b.*, k.nama_kategori, l.nama_lokasi 
        FROM barang b
        LEFT JOIN kategori k ON b.id_kategori = k.id_kategori
        LEFT JOIN lokasi l ON b.id_lokasi = l.id_lokasi
        ORDER BY b.id_barang DESC
      `);
      return { success: true, data: rows };
    } catch (error) {
      console.error('Error getting all barang:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mendapatkan barang berdasarkan ID
  getById: async (id) => {
    try {
      const [rows] = await pool.query(`
        SELECT b.*, k.nama_kategori, l.nama_lokasi 
        FROM barang b
        LEFT JOIN kategori k ON b.id_kategori = k.id_kategori
        LEFT JOIN lokasi l ON b.id_lokasi = l.id_lokasi
        WHERE b.id_barang = ?
      `, [id]);
      
      if (rows.length === 0) {
        return { success: false, error: 'Barang tidak ditemukan' };
      }
      
      return { success: true, data: rows[0] };
    } catch (error) {
      console.error(`Error getting barang with id ${id}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  // Membuat barang baru
  create: async (barangData) => {
    try {
      const [result] = await pool.query(`
        INSERT INTO barang (
          kode_barang, nama_barang, id_kategori, stok, 
          satuan, harga_beli, harga_jual, id_lokasi, keterangan, gambar
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        barangData.kode_barang,
        barangData.nama_barang,
        barangData.id_kategori,
        barangData.stok || 0,
        barangData.satuan,
        barangData.harga_beli || 0,
        barangData.harga_jual || 0,
        barangData.id_lokasi,
        barangData.keterangan,
        barangData.gambar
      ]);
      
      return { 
        success: true, 
        message: 'Barang berhasil ditambahkan', 
        id: result.insertId 
      };
    } catch (error) {
      console.error('Error creating barang:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mengupdate barang
  update: async (id, barangData) => {
    try {
      const [result] = await pool.query(`
        UPDATE barang SET
          kode_barang = ?,
          nama_barang = ?,
          id_kategori = ?,
          stok = ?,
          satuan = ?,
          harga_beli = ?,
          harga_jual = ?,
          id_lokasi = ?,
          keterangan = ?,
          gambar = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id_barang = ?
      `, [
        barangData.kode_barang,
        barangData.nama_barang,
        barangData.id_kategori,
        barangData.stok,
        barangData.satuan,
        barangData.harga_beli,
        barangData.harga_jual,
        barangData.id_lokasi,
        barangData.keterangan,
        barangData.gambar,
        id
      ]);
      
      if (result.affectedRows === 0) {
        return { success: false, error: 'Barang tidak ditemukan' };
      }
      
      return { 
        success: true, 
        message: `Barang dengan ID: ${id} berhasil diupdate` 
      };
    } catch (error) {
      console.error(`Error updating barang with id ${id}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  // Menghapus barang
  delete: async (id) => {
    try {
      const [result] = await pool.query('DELETE FROM barang WHERE id_barang = ?', [id]);
      
      if (result.affectedRows === 0) {
        return { success: false, error: 'Barang tidak ditemukan' };
      }
      
      return { 
        success: true, 
        message: `Barang dengan ID: ${id} berhasil dihapus` 
      };
    } catch (error) {
      console.error(`Error deleting barang with id ${id}:`, error.message);
      return { success: false, error: error.message };
    }
  }
};

module.exports = barangModel;