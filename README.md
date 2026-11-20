# DocuGovern – Enterprise Document Management & Governance System

A web-based document management and governance platform designed to organize documents, manage approval workflows, track document versions, and maintain activity records.

## Preview

### Login Page

<img width="100%" alt="DocuGovern Login Page" src="https://github.com/user-attachments/assets/9bf40ecf-95cb-4f42-ae9e-9dc38cd752c4" />

### Dashboard

<img width="100%" alt="DocuGovern Dashboard" src="https://github.com/user-attachments/assets/a064e274-2a7d-486b-92df-e8b49289057e" />

### Document Repository

<img width="100%" alt="DocuGovern Document Repository" src="https://github.com/user-attachments/assets/beb1d591-a7fd-41d4-86e2-660decb10997" />

### Document Upload

<img width="100%" alt="DocuGovern Document Upload" src="https://github.com/user-attachments/assets/ca45f90e-b2de-4233-8a05-618f17dc537d" />

### Approval Workflow

<img width="100%" alt="DocuGovern Approval Workflow" src="https://github.com/user-attachments/assets/5127e6ef-33f4-4cff-b680-0140e124d58d" />

## Key Features

- **Authentication:** JWT-based authentication and secure cookie handling.
- **Role-Based Access Control:** Admin, Approver, and Staff roles.
- **Document Management:** Upload and organize documents.
- **Document Versioning:** Maintain document revision history.
- **Category Management:** Organize documents by department or category.
- **Approval Workflow:** Submit documents for approval and record approval or rejection decisions.
- **Activity Tracking:** Maintain records of important system activities.
- **Dashboard:** View document statistics, pending approvals, and recent activity.

## Technology Stack

| Area | Technologies |
|---|---|
| Backend | Node.js, Express.js |
| Frontend | EJS, HTML, CSS, JavaScript |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Token (JWT), bcryptjs |
| File Upload | Multer |
| Development | Nodemon, Git, GitHub |

## Project Structure

```text
DocuGovern/
├── public/
│   ├── css/
│   ├── js/
│   └── preview-dashboard.html
├── screenshots/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
├── uploads/
├── views/
│   ├── pages/
│   └── partials/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB database (local MongoDB or MongoDB Atlas)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Shikshahdas/DocuGovern.git
cd DocuGovern
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root using `.env.example` as a template.

Configure your own values:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE_MB=25
UPLOAD_PATH=public/uploads/documents
```

**Important:** Never upload your actual `.env` file, database credentials, or JWT secrets to GitHub.

### 4. Seed Demonstration Data (Optional)

```bash
npm run seed
```

Use this only if you want to populate your database with demonstration data. Review the seeder configuration before running it.

### 5. Run the Application

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```

Open your browser and visit:

```text
http://localhost:3000
```

## Learning & Development

This project demonstrates the use of:

- RESTful routing and Express middleware
- MongoDB data modelling with Mongoose
- Authentication and role-based authorization
- File upload handling
- Document lifecycle and approval workflows
- Dynamic dashboard rendering with EJS and JavaScript

## Future Improvements

- Automated email notifications for approval updates
- Advanced document search and filtering
- Enhanced reporting and analytics
- Cloud-based document storage
- Automated testing and deployment

## Author

**Shikshah Das**

GitHub: [@Shikshahdas](https://github.com/Shikshahdas)

---

*DocuGovern – Organizing Documents. Streamlining Governance.*
