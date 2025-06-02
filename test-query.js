const { db } = require('./config/database');

async function test() {
  try {
    const [rows] = await db.query('SELECT * FROM transaksi_keluar LIMIT 1');
    console.log('Query result:', rows);
  } catch (error) {
    console.error('Error executing query:', error);
  } finally {
    process.exit(0);
  }
}

test();