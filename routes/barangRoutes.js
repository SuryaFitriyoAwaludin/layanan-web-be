const express = require('express');
const BarangController = require('../controllers/barangController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Route untuk mendapatkan semua data barang (semua user bisa akses)
router.get('/', verifyToken, BarangController.getAllBarang);

// Route untuk mendapatkan barang berdasarkan ID (semua user bisa akses)
router.get('/:id', verifyToken, BarangController.getBarangById);

// Route untuk membuat barang baru (hanya admin)
router.post('/', verifyToken, isAdmin, BarangController.createBarang);

// Route untuk mengupdate barang (hanya admin)
router.put('/:id', verifyToken, isAdmin, BarangController.updateBarang);

// Route untuk menghapus barang (hanya admin)
router.delete('/:id', verifyToken, isAdmin, BarangController.deleteBarang);

module.exports = router;