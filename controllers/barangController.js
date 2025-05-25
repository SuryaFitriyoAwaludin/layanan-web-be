const barangModel = require('../models/barangModel');

const barangController = {
  // Mendapatkan semua data barang
  getAll: async (req, res) => {
    try {
      const result = await barangModel.getAll();
      
      if (!result.success) {
        return res.status(500).json({ 
          success: false, 
          message: 'Gagal mendapatkan data barang', 
          error: result.error 
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Berhasil mendapatkan data barang', 
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
  
  // Mendapatkan barang berdasarkan ID
  getById: async (req, res) => {
    try {
      const id = req.params.id;
      const result = await barangModel.getById(id);
      
      if (!result.success) {
        return res.status(404).json({ 
          success: false, 
          message: result.error 
        });
      }
      
      res.json({ 
        success: true, 
        message: `Berhasil mendapatkan data barang dengan ID: ${id}`, 
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
  
  // Membuat barang baru
  create: async (req, res) => {
    try {
      const barangData = req.body;
      
      // Validasi data
      if (!barangData.kode_barang || !barangData.nama_barang) {
        return res.status(400).json({ 
          success: false, 
          message: 'Kode barang dan nama barang harus diisi' 
        });
      }
      
      const result = await barangModel.create(barangData);
      
      if (!result.success) {
        return res.status(500).json({ 
          success: false, 
          message: 'Gagal menambahkan barang', 
          error: result.error 
        });
      }
      
      res.status(201).json({ 
        success: true, 
        message: result.message, 
        data: { id: result.id, ...barangData } 
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
  
  // Mengupdate barang
  update: async (req, res) => {
    try {
      const id = req.params.id;
      const barangData = req.body;
      
      // Validasi data
      if (!barangData.kode_barang || !barangData.nama_barang) {
        return res.status(400).json({ 
          success: false, 
          message: 'Kode barang dan nama barang harus diisi' 
        });
      }
      
      const result = await barangModel.update(id, barangData);
      
      if (!result.success) {
        return res.status(404).json({ 
          success: false, 
          message: result.error 
        });
      }
      
      res.json({ 
        success: true, 
        message: result.message, 
        data: { id, ...barangData } 
      });
    } catch (error) {
      console.error('Error in update controller:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server', 
        error: error.message 
      });
    }
  },
  
  // Menghapus barang
  delete: async (req, res) => {
    try {
      const id = req.params.id;
      const result = await barangModel.delete(id);
      
      if (!result.success) {
        return res.status(404).json({ 
          success: false, 
          message: result.error 
        });
      }
      
      res.json({ 
        success: true, 
        message: result.message 
      });
    } catch (error) {
      console.error('Error in delete controller:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server', 
        error: error.message 
      });
    }
  }
};

module.exports = barangController;