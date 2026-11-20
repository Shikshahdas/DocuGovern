const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate JWT from cookie or authorization header
exports.protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(401).json({ success: false, message: 'Not authorized. Token missing.' });
      }
      return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'docugovern_enterprise_super_secret_key_2026_xyz!');
    
    // Check if user still exists
    let user;
    try {
      user = await User.findById(decoded.id);
    } catch (dbErr) {
      // In case DB is not yet populated or in preview mode
      user = null;
    }

    if (!user) {
      // Fallback for mock/test demo user if offline
      if (decoded.demo) {
        user = {
          _id: decoded.id,
          name: decoded.name || 'Enterprise Admin',
          email: decoded.email || 'admin@docugovern.com',
          role: decoded.role || 'Admin',
          department: 'Executive Governance'
        };
      } else {
        res.clearCookie('token');
        if (req.originalUrl.startsWith('/api')) {
          return res.status(401).json({ success: false, message: 'User belonging to token no longer exists.' });
        }
        return res.redirect('/login');
      }
    }

    req.user = user;
    res.locals.currentUser = user;
    next();
  } catch (error) {
    res.clearCookie('token');
    if (req.originalUrl.startsWith('/api')) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
    }
    return res.redirect('/login?error=session_expired');
  }
};

// Check permissions / roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to perform this action.'
        });
      }
      return res.status(403).render('pages/error', {
        title: 'Access Denied',
        statusCode: 403,
        message: 'You do not have sufficient permissions to view this resource.'
      });
    }
    next();
  };
};

// Optional auth for public pages to display user status if logged in
exports.checkUser = async (req, res, next) => {
  let token = req.cookies?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'docugovern_enterprise_super_secret_key_2026_xyz!');
      const user = await User.findById(decoded.id);
      res.locals.currentUser = user || null;
    } catch (e) {
      res.locals.currentUser = null;
    }
  } else {
    res.locals.currentUser = null;
  }
  next();
};
