const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('jsonwebtoken');

const signToken = (id, role, name, email, isDemo = false) => {
  return jwt.sign(
    { id, role, name, email, demo: isDemo },
    process.env.JWT_SECRET || 'docugovern_enterprise_super_secret_key_2026_xyz!',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const sendTokenResponse = (user, statusCode, req, res, redirectUrl = '/') => {
  const token = signToken(user._id, user.role, user.name, user.email);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res.cookie('token', token, cookieOptions);

  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(statusCode).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      },
      redirectUrl
    });
  }

  res.redirect(redirectUrl);
};

exports.renderLogin = (req, res) => {
  if (res.locals.currentUser) {
    return res.redirect('/dashboard');
  }
  res.render('pages/auth/login', {
    title: 'Sign In - DocuGovern Enterprise',
    error: req.query.error || null,
    redirect: req.query.redirect || '/dashboard'
  });
};

exports.renderRegister = (req, res) => {
  if (res.locals.currentUser) {
    return res.redirect('/dashboard');
  }
  res.render('pages/auth/register', {
    title: 'Register Account - DocuGovern Enterprise',
    error: null
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).render('pages/auth/register', {
        title: 'Register Account - DocuGovern Enterprise',
        error: 'Please fill in all required fields.'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render('pages/auth/register', {
        title: 'Register Account - DocuGovern Enterprise',
        error: 'An account with this email address already exists.'
      });
    }

    // Default to 'Staff' unless first user (who becomes Admin) or explicitly configured
    const count = await User.countDocuments();
    const assignedRole = count === 0 ? 'Admin' : (role && ['Admin', 'Approver', 'Staff'].includes(role) ? role : 'Staff');

    const newUser = await User.create({
      name,
      email,
      password,
      department: department || 'Operations',
      role: assignedRole
    });

    await ActivityLog.create({
      user: newUser._id,
      action: 'USER_REGISTER',
      details: `User account created for ${newUser.name} with role ${newUser.role}.`
    });

    sendTokenResponse(newUser, 201, req, res, '/dashboard');
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).render('pages/auth/register', {
      title: 'Register Account - DocuGovern Enterprise',
      error: error.message || 'Server error during registration.'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const redirectUrl = req.body.redirect || '/dashboard';

    if (!email || !password) {
      return res.status(400).render('pages/auth/login', {
        title: 'Sign In - DocuGovern Enterprise',
        error: 'Please enter both email and password.',
        redirect: redirectUrl
      });
    }

    // Quick demo login bypass if user enters demo credentials
    if (email === 'demo@docugovern.com' && password === 'demo1234') {
      const demoUser = {
        _id: 'demo_user_admin_001',
        name: 'Sarah Jenkins (Chief Compliance Officer)',
        email: 'demo@docugovern.com',
        role: 'Admin',
        department: 'Governance & Legal'
      };
      const token = signToken(demoUser._id, demoUser.role, demoUser.name, demoUser.email, true);
      res.cookie('token', token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true
      });
      return res.redirect(redirectUrl);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).render('pages/auth/login', {
        title: 'Sign In - DocuGovern Enterprise',
        error: 'Invalid credentials. Please verify your email and password.',
        redirect: redirectUrl
      });
    }

    if (!user.isActive) {
      return res.status(403).render('pages/auth/login', {
        title: 'Sign In - DocuGovern Enterprise',
        error: 'Your account has been deactivated. Contact your system administrator.',
        redirect: redirectUrl
      });
    }

    await ActivityLog.create({
      user: user._id,
      action: 'USER_LOGIN',
      details: `${user.name} logged in.`
    });

    sendTokenResponse(user, 200, req, res, redirectUrl);
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).render('pages/auth/login', {
      title: 'Sign In - DocuGovern Enterprise',
      error: 'An internal error occurred during sign in.',
      redirect: '/dashboard'
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};
