const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

router.get('/', approvalController.renderApprovals);
router.post('/:id/process', restrictTo('Admin', 'Approver'), approvalController.processApproval);

module.exports = router;
