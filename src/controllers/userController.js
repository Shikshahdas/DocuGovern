const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

exports.renderUsers = async (req, res) => {
  try {
    let users = [];
    try {
      users = await User.find().sort({ createdAt: -1 });
    } catch (e) {
      console.warn('User fetch error:', e.message);
    }

    res.render('pages/users/index', {
      title: 'User Management & Roles - DocuGovern',
      activeMenu: 'users',
      users
    });
  } catch (error) {
    res.status(500).render('pages/error', {
      title: 'Users Error',
      statusCode: 500,
      message: error.message
    });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['Admin', 'Approver', 'Staff'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'USER_ROLE_CHANGE',
      details: `Changed role of user ${user.name} from ${oldRole} to ${role}.`
    });

    res.redirect('/users');
  } catch (error) {
    res.status(500).render('pages/error', {
      title: 'Role Update Error',
      statusCode: 500,
      message: error.message
    });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.redirect('/users');
  } catch (error) {
    res.status(500).render('pages/error', {
      title: 'Status Update Error',
      statusCode: 500,
      message: error.message
    });
  }
};
