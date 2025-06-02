const { db } = require('./config/database');

async function testTableColumns() {
  try {
    const [rows] = await db.query('DESCRIBE transaksi_masuk');
    console.log('Columns in transaksi_masuk:');
    rows.forEach(row => {
      console.log(`${row.Field} (${row.Type})`);
    });
  } catch (error) {
    console.error('Error describing table:', error);
  } finally {
    process.exit(0);
  }
}

testTableColumns();