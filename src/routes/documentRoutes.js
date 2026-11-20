const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/', documentController.renderDocuments);
router.get('/upload', documentController.renderUpload);
router.post('/upload', upload.single('file'), documentController.uploadDocument);
router.get('/:id', documentController.renderDetail);
router.post('/:id/new-version', upload.single('file'), documentController.uploadNewVersion);
router.post('/:id/submit-approval', documentController.submitForApproval);

module.exports = router;
