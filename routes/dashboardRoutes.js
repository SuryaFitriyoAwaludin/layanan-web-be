const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/authMiddleware');

// Mendapatkan semua data dashboard
router.get('/', verifyToken, DashboardController.getDashboardData);

// Mendapatkan data tinjauan penjualan
router.get('/tinjauan-penjualan', verifyToken, DashboardController.getTinjauanPenjualan);

// Mendapatkan data tinjauan pembelian
router.get('/tinjauan-pembelian', verifyToken, DashboardController.getTinjauanPembelian);

// Mendapatkan data ringkasan inventaris
router.get('/ringkasan-inventaris', verifyToken, DashboardController.getRingkasanInventaris);

// Mendapatkan data ringkasan produk
router.get('/ringkasan-produk', verifyToken, DashboardController.getRingkasanProduk);

// Mendapatkan data ringkasan pesanan
router.get('/ringkasan-pesanan', verifyToken, DashboardController.getRingkasanPesanan);

// Mendapatkan data penjualan dan pembelian
router.get('/penjualan-pembelian', verifyToken, DashboardController.getPenjualanPembelian);

// Mendapatkan data stok terlaris
router.get('/stok-terlaris', verifyToken, DashboardController.getStokTerlaris);

// Mendapatkan data stok menipis
router.get('/stok-menipis', verifyToken, DashboardController.getStokMenipis);

module.exports = router;