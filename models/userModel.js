const { db } = require('../config/database');
const bcrypt = require('bcrypt');

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
    const { username, password, nama_user, role } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const [result] = await db.query(
      'INSERT INTO users (username, password, nama_user, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, nama_user, role || 'user']
    );
    
    return result;
  }

  // Verifikasi password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = UserModel;