const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const exampleRoutes = require('./routes/example');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', exampleRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});