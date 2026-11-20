const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const Approval = require('../models/Approval');
const { protect } = require('../middleware/auth');

router.use(protect);

// Quick search endpoint for autocomplete
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q || q.length < 2) {
      return res.json({ documents: [] });
    }

    const documents = await Document.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { documentNumber: { $regex: q, $options: 'i' } }
      ]
    })
      .select('title documentNumber currentVersion status')
      .limit(5);

    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Quick approval action from dashboard
router.post('/approvals/:id/quick-action', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, feedback } = req.body;

    const approval = await Approval.findById(id).populate('document');
    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval item not found.' });
    }

    const status = action === 'approve' ? 'Approved' : 'Rejected';
    approval.status = status;
    approval.feedback = feedback || (action === 'approve' ? 'Approved via Quick Action' : 'Rejected via Quick Action');
    approval.reviewedBy = req.user._id;
    approval.reviewedAt = new Date();
    await approval.save();

    if (approval.document) {
      const doc = await Document.findById(approval.document._id);
      if (doc) {
        doc.status = status;
        doc.approvalFeedback = approval.feedback;
        if (action === 'approve') doc.approvedAt = new Date();
        else doc.rejectedAt = new Date();
        await doc.save();
      }
    }

    res.json({ success: true, message: `Document ${status.toLowerCase()} successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
