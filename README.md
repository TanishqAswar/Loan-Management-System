# Loan Management System (LoanPro)

**Live Demo**: [https://loan-management-system-1-7364.onrender.com/](https://loan-management-system-1-7364.onrender.com/)

A full-stack Loan Management System built with the MERN stack (MongoDB, Express.js, React, Node.js). It provides role-based access control to manage the entire lifecycle of a loan, from application to disbursement and collection.

## Features

- **Role-Based Access Control (RBAC)**: Supports `borrower`, `sales_executive`, `sanction_officer`, `disbursement_executive`, `collection_officer`, and `admin` roles.
- **Borrower Portal**: Borrowers can apply for loans, upload documents (PDF/JPG/PNG), configure loan amounts/tenure, and view live EMI previews.
- **Business Rule Engine (BRE)**: Automatically rejects applications based on configurable criteria (e.g., minimum salary, employment mode).
- **Loan Lifecycle Management**: Loans go through stages: `APPLIED` -> `APPROVED` & `SANCTIONED` (by Sanction Officer) -> `DISBURSED` (by Disbursement Exec).
- **Payment Collection**: Collection officers can record UTR numbers and track the outstanding balance until the loan is `CLOSED`.
- **Admin Dashboard**: Full visibility into all loans and system statistics with interactive charts and tables.

## Tech Stack

- **Frontend**: React (Vite), React Router, Context API, Tailwind CSS combined with custom CSS for a premium Glassmorphism design, Axios, Lucide React, React Toastify.
- **Backend**: Node.js, Express.js, TypeScript, Mongoose (MongoDB), JSON Web Tokens (JWT) for authentication, Multer for file uploads, Bcryptjs.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Clone the repository

```bash
git clone https://github.com/TanishqAswar/Loan-Management-System.git
cd "Loan Management System"
```

### 2. Backend Setup

```bash
cd server
npm install
```

Ensure you have a `.env` file in the `server` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/loan_management
JWT_SECRET=lms_super_secret_jwt_key_2024
NODE_ENV=development
```

Start the backend server in development mode (using `tsx`):

```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal window:

```bash
cd client
npm install
```

Ensure you have a `.env` file in the `client` directory with the following variable:

```env
VITE_API_URL=https://loan-management-system-blfi.onrender.com/api
```

Start the Vite development server:

```bash
npm run dev
```

### 4. Database Seeding

To easily test all the roles without manually registering multiple accounts, you can run the seeding script from the `server` directory:

```bash
cd server
npm run seed
```

This will create the following test accounts (Password for all is `password123`):
- `borrower@example.com`
- `sales_executive@example.com`
- `sanction_officer@example.com`
- `disbursement_executive@example.com`
- `collection_officer@example.com`
- `admin@example.com`

## Usage Flow

1. **Register a Borrower**: Go to `/register` and create an account with the "Borrower" role.
2. **Apply for a Loan**: Log in as the borrower and click "Apply for Loan". Complete the 3 steps.
3. **Sales Review**: Register/Login as a "Sales Executive" to review leads (optional step, but approval is handled by Sanction Officer).
4. **Approve & Sanction**: Login as a "Sanction Officer" to approve the application, generate the agreement, and sanction the loan.
5. **Disburse**: Login as a "Disbursement Executive" to disburse the funds.
6. **Repayment**: Login as a "Collection Officer" to record payments until the outstanding balance is zero.

## License

ISC
