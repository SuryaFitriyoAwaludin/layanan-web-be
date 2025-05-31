const { db } = require('../config/database');

const InventoryModel = {
  // Mendapatkan semua inventory
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT i.*, b.kode_barang, b.nama_barang, u.nama_user 
      FROM inventory i
      LEFT JOIN barang b ON i.id_barang = b.id_barang
      LEFT JOIN users u ON i.id_user = u.id_user
      ORDER BY i.id_inventory DESC
    `);
    return rows;
  },

  // Mendapatkan inventory berdasarkan ID barang
  getByBarangId: async (id_barang) => {
    const [rows] = await db.query(`
      SELECT i.*, b.kode_barang, b.nama_barang, u.nama_user 
      FROM inventory i
      LEFT JOIN barang b ON i.id_barang = b.id_barang
      LEFT JOIN users u ON i.id_user = u.id_user
      WHERE i.id_barang = ?
      ORDER BY i.tanggal DESC
    `, [id_barang]);
    return rows;
  },

  // Membuat inventory baru
  create: async (inventoryData) => {
    const { id_barang, jenis, jumlah, keterangan, id_user } = inventoryData;
    const [result] = await db.query(
      'INSERT INTO inventory (id_barang, jenis, jumlah, keterangan, id_user, tanggal) VALUES (?, ?, ?, ?, ?, NOW())',
      [id_barang, jenis, jumlah, keterangan || '', id_user || null]
    );
    return result;
  }
};

module.exports = InventoryModel;