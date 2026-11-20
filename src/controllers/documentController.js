const Document = require('../models/Document');
const Category = require('../models/Category');
const Approval = require('../models/Approval');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

exports.renderDocuments = async (req, res) => {
  try {
    const { search, category, status, sort } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { documentNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    let sortOptions = { updatedAt: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    if (sort === 'title') sortOptions = { title: 1 };

    let documents = [];
    let categories = [];

    try {
      documents = await Document.find(query)
        .populate('category')
        .populate('uploadedBy', 'name email department')
        .populate('currentApprover', 'name email')
        .sort(sortOptions);

      categories = await Category.find();
    } catch (e) {
      console.warn('Document list query fallback:', e.message);
    }

    res.render('pages/documents/index', {
      title: 'Document Repository - DocuGovern',
      activeMenu: 'documents',
      documents,
      categories,
      filters: {
        search: search || '',
        category: category || 'all',
        status: status || 'all',
        sort: sort || 'newest'
      }
    });
  } catch (error) {
    console.error('Documents list error:', error);
    res.status(500).render('pages/error', {
      title: 'Error Loading Documents',
      statusCode: 500,
      message: error.message
    });
  }
};

exports.renderUpload = async (req, res) => {
  try {
    let categories = [];
    let approvers = [];
    try {
      categories = await Category.find();
      approvers = await User.find({ role: { $in: ['Admin', 'Approver'] }, isActive: true });
    } catch (e) {}

    res.render('pages/documents/upload', {
      title: 'Upload Document - DocuGovern',
      activeMenu: 'upload',
      categories,
      approvers,
      error: null
    });
  } catch (error) {
    res.status(500).render('pages/error', {
      title: 'Error',
      statusCode: 500,
      message: 'Unable to load document upload workspace.'
    });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const { title, category, description, priority, tags, autoSubmit, approverId, notes } = req.body;
    
    if (!req.file) {
      let categories = await Category.find();
      let approvers = await User.find({ role: { $in: ['Admin', 'Approver'] } });
      return res.status(400).render('pages/documents/upload', {
        title: 'Upload Document - DocuGovern',
        activeMenu: 'upload',
        categories,
        approvers,
        error: 'Please choose a document file to upload.'
      });
    }

    const tagList = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const fileRelativeUrl = `/uploads/documents/${req.file.filename}`;

    const newDoc = new Document({
      title,
      category,
      description,
      priority: priority || 'Normal',
      tags: tagList,
      fileUrl: fileRelativeUrl,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      currentVersion: '1.0',
      status: autoSubmit === 'true' ? 'Pending_Approval' : 'Draft',
      uploadedBy: req.user._id,
      currentApprover: autoSubmit === 'true' ? approverId : null,
      versions: [{
        version: '1.0',
        fileUrl: fileRelativeUrl,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        changeSummary: 'Initial Document Creation and Upload',
        uploadedBy: req.user._id,
        uploadedAt: new Date()
      }]
    });

    await newDoc.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'DOCUMENT_UPLOAD',
      document: newDoc._id,
      details: `Uploaded new document "${newDoc.title}" (${newDoc.documentNumber}).`
    });

    if (autoSubmit === 'true') {
      await Approval.create({
        document: newDoc._id,
        submittedBy: req.user._id,
        assignedApprover: approverId,
        priority: priority || 'Normal',
        notes: notes || 'Submitted upon upload.',
        status: 'Pending'
      });

      await ActivityLog.create({
        user: req.user._id,
        action: 'SUBMIT_APPROVAL',
        document: newDoc._id,
        details: `Submitted "${newDoc.title}" for review.`
      });
    }

    res.redirect(`/documents/${newDoc._id}`);
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).render('pages/error', {
      title: 'Upload Failed',
      statusCode: 500,
      message: error.message
    });
  }
};

exports.renderDetail = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('category')
      .populate('uploadedBy', 'name email department')
      .populate('currentApprover', 'name email department')
      .populate('versions.uploadedBy', 'name');

    if (!document) {
      return res.status(404).render('pages/error', {
        title: 'Document Not Found',
        statusCode: 404,
        message: 'The requested governance document does not exist or has been archived.'
      });
    }

    const approvals = await Approval.find({ document: document._id })
      .populate('submittedBy', 'name department')
      .populate('assignedApprover', 'name department')
      .populate('reviewedBy', 'name department')
      .sort({ createdAt: -1 });

    const approvers = await User.find({ role: { $in: ['Admin', 'Approver'] }, isActive: true });

    res.render('pages/documents/detail', {
      title: `${document.title} - DocuGovern`,
      activeMenu: 'documents',
      document,
      approvals,
      approvers
    });
  } catch (error) {
    console.error('Document Detail Error:', error);
    res.status(500).render('pages/error', {
      title: 'Error',
      statusCode: 500,
      message: 'Failed to retrieve document metadata and audit logs.'
    });
  }
};

exports.uploadNewVersion = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { version, changeSummary } = req.body;
    const fileRelativeUrl = `/uploads/documents/${req.file.filename}`;
    const nextVersion = version || (parseFloat(document.currentVersion) + 0.1).toFixed(1);

    document.versions.push({
      version: nextVersion,
      fileUrl: fileRelativeUrl,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      changeSummary: changeSummary || 'Iterative version update',
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    });

    document.currentVersion = nextVersion;
    document.fileUrl = fileRelativeUrl;
    document.originalName = req.file.originalname;
    document.fileSize = req.file.size;
    document.mimeType = req.file.mimetype;
    document.status = 'Draft'; // Reverts to draft on new version revision

    await document.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'DOCUMENT_NEW_VERSION',
      document: document._id,
      details: `Published version ${nextVersion} for "${document.title}": ${changeSummary || 'No notes'}`
    });

    res.redirect(`/documents/${document._id}`);
  } catch (error) {
    console.error('New Version Error:', error);
    res.status(500).render('pages/error', {
      title: 'Version Upload Failed',
      statusCode: 500,
      message: error.message
    });
  }
};

exports.submitForApproval = async (req, res) => {
  try {
    const { approverId, priority, notes } = req.body;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    document.status = 'Pending_Approval';
    document.currentApprover = approverId;
    if (priority) document.priority = priority;
    await document.save();

    const approval = await Approval.create({
      document: document._id,
      submittedBy: req.user._id,
      assignedApprover: approverId,
      priority: priority || document.priority || 'Normal',
      notes: notes || 'Submitted for official governance sign-off.',
      status: 'Pending'
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'SUBMIT_APPROVAL',
      document: document._id,
      details: `Submitted "${document.title}" (v${document.currentVersion}) for approval.`
    });

    res.redirect(`/documents/${document._id}`);
  } catch (error) {
    console.error('Submit Approval Error:', error);
    res.status(500).render('pages/error', {
      title: 'Submission Error',
      statusCode: 500,
      message: error.message
    });
  }
};
