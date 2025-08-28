const mysql = require('mysql2');
require('dotenv').config();

// Konfigurasi database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'inventory_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Menggunakan promise wrapper untuk async/await
const db = pool.promise();

module.exports = { db };