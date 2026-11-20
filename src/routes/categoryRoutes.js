const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

router.get('/', categoryController.renderCategories);
router.post('/', restrictTo('Admin'), categoryController.createCategory);

module.exports = router;
