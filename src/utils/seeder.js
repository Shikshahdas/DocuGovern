require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Document = require('../models/Document');
const Approval = require('../models/Approval');
const ActivityLog = require('../models/ActivityLog');

const seedData = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/docugovern';
    console.log(`Connecting to database at ${connStr}...`);
    await mongoose.connect(connStr);

    console.log('Clearing existing demo data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Document.deleteMany({});
    await Approval.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log('Seeding enterprise users...');
    const admin = await User.create({
      name: 'Sarah Jenkins',
      email: 'admin@docugovern.com',
      password: 'AdminPassword123!',
      role: 'Admin',
      department: 'Corporate Governance & Legal'
    });

    const approver = await User.create({
      name: 'Marcus Chen',
      email: 'approver@docugovern.com',
      password: 'ApproverPassword123!',
      role: 'Approver',
      department: 'Finance & Risk Management'
    });

    const staff = await User.create({
      name: 'Elena Rostova',
      email: 'staff@docugovern.com',
      password: 'StaffPassword123!',
      role: 'Staff',
      department: 'Operations & Compliance'
    });

    console.log('Seeding governance categories...');
    const catLegal = await Category.create({
      name: 'Compliance & Legal',
      description: 'Regulatory compliance, GDPR, statutory filings, and NDA governance.',
      color: '#0ea5e9',
      icon: 'shield',
      createdBy: admin._id
    });

    const catFinance = await Category.create({
      name: 'Financial Audits',
      description: 'Quarterly financial reports, audit trails, and capital expense plans.',
      color: '#10b981',
      icon: 'file-text',
      createdBy: admin._id
    });

    const catSecurity = await Category.create({
      name: 'IT & Security Policy',
      description: 'Information security guidelines, ISO-27001 policies, disaster recovery.',
      color: '#ec4899',
      icon: 'lock',
      createdBy: admin._id
    });

    const catBoard = await Category.create({
      name: 'Board Resolutions',
      description: 'Minutes of meeting, executive charters, and stakeholder voting resolutions.',
      color: '#6366f1',
      icon: 'award',
      createdBy: admin._id
    });

    const catHR = await Category.create({
      name: 'Human Resources',
      description: 'Employee handbook, ESOP regulations, and workplace safety compliance.',
      color: '#f59e0b',
      icon: 'users',
      createdBy: admin._id
    });

    console.log('Seeding documents and version history...');
    const doc1 = await Document.create({
      title: 'Q4 2026 Enterprise Risk Assessment & Security Policy',
      documentNumber: 'DOC-2026-9481',
      category: catSecurity._id,
      description: 'Comprehensive cybersecurity vulnerability assessment and business continuity mitigation protocol.',
      fileUrl: '/uploads/documents/sample-risk-assessment.pdf',
      originalName: 'Enterprise_Risk_Assessment_v2.4.pdf',
      fileSize: 4288000,
      mimeType: 'application/pdf',
      currentVersion: '2.4',
      status: 'Pending_Approval',
      priority: 'Urgent',
      tags: ['Security', 'ISO-27001', 'Audit', 'Q4'],
      uploadedBy: staff._id,
      currentApprover: approver._id,
      versions: [
        {
          version: '1.0',
          fileUrl: '/uploads/documents/sample-risk-assessment-v1.pdf',
          originalName: 'Enterprise_Risk_Assessment_v1.0.pdf',
          fileSize: 3100000,
          mimeType: 'application/pdf',
          changeSummary: 'Initial draft for Q4 assessment',
          uploadedBy: staff._id,
          uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 72)
        },
        {
          version: '2.4',
          fileUrl: '/uploads/documents/sample-risk-assessment.pdf',
          originalName: 'Enterprise_Risk_Assessment_v2.4.pdf',
          fileSize: 4288000,
          mimeType: 'application/pdf',
          changeSummary: 'Updated incident escalation matrices based on external auditor feedback.',
          uploadedBy: staff._id,
          uploadedAt: new Date()
        }
      ]
    });

    const doc2 = await Document.create({
      title: 'Global Data Privacy & GDPR Governance Framework',
      documentNumber: 'DOC-2026-8832',
      category: catLegal._id,
      description: 'Standard guidelines for customer personally identifiable information handling and cross-border data transfer.',
      fileUrl: '/uploads/documents/sample-gdpr-framework.pdf',
      originalName: 'GDPR_Data_Privacy_v1.2.pdf',
      fileSize: 2840000,
      mimeType: 'application/pdf',
      currentVersion: '1.2',
      status: 'Approved',
      priority: 'High',
      tags: ['GDPR', 'Privacy', 'Compliance'],
      uploadedBy: admin._id,
      currentApprover: admin._id,
      approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      versions: [
        {
          version: '1.2',
          fileUrl: '/uploads/documents/sample-gdpr-framework.pdf',
          originalName: 'GDPR_Data_Privacy_v1.2.pdf',
          fileSize: 2840000,
          mimeType: 'application/pdf',
          changeSummary: 'Finalized and ratified by Executive Council',
          uploadedBy: admin._id,
          uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
        }
      ]
    });

    const doc3 = await Document.create({
      title: 'FY2027 Capital Expenditure & Financial Forecast',
      documentNumber: 'DOC-2026-7210',
      category: catFinance._id,
      description: 'Annual budget allocation request for cloud infrastructure and AI operational toolsets.',
      fileUrl: '/uploads/documents/sample-capex-forecast.xlsx',
      originalName: 'FY2027_Capex_Budget.xlsx',
      fileSize: 6120000,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      currentVersion: '3.0',
      status: 'Approved',
      priority: 'High',
      tags: ['Budget', 'Finance', 'Capex'],
      uploadedBy: approver._id,
      currentApprover: admin._id,
      approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      versions: [
        {
          version: '3.0',
          fileUrl: '/uploads/documents/sample-capex-forecast.xlsx',
          originalName: 'FY2027_Capex_Budget.xlsx',
          fileSize: 6120000,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          changeSummary: 'Approved revised infrastructure projection numbers',
          uploadedBy: approver._id,
          uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 48)
        }
      ]
    });

    console.log('Seeding approvals queue...');
    await Approval.create({
      document: doc1._id,
      submittedBy: staff._id,
      assignedApprover: approver._id,
      status: 'Pending',
      priority: 'Urgent',
      notes: 'Requires review before the upcoming compliance board meeting this Friday.',
      createdAt: new Date(Date.now() - 1000 * 60 * 45)
    });

    await Approval.create({
      document: doc2._id,
      submittedBy: staff._id,
      assignedApprover: admin._id,
      reviewedBy: admin._id,
      status: 'Approved',
      priority: 'High',
      notes: 'Reviewed and aligned with European Union regulatory standard.',
      feedback: 'Approved by Sarah Jenkins (Chief Compliance Officer). All clauses accepted.',
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
    });

    console.log('Seeding activity audit stream...');
    await ActivityLog.create({
      user: admin._id,
      action: 'APPROVE_DOCUMENT',
      document: doc2._id,
      details: 'Approved "Global Data Privacy & GDPR Governance Framework v1.2"'
    });
    await ActivityLog.create({
      user: staff._id,
      action: 'SUBMIT_APPROVAL',
      document: doc1._id,
      details: 'Submitted "Q4 2026 Enterprise Risk Assessment & Security Policy" for Urgent Approval'
    });
    await ActivityLog.create({
      user: approver._id,
      action: 'DOCUMENT_NEW_VERSION',
      document: doc3._id,
      details: 'Published new Version 3.0 for "FY2027 Capital Expenditure & Financial Forecast"'
    });

    console.log('=== SEEDING COMPLETED SUCCESSFULLY ===');
    console.log('Demo Credentials:');
    console.log('  Admin:    admin@docugovern.com    | AdminPassword123!');
    console.log('  Approver: approver@docugovern.com | ApproverPassword123!');
    console.log('  Staff:    staff@docugovern.com    | StaffPassword123!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
