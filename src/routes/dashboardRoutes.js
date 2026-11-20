const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/', (req, res) => res.redirect('/dashboard'));
router.get('/dashboard', protect, dashboardController.renderDashboard);

module.exports = router;
