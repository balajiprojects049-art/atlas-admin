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

// Test database connection
prisma.$connect()
    .then(() => console.log('✅ Neon DB (PostgreSQL) Connected Successfully'))
    .catch((err) => console.error('❌ Database Connection Error:', err));

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
    res.json({ status: 'OK', message: 'Gym Billing API is running' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error',
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
