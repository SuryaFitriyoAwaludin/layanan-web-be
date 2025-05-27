const BarangModel = require('../models/barangModel');

class BarangController {
  // Mendapatkan semua data barang
  static async getAllBarang(req, res) {
    try {
      const rows = await BarangModel.findAll();
      
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
  }

  // Mendapatkan barang berdasarkan ID
  static async getBarangById(req, res) {
    try {
      const id = req.params.id;
      const barang = await BarangModel.findById(id);
      
      if (!barang) {
        return res.status(404).json({ 
          success: false, 
          message: 'Barang tidak ditemukan' 
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Berhasil mendapatkan data barang', 
        data: barang 
      });
    } catch (error) {
      console.error(`Error getting barang with id ${req.params.id}:`, error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server', 
        error: error.message 
      });
    }
  }

  // Membuat barang baru
  static async createBarang(req, res) {
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
      const existingBarang = await BarangModel.findByKode(kode_barang);
      
      if (existingBarang) {
        return res.status(400).json({
          success: false,
          message: 'Kode barang sudah digunakan'
        });
      }
      
      // Insert data barang baru
      const result = await BarangModel.create({
        kode_barang, 
        nama_barang, 
        id_kategori, 
        id_lokasi, 
        stok, 
        satuan, 
        keterangan
      });
      
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
  }

  // Mengupdate barang
  static async updateBarang(req, res) {
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
      const existingBarang = await BarangModel.findById(id);
      
      if (!existingBarang) {
        return res.status(404).json({
          success: false,
          message: 'Barang tidak ditemukan'
        });
      }
      
      // Cek apakah kode barang sudah digunakan oleh barang lain
      if (kode_barang !== existingBarang.kode_barang) {
        const barangWithSameKode = await BarangModel.findByKode(kode_barang);
        
        if (barangWithSameKode) {
          return res.status(400).json({
            success: false,
            message: 'Kode barang sudah digunakan oleh barang lain'
          });
        }
      }
      
      // Update data barang
      const result = await BarangModel.update(id, {
        kode_barang, 
        nama_barang, 
        id_kategori, 
        id_lokasi, 
        stok, 
        satuan, 
        keterangan
      });
      
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
          id_barang: id,
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
      console.error(`Error updating barang with id ${req.params.id}:`, error.message);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // Menghapus barang
  static async deleteBarang(req, res) {
    try {
      const id = req.params.id;
      
      // Cek apakah barang ada
      const existingBarang = await BarangModel.findById(id);
      
      if (!existingBarang) {
        return res.status(404).json({
          success: false,
          message: 'Barang tidak ditemukan'
        });
      }
      
      // Hapus barang
      const result = await BarangModel.delete(id);
      
      if (result.affectedRows === 0) {
        return res.status(500).json({
          success: false,
          message: 'Gagal menghapus barang'
        });
      }
      
      res.json({
        success: true,
        message: 'Barang berhasil dihapus'
      });
    } catch (error) {
      console.error(`Error deleting barang with id ${req.params.id}:`, error.message);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }
}

module.exports = BarangController;