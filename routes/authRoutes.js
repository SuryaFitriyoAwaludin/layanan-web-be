const express = require('express');
const AuthController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Route untuk register
router.post('/register', AuthController.register);

// Route untuk login
router.post('/login', AuthController.login);

// Route untuk mendapatkan profil user (protected route)
router.get('/profile', verifyToken, AuthController.getProfile);

module.exports = router;