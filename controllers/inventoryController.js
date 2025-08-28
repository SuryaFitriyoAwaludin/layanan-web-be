const inventoryModel = require('../models/inventoryModel');

const inventoryController = {
  // Mendapatkan semua data inventory
  getAll: async (req, res) => {
    try {
      const result = await inventoryModel.getAll();
      
      if (!result.success) {
        return res.status(500).json({ 
          success: false, 
          message: 'Gagal mendapatkan data inventory', 
          error: result.error 
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Berhasil mendapatkan data inventory', 
        data: result.data 
      });
    } catch (error) {
      console.error('Error in getAll controller:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server', 
        error: error.message 
      });
    }
  },
  
  // Mendapatkan inventory berdasarkan ID
  getById: async (req, res) => {
    try {
      const id = req.params.id;
      const result = await inventoryModel.getById(id);
      
      if (!result.success) {
        return res.status(404).json({ 
          success: false, 
          message: result.error 
        });
      }
      
      res.json({ 
        success: true, 
        message: `Berhasil mendapatkan data inventory dengan ID: ${id}`, 
        data: result.data 
      });
    } catch (error) {
      console.error('Error in getById controller:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server', 
        error: error.message 
      });
    }
  },
  
  // Membuat inventory baru (barang masuk/keluar)
  create: async (req, res) => {
    try {
      const inventoryData = req.body;
      
      // Validasi data
      if (!inventoryData.id_barang || !inventoryData.jumlah || !inventoryData.jenis) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID barang, jumlah, dan jenis (masuk/keluar) harus diisi' 
        });
      }
      
      // Validasi jenis
      if (inventoryData.jenis !== 'masuk' && inventoryData.jenis !== 'keluar') {
        return res.status(400).json({ 
          success: false, 
          message: 'Jenis harus berupa "masuk" atau "keluar"' 
        });
      }
      
      const result = await inventoryModel.create(inventoryData);
      
      if (!result.success) {
        return res.status(500).json({ 
          success: false, 
          message: 'Gagal menambahkan inventory', 
          error: result.error 
        });
      }
      
      res.status(201).json({ 
        success: true, 
        message: result.message, 
        data: { id: result.id, ...inventoryData } 
      });
    } catch (error) {
      console.error('Error in create controller:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server', 
        error: error.message 
      });
    }
  },
  
  // Mendapatkan riwayat inventory berdasarkan ID barang
  getByBarangId: async (req, res) => {
    try {
      const id_barang = req.params.id_barang;
      const result = await inventoryModel.getByBarangId(id_barang);
      
      if (!result.success) {
        return res.status(500).json({ 
          success: false, 
          message: 'Gagal mendapatkan data inventory', 
          error: result.error 
        });
      }
      
      res.json({ 
        success: true, 
        message: `Berhasil mendapatkan riwayat inventory untuk barang ID: ${id_barang}`, 
        data: result.data 
      });
    } catch (error) {
      console.error('Error in getByBarangId controller:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server', 
        error: error.message 
      });
    }
  }
};

module.exports = inventoryController;