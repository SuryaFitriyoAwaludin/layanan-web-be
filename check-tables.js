const { db } = require('./config/database');

async function checkTables() {
  try {
    console.log('Checking transaksi_masuk table structure:');
    const [masukStructure] = await db.query('DESCRIBE transaksi_masuk');
    masukStructure.forEach(col => {
      console.log(`${col.Field} (${col.Type})`);
    });
    
    console.log('\nChecking transaksi_keluar table structure:');
    const [keluarStructure] = await db.query('DESCRIBE transaksi_keluar');
    keluarStructure.forEach(col => {
      console.log(`${col.Field} (${col.Type})`);
    });
    
    // Check if any data exists
    const [masukData] = await db.query('SELECT * FROM transaksi_masuk LIMIT 1');
    console.log('\nSample data from transaksi_masuk:');
    if (masukData.length > 0) {
      console.log(JSON.stringify(masukData[0], null, 2));
    } else {
      console.log('No data found');
    }
    
    const [keluarData] = await db.query('SELECT * FROM transaksi_keluar LIMIT 1');
    console.log('\nSample data from transaksi_keluar:');
    if (keluarData.length > 0) {
      console.log(JSON.stringify(keluarData[0], null, 2));
    } else {
      console.log('No data found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkTables();