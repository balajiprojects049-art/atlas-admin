const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const prisma = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection with proper error handling
let dbConnected = false;

const connectDatabase = async () => {
    if (dbConnected) {
        console.log('✅ Database already connected');
        return;
    }

    try {
        await prisma.$connect();
        dbConnected = true;
        console.log('✅ Neon DB (PostgreSQL) Connected Successfully');
        console.log('📊 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Missing');
    } catch (err) {
        console.error('❌ Database Connection Error:', err.message);
        console.error('Full error:', err);
        // Don't throw - let the app start but log the error
    }
};

// Connect to database
connectDatabase();

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/members', require('./routes/member.routes'));
app.use('/api/invoices', require('./routes/invoice.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/plans', require('./routes/plan.routes'));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Gym Billing API is running',
        database: dbConnected ? 'Connected' : 'Disconnected',
        environment: process.env.NODE_ENV || 'development'
    });
});

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`
    });
});

// Error Handler - MUST be last
app.use((err, req, res, next) => {
    console.error('❌ Global Error Handler:');
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('Request:', {
        method: req.method,
        url: req.url,
        body: req.body
    });

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 5000;

// Only start server if not running on Vercel (serverless)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const initCronJobs = require('./cron');

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        initCronJobs(); // Initialize scheduled tasks
    });
}

module.exports = app;
