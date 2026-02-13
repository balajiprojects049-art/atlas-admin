const express = require('express');
const cors = require('cors');
const path = require('path');
const prisma = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection handling for Serverless
let dbConnected = false;

const connectDatabase = async () => {
    if (dbConnected) return;

    try {
        await prisma.$connect();
        dbConnected = true;
        console.log('✅ Connected to Database');
    } catch (err) {
        console.error('❌ Database Connection Error:', err.message);
    }
};

// Connect on request (middleware) works better for serverless cold starts
app.use(async (req, res, next) => {
    await connectDatabase();
    next();
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/members', require('./routes/member.routes'));
app.use('/api/invoices', require('./routes/invoice.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/plans', require('./routes/plan.routes'));
app.use('/api/cafeteria', require('./routes/cafeteria.routes')); // Cafeteria routes
app.use('/api/test', require('./routes/test.routes')); // Added test route


// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Gym Billing API running',
        database: dbConnected ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('🔥 Server Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

module.exports = app;
