// Load environment variables from .env file
require('dotenv').config();

// Import dependencies
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

// Import custom modules
const connectDB = require('./config/dbConn');
const corsOptions = require('./config/corsOptions');

// Set the port (from environment or default to 5000)
const PORT = process.env.PORT || 5000;

// 1. Connect to MongoDB database
connectDB();

// 2. Middleware setup
app.use(cors(corsOptions));          // Enable CORS with options
app.use(cookieParser());             // Parse cookies from requests
app.use(express.json());             // Parse JSON request bodies

// 3. Serve static files from 'public' folder
app.use('/', express.static(path.join(__dirname, 'public')));

// 4. Define routes
app.use('/', require('./routes/root'));           // Root route
app.use('/auth', require('./routes/authRoutes')); // Authentication routes
app.use('/users', require('./routes/userRoutes'));// User-related routes

// 5. Handle undefined routes (404 errors)
app.all('*', (req, res) => {
  res.status(404);

  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html')); // Serve HTML page
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' }); // JSON response
  } else {
    res.type('txt').send('404 Not Found');  // Plain text response
  }
});

// 6. Listen for successful DB connection, then start server
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// 7. Log any MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
