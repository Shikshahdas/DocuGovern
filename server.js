require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');

const connectDB = require('./src/config/db');
const { checkUser } = require('./src/middleware/auth');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Setup view engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// Core Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global View Helpers & Context
app.use(checkUser);
app.use((req, res, next) => {
  res.locals.appName = 'DocuGovern';
  res.locals.appTagline = 'Enterprise Document Management & Governance Approval System';
  res.locals.currentPath = req.path;
  
  // Helper for formatting file sizes
  res.locals.formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Helper for date formatting
  res.locals.formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper for relative time (e.g. 5m ago, 2h ago)
  res.locals.timeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    return 'Just now';
  };

  next();
});

// App Routes
app.use('/', require('./src/routes/authRoutes'));
app.use('/', require('./src/routes/dashboardRoutes'));
app.use('/documents', require('./src/routes/documentRoutes'));
app.use('/approvals', require('./src/routes/approvalRoutes'));
app.use('/categories', require('./src/routes/categoryRoutes'));
app.use('/users', require('./src/routes/userRoutes'));
app.use('/api', require('./src/routes/apiRoutes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).render('pages/error', {
    title: '404 - Page Not Found',
    statusCode: 404,
    message: 'The requested governance resource or document could not be located.'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Exception:', err);
  res.status(err.status || 500).render('pages/error', {
    title: '500 - Server Error',
    statusCode: err.status || 500,
    message: err.message || 'An unexpected operational error occurred.'
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` DocuGovern Enterprise System Active`);
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
});
