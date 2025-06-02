const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'inventory_db'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL successfully');
    // Check if the inventory_db database exists
    connection.query('SHOW TABLES', (err, results) => {
      if (err) {
        console.error('Error querying tables:', err);
      } else {
        console.log('Tables in inventory_db:');
        console.log(results);
      }
      connection.end();
    });
  }
});