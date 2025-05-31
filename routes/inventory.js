const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Routes untuk inventory
router.get('/', inventoryController.getAll);
router.get('/:id', inventoryController.getById);
router.post('/', inventoryController.create);
router.get('/barang/:id_barang', inventoryController.getByBarangId);

module.exports = router;