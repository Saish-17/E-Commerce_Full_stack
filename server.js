require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database
initializeDatabase()
    .then(() => {
        console.log('Database initialized successfully.');
    })
    .catch((err) => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// Fallback for SPA or undefined routes
app.get('*', (req, res, next) => {
    // If it starts with /api, pass it to api handlers (will return 404 since it wasn't matched)
    if (req.path.startsWith('/api')) {
        return next();
    }
    // Otherwise, redirect to index.html
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API 404 Handler
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API Endpoint not found.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error.' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
    console.log(`Access the store locally: http://localhost:${PORT}`);
});
