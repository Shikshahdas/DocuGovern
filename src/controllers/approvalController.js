const Approval = require('../models/Approval');
const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');

exports.renderApprovals = async (req, res) => {
  try {
    const { status = 'Pending', priority } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    let approvals = [];
    try {
      approvals = await Approval.find(query)
        .populate({
          path: 'document',
          populate: { path: 'category' }
        })
        .populate('submittedBy', 'name email department')
        .populate('assignedApprover', 'name email')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 });
    } catch (e) {
      console.warn('Approvals lookup:', e.message);
    }

    res.render('pages/approvals/index', {
      title: 'Approval Queue - DocuGovern',
      activeMenu: 'approvals',
      approvals,
      currentStatus: status,
      currentPriority: priority || 'all'
    });
  } catch (error) {
    console.error('Approvals list error:', error);
    res.status(500).render('pages/error', {
      title: 'Approvals Error',
      statusCode: 500,
      message: 'Failed to fetch approval queue.'
    });
  }
};

exports.processApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, feedback } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid approval action.' });
    }

    const approval = await Approval.findById(id).populate('document');
    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval request not found.' });
    }

    const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
    const docStatus = action === 'approve' ? 'Approved' : 'Rejected';

    approval.status = newStatus;
    approval.feedback = feedback || (action === 'approve' ? 'Approved in compliance review.' : 'Revision requested.');
    approval.reviewedBy = req.user._id;
    approval.reviewedAt = new Date();
    await approval.save();

    // Update document
    if (approval.document) {
      const doc = await Document.findById(approval.document._id);
      if (doc) {
        doc.status = docStatus;
        doc.approvalFeedback = approval.feedback;
        if (action === 'approve') {
          doc.approvedAt = new Date();
        } else {
          doc.rejectedAt = new Date();
        }
        await doc.save();

        await ActivityLog.create({
          user: req.user._id,
          action: action === 'approve' ? 'APPROVE_DOCUMENT' : 'REJECT_DOCUMENT',
          document: doc._id,
          details: `${action === 'approve' ? 'Approved' : 'Rejected'} document "${doc.title}" (v${doc.currentVersion}). Feedback: ${approval.feedback}`
        });
      }
    }

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, message: `Document successfully ${docStatus.toLowerCase()}.` });
    }

    res.redirect('/approvals');
  } catch (error) {
    console.error('Process Approval Error:', error);
    res.status(500).render('pages/error', {
      title: 'Processing Error',
      statusCode: 500,
      message: error.message
    });
  }
};
