const mysql = require('mysql2/promise');
require('dotenv').config();

async function addStokMinimumColumn() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'inventory_db'
    });
    
    console.log('Connected to database');
    
    // Check if stok_minimum column already exists
    const [columns] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'barang' AND COLUMN_NAME = 'stok_minimum'",
      [process.env.DB_NAME || 'inventory_db']
    );
    
    if (columns.length > 0) {
      console.log('Column stok_minimum already exists');
      return;
    }
    
    // Add stok_minimum column
    await connection.query(
      'ALTER TABLE barang ADD COLUMN stok_minimum INT DEFAULT 0 AFTER stok'
    );
    
    console.log('Successfully added stok_minimum column to barang table');
    
    // Update existing records with default stok_minimum values
    await connection.query(
      'UPDATE barang SET stok_minimum = 5 WHERE stok_minimum IS NULL OR stok_minimum = 0'
    );
    
    console.log('Updated existing records with default stok_minimum values');
    
  } catch (error) {
    console.error('Error adding stok_minimum column:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

addStokMinimumColumn();