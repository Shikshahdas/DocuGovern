const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.use(restrictTo('Admin'));

router.get('/', userController.renderUsers);
router.post('/:id/role', userController.updateRole);
router.post('/:id/toggle-status', userController.toggleStatus);

module.exports = router;
