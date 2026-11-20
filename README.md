# DocuGovern - Enterprise Document Management & Governance Approval System

DocuGovern is a modern, high-trust Document Management and Approval System engineered for corporations, legal teams, and regulatory bodies requiring strict version control, multi-tier approvals, and immutable audit trails.

---

## Key System Capabilities

1. **Authentication & Session Security**:
   - JWT-based authentication stored in secure HTTP-only cookies.
   - Role-Based Access Control (RBAC): `Admin`, `Approver`, and `Staff`.
   - Segregation of duties to prevent unauthorized modifications.

2. **Document Management & Version Tracking**:
   - Secure multi-part document uploads supporting PDF, DOCX, XLSX, PPTX, TXT, and images.
   - Comprehensive versioning model (`v1.0`, `v1.1`, `v2.0`...) retaining previous revision files, timestamps, uploaders, and change log summaries.
   - Unique auto-generated document codes (`DOC-YYYY-XXXX`).

3. **Multi-Category Classification**:
   - Structure documents by organizational department (Compliance & Legal, Financial Audits, IT & Security, Board Resolutions, Human Resources).
   - Custom category color coding and slug generation.

4. **Approval & Governance Workflow**:
   - Formal submission workflow (`Draft` → `Pending_Approval` → `Approved` / `Rejected`).
   - Assignment to designated approvers with priority flags (`Normal`, `Low`, `High`, `Urgent`).
   - Approval/rejection decision recording with obligatory compliance feedback.

5. **Real-time Activity Audit Trail**:
   - Immutable audit stream recording actions (`USER_LOGIN`, `DOCUMENT_UPLOAD`, `DOCUMENT_NEW_VERSION`, `SUBMIT_APPROVAL`, `APPROVE_DOCUMENT`, etc.).

6. **Enterprise SaaS Dashboard**:
   - Metric KPI statistics with trend indicators.
   - Interactive zero-dependency pure SVG Donut and Bar charts.
   - Pending Approvals quick-review tray.
   - Recent Document Table with instant filter and search.

---

## Project Structure

```
docugovern/
├── package.json               # Manifest & scripts
├── server.js                  # Express application root & middleware pipeline
├── .env.example               # Environment variables template
├── README.md                  # System documentation
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js       # Authentication & JWT session
│   │   ├── dashboardController.js  # Analytics, KPIs & aggregation
│   │   ├── documentController.js   # Document CRUD, versioning & file handling
│   │   ├── approvalController.js   # Governance review & approvals
│   │   ├── categoryController.js   # Category management
│   │   └── userController.js       # RBAC & user administration
│   ├── middleware/
│   │   ├── auth.js            # JWT protection & role gating
│   │   └── upload.js          # Multer file upload & mime-type filter
│   ├── models/
│   │   ├── User.js            # User accounts & bcrypt hashing
│   │   ├── Document.js        # Documents & version history array
│   │   ├── Category.js        # Departmental taxonomy
│   │   ├── Approval.js        # Review requests & audit decisions
│   │   └── ActivityLog.js     # System-wide audit stream
│   ├── routes/                # Clean Express modular routers
│   └── utils/
│       └── seeder.js          # Database seeder with enterprise mock data
├── views/
│   ├── partials/              # Modular UI components (head, sidebar, topbar, footer)
│   └── pages/                 # Full EJS views (dashboard, repository, detail, upload, auth, etc.)
└── public/
    ├── css/                   # Bespoke corporate design system (main.css, dashboard.css)
    ├── js/                    # Client UI & SVG chart renderers (app.js, dashboard.js)
    ├── preview-dashboard.html # Standalone browser preview
    └── uploads/documents/     # Stored document binary assets
```

---

## Setup & Running Instructions

### 1. Install Dependencies
```bash
npm install
```

Required packages:
- `express` (Application server)
- `ejs` (Templating engine)
- `mongoose` (MongoDB Object Modeling)
- `jsonwebtoken` (JWT security)
- `bcryptjs` (Password hashing)
- `cookie-parser` (HTTP-only cookie parser)
- `multer` (File upload streaming)
- `dotenv` (Environment configuration)
- `morgan` & `cors` (Logging & CORS)
- `nodemon` (Development reloading)

### 2. Configure Environment (`.env`)
Verify `PORT` and `MONGODB_URI` in `.env`. Default connects to local MongoDB:
```ini
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/docugovern
JWT_SECRET=docugovern_enterprise_super_secret_key_2026_xyz!
```

### 3. Seed Enterprise Demonstration Data (Optional)
```bash
npm run seed
```
This sets up sample users:
- **Admin**: `admin@docugovern.com` / `AdminPassword123!`
- **Approver**: `approver@docugovern.com` / `ApproverPassword123!`
- **Staff**: `staff@docugovern.com` / `StaffPassword123!`

### 4. Start the Application
```bash
npm run dev
# or
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
