const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true,
    enum: [
      'USER_REGISTER',
      'USER_LOGIN',
      'DOCUMENT_UPLOAD',
      'DOCUMENT_UPDATE',
      'DOCUMENT_NEW_VERSION',
      'SUBMIT_APPROVAL',
      'APPROVE_DOCUMENT',
      'REJECT_DOCUMENT',
      'CATEGORY_CREATE',
      'USER_ROLE_CHANGE'
    ]
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  details: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
