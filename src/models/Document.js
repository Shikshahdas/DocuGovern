const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  version: {
    type: String,
    required: true,
    default: '1.0'
  },
  fileUrl: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String
  },
  changeSummary: {
    type: String,
    default: 'Initial upload'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a document title'],
    trim: true,
    maxlength: 200
  },
  documentNumber: {
    type: String,
    unique: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a document category']
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  fileUrl: {
    type: String,
    required: [true, 'Please attach a document file']
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String
  },
  currentVersion: {
    type: String,
    default: '1.0'
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending_Approval', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Urgent'],
    default: 'Normal'
  },
  tags: [{
    type: String,
    trim: true
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentApprover: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalFeedback: {
    type: String,
    default: ''
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  versions: [versionSchema]
}, {
  timestamps: true
});

// Auto-generate document code before saving if not present
documentSchema.pre('save', function(next) {
  if (!this.documentNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const rand = Math.floor(100 + Math.random() * 900);
    this.documentNumber = `DOC-${timestamp}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Document', documentSchema);
