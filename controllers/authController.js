const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const jwtConfig = require('../config/jwt');

class AuthController {
  // Register user baru
  static async register(req, res) {
    try {
      const { username, password, nama_user, role } = req.body;
      
      // Validasi data
      if (!username || !password || !nama_user) {
        return res.status(400).json({
          success: false,
          message: 'Username, password, dan nama user harus diisi'
        });
      }
      
      // Cek apakah username sudah ada
      const existingUser = await UserModel.findByUsername(username);
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username sudah digunakan'
        });
      }
      
      // Buat user baru
      const result = await UserModel.create({
        username,
        password,
        nama_user,
        role
      });
      
      res.status(201).json({
        success: true,
        message: 'User berhasil didaftarkan',
        data: {
          id_user: result.insertId,
          username,
          nama_user,
          role
        }
      });
    } catch (error) {
      console.error('Error registering user:', error.message);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      // Validasi data
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username dan password harus diisi'
        });
      }
      
      // Cek apakah user ada
      const user = await UserModel.findByUsername(username);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Username atau password salah'
        });
      }
      
      // Verifikasi password
      const isPasswordValid = await UserModel.verifyPassword(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Username atau password salah'
        });
      }
      
      // Generate token
      const token = jwt.sign(
        { id: user.id_user, username: user.username, role: user.role },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );
      
      res.json({
        success: true,
        message: 'Login berhasil',
        data: {
          token,
          user: {
            id_user: user.id_user,
            username: user.username,
            nama_user: user.nama_user,
            role: user.role
          }
        }
      });
    } catch (error) {
      console.error('Error logging in:', error.message);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // Get user profile
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }
      
      res.json({
        success: true,
        message: 'Berhasil mendapatkan profil user',
        data: {
          id_user: user.id_user,
          username: user.username,
          nama_user: user.nama_user,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error getting user profile:', error.message);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }
}

module.exports = AuthController;