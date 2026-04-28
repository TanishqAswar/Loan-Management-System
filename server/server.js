require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const expressListEndpoints = require("express-list-endpoints");

const authRoutes = require('./src/routes/authRoutes');
const loanRoutes = require('./src/routes/loanRoutes');

const app = express();

// Middleware
app.use(morgan('dev'));

const allowedOrigins = process.env.CLIENT_URLS.split(",");

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'LMS Server is running', timestamp: new Date() });
});

// Basic Route
app.get('/', (req, res) => {
  res.json({
    message: 'Loan Management System API is running',
    status: 'OK',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const server = app.listen(PORT, () => {
      console.log(`🚀 LMS Server running on ${BACKEND_URL}:${PORT}`);
    });
    // Fix for Vite proxy ECONNRESET and ECONNREFUSED race conditions
    server.keepAliveTimeout = 120000; 
    server.headersTimeout = 120000;

    const endpoints = expressListEndpoints(app);
    console.log(endpoints);

    // Background job: Clean up incomplete loans (older than 24h) and their files
    setInterval(async () => {
      try {
        const fs = require('fs');
        const path = require('path');
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const incompleteLoans = await mongoose.model('Loan').find({
          'loanDetails.amount': { $exists: false },
          createdAt: { $lt: twentyFourHoursAgo }
        });
        
        for (const loan of incompleteLoans) {
          if (loan.documentUrl) {
            const filePath = path.join(__dirname, loan.documentUrl);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          }
          await loan.deleteOne();
        }
        if (incompleteLoans.length > 0) {
          console.log(`🧹 Cleaned up ${incompleteLoans.length} incomplete draft loans`);
        }
      } catch (err) {
        console.error('Cleanup job error:', err);
      }
    }, 60 * 60 * 1000); // Runs every 1 hour

  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
