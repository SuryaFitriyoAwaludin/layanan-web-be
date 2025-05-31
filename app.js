// Import modul HTTP dari Node.js
const http = require('http');

// Konfigurasi server
const hostname = '127.0.0.1';
const port = 3000;

// Buat server HTTP
const server = http.createServer((req, res) => {
  // Set header respons
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  
  // Kirim respons "Hello World"
  res.end('Hello World\n');
});

// Jalankan server
server.listen(port, hostname, () => {
  console.log(`Server berjalan di http://${hostname}:${port}/`);
});