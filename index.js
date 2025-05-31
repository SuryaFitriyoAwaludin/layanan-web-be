const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const { testConnection } = require('./config/database');

// Import routes
const exampleRoutes = require('./routes/example');
const barangRoutes = require('./routes/barang');
const inventoryRoutes = require('./routes/inventory');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
testConnection();

// Routes
app.use('/api/example', exampleRoutes);
app.use('/api/barang', barangRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Inventory API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});