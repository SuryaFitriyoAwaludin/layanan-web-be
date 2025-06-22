const { db } = require('./config/database');

async function checkSupplierTable() {
  try {
    console.log('Checking supplier table structure...');
    
    // Check if table exists
    const [tables] = await db.query("SHOW TABLES LIKE 'supplier'");
    if (tables.length === 0) {
      console.log('ERROR: Table supplier does not exist!');
      return;
    }
    
    // Describe table structure
    const [columns] = await db.query('DESCRIBE supplier');
    console.log('\nSupplier table structure:');
    console.table(columns);
    
    // Check for specific columns
    const columnNames = columns.map(col => col.Field);
    console.log('\nColumn names:', columnNames);
    
    const requiredColumns = ['id_supplier', 'nama_supplier', 'telepon', 'alamat', 'email', 'kontak_person'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('\nMISSING COLUMNS:', missingColumns);
    } else {
      console.log('\nAll required columns are present!');
    }
    
    // Check if old 'kontak' column still exists
    if (columnNames.includes('kontak')) {
      console.log('\nWARNING: Old "kontak" column still exists!');
    }
    
  } catch (error) {
    console.error('Error checking supplier table:', error.message);
  } finally {
    process.exit(0);
  }
}

checkSupplierTable();