const { db } = require('../config/database');

class BarangModel {
  // Mendapatkan semua barang
  static async findAll() {
    const [rows] = await db.query(`
      SELECT b.*, k.nama_kategori, l.nama_lokasi 
      FROM barang b
      LEFT JOIN kategori k ON b.id_kategori = k.id_kategori
      LEFT JOIN lokasi l ON b.id_lokasi = l.id_lokasi
      ORDER BY b.id_barang DESC
    `);
    return rows;
  }

  // Mendapatkan barang berdasarkan ID
  static async findById(id) {
    const [rows] = await db.query(`
      SELECT b.*, k.nama_kategori, l.nama_lokasi 
      FROM barang b
      LEFT JOIN kategori k ON b.id_kategori = k.id_kategori
      LEFT JOIN lokasi l ON b.id_lokasi = l.id_lokasi
      WHERE b.id_barang = ?
    `, [id]);
    return rows[0];
  }

  // Cek apakah kode barang sudah ada
  static async findByKode(kode) {
    const [rows] = await db.query('SELECT * FROM barang WHERE kode_barang = ?', [kode]);
    return rows[0];
  }

  // Membuat barang baru
  static async create(barangData) {
    const { kode_barang, nama_barang, id_kategori, id_lokasi, stok, satuan, keterangan } = barangData;
    
    const [result] = await db.query(
      'INSERT INTO barang (kode_barang, nama_barang, id_kategori, id_lokasi, stok, satuan, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [kode_barang, nama_barang, id_kategori || null, id_lokasi || null, stok || 0, satuan || '', keterangan || '']
    );
    
    return result;
  }

  // Mengupdate barang
  static async update(id, barangData) {
    const { kode_barang, nama_barang, id_kategori, id_lokasi, stok, satuan, keterangan } = barangData;
    
    const [result] = await db.query(
      'UPDATE barang SET kode_barang = ?, nama_barang = ?, id_kategori = ?, id_lokasi = ?, stok = ?, satuan = ?, keterangan = ? WHERE id_barang = ?',
      [kode_barang, nama_barang, id_kategori || null, id_lokasi || null, stok || 0, satuan || '', keterangan || '', id]
    );
    
    return result;
  }

  // Menghapus barang
  static async delete(id) {
    const [result] = await db.query('DELETE FROM barang WHERE id_barang = ?', [id]);
    return result;
  }
}

module.exports = BarangModel;