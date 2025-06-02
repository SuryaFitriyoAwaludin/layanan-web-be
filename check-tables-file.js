const { db } = require('./config/database');
const fs = require('fs');

async function checkTables() {
  let output = '';
  
  try {
    output += 'Checking transaksi_masuk table structure:\n';
    const [masukStructure] = await db.query('DESCRIBE transaksi_masuk');
    masukStructure.forEach(col => {
      output += `${col.Field} (${col.Type})\n`;
    });
    
    output += '\nChecking transaksi_keluar table structure:\n';
    const [keluarStructure] = await db.query('DESCRIBE transaksi_keluar');
    keluarStructure.forEach(col => {
      output += `${col.Field} (${col.Type})\n`;
    });
    
    // Check if any data exists
    const [masukData] = await db.query('SELECT * FROM transaksi_masuk LIMIT 1');
    output += '\nSample data from transaksi_masuk:\n';
    if (masukData.length > 0) {
      output += JSON.stringify(masukData[0], null, 2) + '\n';
    } else {
      output += 'No data found\n';
    }
    
    const [keluarData] = await db.query('SELECT * FROM transaksi_keluar LIMIT 1');
    output += '\nSample data from transaksi_keluar:\n';
    if (keluarData.length > 0) {
      output += JSON.stringify(keluarData[0], null, 2) + '\n';
    } else {
      output += 'No data found\n';
    }
    
    // Write to file
    fs.writeFileSync('table-output.txt', output);
    console.log('Output written to table-output.txt');
    
  } catch (error) {
    console.error('Error:', error);
    fs.writeFileSync('table-error.txt', error.toString());
  } finally {
    process.exit(0);
  }
}

checkTables();