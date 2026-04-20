const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

dotenv.config();

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // Stricter for auth endpoints
    message: { error: 'Too many authentication attempts, please try again later.' },
});

app.use(globalLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files (uploads) ───────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/quotations', require('./routes/quotationRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/provider', require('./routes/providerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api', require('./routes/supportRoutes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
});

app.get('/', (req, res) => {
    res.json({ message: 'Sahaay API is running!', version: '1.0.0' });
});

// ─── Error Handling ───────────────────────────────────────────────────────────
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
    const statusCode = err.statuscode || err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal server error';

    if (process.env.NODE_ENV !== 'production') {
        console.error('[Error]', err);
    }

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
});

// ─── Database & Server Start ──────────────────────────────────────────────────
mongoose
    .connect(process.env.DATABASE)
    .then(() => {
        console.log('[DB] MongoDB connected successfully');
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`[Server] Running on http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error('[DB] Connection failed:', err.message);
        process.exit(1);
    });

module.exports = app;
