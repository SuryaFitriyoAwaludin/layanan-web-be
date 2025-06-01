const { db } = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class UserModel {
  // Mendapatkan user berdasarkan username
  static async findByUsername(username) {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  // Mendapatkan user berdasarkan ID
  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id_user = ?', [id]);
    return rows[0];
  }

  // Membuat user baru
  static async create(userData) {
    const { username, password, nama_user, role, email } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const [result] = await db.query(
      'INSERT INTO users (username, password, nama_user, role, email) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, nama_user, role || 'user', email]
    );
    
    return result;
  }

  // Verifikasi password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update password user
  static async updatePassword(username, newPassword) {
    // Hash password baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const [result] = await db.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE username = ?',
      [hashedPassword, username]
    );
    
    return result;
  }

  // Membuat token reset password
  static async createPasswordResetToken(username) {
    // Generate token acak
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token untuk disimpan di database
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Tetapkan waktu kedaluwarsa token (1 jam dari sekarang)
    const tokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    
    // Simpan token dan waktu kedaluwarsa di database
    const [result] = await db.query(
      'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE username = ?',
      [hashedToken, tokenExpires, username]
    );
    
    return resetToken; // Mengembalikan token yang belum di-hash untuk dikirim melalui email
  }

  // Verifikasi token reset password
  static async verifyPasswordResetToken(token) {
    // Hash token yang diterima untuk dibandingkan dengan yang ada di database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Cari user dengan token yang cocok dan belum kedaluwarsa
    const [rows] = await db.query(
      'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > ?',
      [hashedToken, new Date()]
    );
    
    return rows[0];
  }

  // Reset token setelah password diubah
  static async resetPasswordToken(username) {
    const [result] = await db.query(
      'UPDATE users SET reset_password_token = NULL, reset_password_expires = NULL WHERE username = ?',
      [username]
    );
    
    return result;
  }

  // Update email user
  static async updateEmail(username, email) {
    const [result] = await db.query(
      'UPDATE users SET email = ?, updated_at = NOW() WHERE username = ?',
      [email, username]
    );
    
    return result;
  }

  // Mendapatkan user berdasarkan email
  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }
}

module.exports = UserModel;