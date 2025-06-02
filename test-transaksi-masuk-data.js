const { db } = require('./config/database');

async function testTableData() {
  try {
    // First, get the table structure
    const [structure] = await db.query('DESCRIBE transaksi_masuk');
    console.log('Columns in transaksi_masuk:');
    structure.forEach(row => {
      console.log(`${row.Field} (${row.Type})`);
    });
    
    // Then, get a sample of the data
    const [rows] = await db.query('SELECT * FROM transaksi_masuk LIMIT 1');
    console.log('\nSample data from transaksi_masuk:');
    if (rows.length > 0) {
      console.log(rows[0]);
    } else {
      console.log('No data found in the table');
    }
  } catch (error) {
    console.error('Error querying table:', error);
  } finally {
    process.exit(0);
  }
}

testTableData();