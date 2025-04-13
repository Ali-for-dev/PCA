// backend/app.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorMiddleware = require('./middlewares/error');

const app = express();

// CORS configuration - this should come first
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Import all routes
const auth = require('./routes/auth.routes');
const products = require('./routes/product.routes');
const orders = require('./routes/order.routes');
const users = require('./routes/user.routes');

// Mount routes
app.use('/api/v1/auth', auth);
app.use('/api/v1', products);
app.use('/api/v1', orders);
app.use('/uploads', express.static('uploads'));

// Error Middleware
app.use(errorMiddleware);

module.exports = app;