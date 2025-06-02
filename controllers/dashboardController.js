const DashboardModel = require('../models/dashboardModel');

class DashboardController {
  // Mendapatkan semua data dashboard
  static async getDashboardData(req, res) {
    try {
      const dashboardData = await DashboardModel.getDashboardData();
      
      res.json({ 
        success: true, 
        message: 'Berhasil mendapatkan data dashboard', 
        data: dashboardData 
      });
    } catch (error) {
      console.error('Error getting dashboard data:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server', 
        error: error.message 
      });
    }
  }

  // Mendapatkan data tinjauan penjualan
  static async getTinjauanPenjualan(req, res) {
    try {
      const data = await DashboardModel.getTinjauanPenjualan();
      
      res.json({ 
        success: true, 
        message: 'Berhasil mendapatkan data tinjauan penjualan', 
        data: data 
      });
    } catch (error) {
      console.error('Error getting tinjauan penjualan:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server', 
        error: error.message 
      });
    }
  }

  // Mendapatkan data tinjauan pembelian
  static async getTinjauanPembelian(req, res) {
    try {
      const data = await DashboardModel.getTinjauanPembelian();
      
      res.json({ 
        success: true, 
        message: 'Berhasil mendapatkan data tinjauan pembelian', 
        data: data 
      });
    } catch (error) {
      console.error('Error getting tinjauan pembelian:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server', 
        error: error.message 
      });
    }
  }

  // Mendapatkan data ringkasan inventaris
  static async getRingkasanInventaris(req, res) {
    try {
      const data = await DashboardModel.getRingkasanInventaris();
      
      res.json({ 
        success: true, 
        message: 'Berhasil mendapatkan data ringkasan inventaris', 
        data: data 
      });
    } catch (error) {
      console.error('Error getting ringkasan inventaris:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server', 
        error: error.message 
      });
    }
  }

  // Mendapatkan data ringkasan produk
  static async getRingkasanProduk(req, res) {
    try {
      const data = await DashboardModel.getRingkasanProduk();
      
      res.json({ 
        success: true, 
        message: 'Berhasil mendapatkan data ringkasan produk', 
        data: data 
      });
    } catch (error) {
      console.error('Error getting ringkasan produk:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server', 
        error: error.message 
      });
    }
  }

  // Mendapatkan data ringkasan pesanan
  static async getRingkasanPesanan(req, res) {
    try {
      const data = await DashboardModel.getRingkasanPesanan();
      
      res.json({ 
        success: true, 
        message: 'Berhasil mendapatkan data ringkasan pesanan', 
        data: data 
      });
    } catch (error) {
      console.error('Error getting ringkasan pesanan:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server', 
        error: error.message 
      });
    }
  }

  // Mendapatkan data penjualan dan pembelian
  static async getPenjualanPembelian(req, res) {
    try {
      const data = await DashboardModel.getPenjualanPembelian();
      
      res.json({ 
        success: true, 
        message: 'Berhasil mendapatkan data penjualan dan pembelian', 
        data: data 
      });
    } catch (error) {
      console.error('Error getting penjualan pembelian:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server', 
        error: error.message 
      });
    }
  }

  // Mendapatkan data stok terlaris
  static async getStokTerlaris(req, res) {
    try {
      const data = await DashboardModel.getStokTerlaris();
      
      res.json({ 
        success: true, 
        message: 'Berhasil mendapatkan data stok terlaris', 
        data: data 
      });
    } catch (error) {
      console.error('Error getting stok terlaris:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server', 
        error: error.message 
      });
    }
  }

  // Mendapatkan data stok menipis
  static async getStokMenipis(req, res) {
    try {
      const data = await DashboardModel.getStokMenipis();
      
      res.json({ 
        success: true, 
        message: 'Berhasil mendapatkan data stok menipis', 
        data: data 
      });
    } catch (error) {
      console.error('Error getting stok menipis:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server', 
        error: error.message 
      });
    }
  }
}

module.exports = DashboardController;