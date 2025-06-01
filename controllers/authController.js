const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const jwtConfig = require('../config/jwt');
const { sendEmail } = require('../config/email');

class AuthController {
  // Register user baru
  static async register(req, res) {
    try {
      const { username, password, nama_user, role, email } = req.body;
      
      // Validasi data
      if (!username || !password || !nama_user) {
        return res.status(400).json({
          success: false,
          message: 'Username, password, dan nama user harus diisi'
        });
      }
      
      // Validasi email
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email harus diisi'
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
      
      // Cek apakah email sudah ada
      const existingEmail = await UserModel.findByEmail(email);
      
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah digunakan'
        });
      }
      
      // Buat user baru
      const result = await UserModel.create({
        username,
        password,
        nama_user,
        role,
        email
      });
      
      res.status(201).json({
        success: true,
        message: 'User berhasil didaftarkan',
        data: {
          id_user: result.insertId,
          username,
          nama_user,
          role,
          email
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

  // Lupa password
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      // Validasi data
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email harus diisi'
        });
      }
      
      // Cek apakah user dengan email tersebut ada
      const user = await UserModel.findByEmail(email);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User dengan email tersebut tidak ditemukan'
        });
      }
      
      // Generate token reset password
      const resetToken = await UserModel.createPasswordResetToken(user.username);
      
      // URL reset password (frontend)
      const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
      
      // Template email
      const emailHTML = `
        <h1>Reset Password</h1>
        <p>Anda menerima email ini karena Anda (atau seseorang) telah meminta reset password untuk akun Anda.</p>
        <p>Silakan klik tautan di bawah ini untuk melanjutkan proses reset password:</p>
        <a href="${resetURL}" target="_blank">Reset Password</a>
        <p>Jika Anda tidak meminta reset password, abaikan email ini dan password Anda akan tetap tidak berubah.</p>
        <p>Tautan ini hanya berlaku selama 1 jam.</p>
      `;
      
      // Kirim email
      await sendEmail(email, 'Inventory System', emailHTML);
      
      res.json({
        success: true,
        message: 'Permintaan reset kata sandi berhasil dikirim. Silakan periksa email Anda untuk instruksi selanjutnya.'
      });
    } catch (error) {
      console.error('Error resetting password:', error.message);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // Reset password dengan token
  static async resetPassword(req, res) {
    try {
      const { token, password, confirmPassword } = req.body;
      
      // Validasi data
      if (!token || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token, password baru, dan konfirmasi password harus diisi'
        });
      }
      
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Password dan konfirmasi password tidak cocok'
        });
      }
      
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password harus memiliki minimal 6 karakter'
        });
      }
      
      // Verifikasi token
      const user = await UserModel.verifyPasswordResetToken(token);
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Token tidak valid atau sudah kedaluwarsa'
        });
      }
      
      // Update password
      await UserModel.updatePassword(user.username, password);
      
      // Reset token
      await UserModel.resetPasswordToken(user.username);
      
      res.json({
        success: true,
        message: 'Password berhasil diubah. Silakan login dengan password baru Anda.'
      });
    } catch (error) {
      console.error('Error resetting password with token:', error.message);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }
}

module.exports = AuthController;