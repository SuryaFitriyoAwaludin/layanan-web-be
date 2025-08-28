const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

// Middleware untuk verifikasi token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak ditemukan'
    });
  }
  
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token tidak valid',
      error: error.message
    });
  }
};

// Middleware untuk verifikasi role admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Anda tidak memiliki hak akses admin'
    });
  }
};

module.exports = { verifyToken, isAdmin };