const { db } = require('./config/database');

async function testTableStructure() {
  try {
    const [rows] = await db.query('DESCRIBE transaksi_keluar');
    console.log('Table structure of transaksi_keluar:');
    console.log(rows);
  } catch (error) {
    console.error('Error describing table:', error);
  } finally {
    process.exit(0);
  }
}

testTableStructure();