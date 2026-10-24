# 💰 Personal Finance Management System

A full-stack, modular web application designed for students and individuals to track personal income, expenses, budgets, and savings goals.

This repository represents **Phase 1: Project Setup and Architecture**, establishing the foundational client-server structure, database connectivity, centralized error handling, and design system.

---

## 🏗️ Architecture Overview

The project is structured as two independent, decoupled applications:

```text
personal-finance-management/
├── frontend/                     # React.js SPA (Vite + Tailwind CSS)
│   ├── public/                   # Static public assets and favicon
│   ├── src/
│   │   ├── assets/               # Local images and graphic assets
│   │   ├── components/
│   │   │   ├── common/           # Reusable UI primitives (Button, Card, Badge, Toaster)
│   │   │   └── layout/           # Navbar, Sidebar, and Footer
│   │   ├── layouts/              # RootLayout (Dashboard shell) & AuthLayout
│   │   ├── pages/                # Views (HomePage, HealthCheckPage, NotFoundPage)
│   │   │   └── auth/             # Authentication placeholders (LoginPage, RegisterPage)
│   │   ├── routes/               # React Router DOM configuration
│   │   ├── context/              # React Context (AuthContext)
│   │   ├── services/             # Centralized Axios client & API services
│   │   ├── hooks/                # Custom hooks (useAuth, useApiHealth)
│   │   ├── utils/                # Helper utilities (cn, notify)
│   │   ├── App.jsx               # Application entry wrapper
│   │   └── main.jsx              # React DOM mounting
│   ├── .env.example              # Frontend environment variables template
│   ├── package.json              # Frontend dependencies and scripts
│   ├── tailwind.config.js        # Design system color tokens & typography
│   └── vite.config.js            # Vite configuration
│
├── backend/                      # Node.js & Express REST API
│   ├── src/
│   │   ├── config/               # Database connection (db.js) & env loader (env.js)
│   │   ├── controllers/          # Request handlers (health.controller.js)
│   │   ├── services/             # Business logic layer
│   │   ├── models/               # Mongoose data schemas
│   │   ├── routes/               # API route definitions
│   │   ├── middlewares/          # Centralized error handler & 404 catcher
│   │   ├── validations/          # Zod schema definitions
│   │   ├── utils/                # Standardized response formatters
│   │   ├── constants/            # HTTP status codes & DB state constants
│   │   ├── app.js                # Express app & middleware pipeline
│   │   └── server.js             # HTTP server entry & graceful shutdown
│   ├── .env.example              # Backend environment variables template
│   └── package.json              # Backend dependencies and scripts
│
├── README.md                     # Documentation and setup instructions
└── .gitignore                    # Global git ignore configuration
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS with custom finance tokens
- **Routing:** React Router DOM (v6)
- **HTTP Client:** Axios with request & response interceptors
- **Icons:** Lucide React
- **Notifications:** Sonner
- **State Management:** React Context API (Auth state foundation)

### Backend
- **Runtime:** Node.js (v18+) with native ES Modules
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Validation:** Zod
- **Environment & Security:** dotenv, cors

---

## 📋 Prerequisites

Before starting, make sure you have the following installed on your machine:
- **Node.js:** v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm:** v9.0.0 or higher (comes bundled with Node.js)
- **MongoDB:** (Choose one)
  - **Local MongoDB Community Server:** Running on `mongodb://127.0.0.1:27017`
  - **MongoDB Atlas:** Free cloud database cluster ([MongoDB Atlas](https://www.mongodb.com/atlas))

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone <repository-url>
cd personal-finance-management
```

---

### 2. Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the example environment file:
   ```bash
   # On Windows (PowerShell):
   Copy-Item .env.example .env

   # On macOS / Linux:
   cp .env.example .env
   ```

4. **Review your `backend/.env` file:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/personal_finance
   CLIENT_URL=http://localhost:5173
   ```
   *Note: If using MongoDB Atlas, replace `MONGODB_URI` with your connection string:*
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/personal_finance?retryWrites=true&w=majority
   ```

5. **Start the backend server:**
   - **Development mode (with auto-reload):**
     ```bash
     npm run dev
     ```
   - **Production / standard mode:**
     ```bash
     npm start
     ```

   You should see:
   ```text
   ====================================================
    💰 Personal Finance Management API
    🚀 Server running at: http://localhost:5000
    🌐 Health endpoint:  http://localhost:5000/api/health
    🔒 Environment:      development
    🔗 Allowed Origin:   http://localhost:5173
   ====================================================
   ```

---

### 3. Frontend Setup

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   # On Windows (PowerShell):
   Copy-Item .env.example .env

   # On macOS / Linux:
   cp .env.example .env
   ```

4. **Verify your `frontend/.env` file:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

   The application will be available at: **http://localhost:5173**

---

## 🔍 Verification & Health Checking

The system includes built-in diagnostics to verify full-stack connectivity:

1. **Browser GUI:** Open [http://localhost:5173/health](http://localhost:5173/health) in your browser.
   - Shows live backend ping & response latency.
   - Shows MongoDB connection status (`connected` vs `disconnected`).
   - Includes an interactive Sonner notification sandbox.
   - Displays formatted raw JSON from `/api/health`.

2. **Direct API Endpoint:**
   ```bash
   curl http://localhost:5000/api/health
   ```
   **Sample Response:**
   ```json
   {
     "success": true,
     "message": "All services are operational",
     "data": {
       "status": "healthy",
       "service": "personal-finance-api",
       "version": "1.0.0",
       "environment": "development",
       "timestamp": "2026-10-24T16:25:00.000Z",
       "uptime": "120s",
       "database": {
         "status": "connected",
         "connected": true,
         "name": "personal_finance",
         "host": "127.0.0.1"
       },
       "system": {
         "nodeVersion": "v20.x.x",
         "platform": "win32"
       }
     }
   }
   ```

3. **Graceful Fallback:** If MongoDB is not yet running, the backend will still run and report:
   ```json
   {
     "success": true,
     "message": "API is running but database is not connected",
     "data": {
       "status": "degraded",
       "database": {
         "status": "disconnected",
         "connected": false
       }
     }
   }
   ```

---

## 🎨 Design System & Color Tokens

The UI implements a premium financial palette:
- **Primary Navy / Indigo:** `#0f172a`, `#1e293b`, `#3d4de8` — Structural surfaces and navigation.
- **Emerald Green:** `#10b981` — Positive cash flow, income, assets, surplus.
- **Rose / Red:** `#ef4444` — Expenses, liabilities, debt, errors.
- **Amber:** `#f59e0b` — Warnings, budget thresholds, alerts.
- **Soft Slate:** `#f8fafc`, `#f1f5f9` — Clean neutral canvas with high legibility.

---

---

## 🔐 Authentication & User Management (Phase 2)

The backend provides a secure, role-based authentication system using JSON Web Tokens (JWT), bcrypt password hashing, and HTTP-only cookies.

### Authentication Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (always assigned role `USER`) |
| `POST` | `/api/auth/login` | Public | Authenticate credentials and issue HTTP-only JWT cookie |
| `POST` | `/api/auth/logout` | Public | Terminate session and clear authentication cookie |
| `GET` | `/api/auth/me` | Protected | Retrieve currently authenticated user's profile |
| `PATCH` | `/api/auth/change-password` | Protected | Change password with current password verification |

### Request Payload Examples

#### Register (`POST /api/auth/register`)
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password@123"
}
```

#### Login (`POST /api/auth/login`)
```json
{
  "email": "jane@example.com",
  "password": "Password@123"
}
```

#### Change Password (`PATCH /api/auth/change-password`)
```json
{
  "currentPassword": "Password@123",
  "newPassword": "NewPassword@456",
  "confirmPassword": "NewPassword@456"
}
```

---

## 🛡️ Admin Account Seed Script

To initialize a system administrator account, configure `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `backend/.env` and execute:

```bash
cd backend
npm run seed:admin
```

This script:
- Verifies MongoDB connectivity.
- Normalizes the email address.
- Creates the admin account with role `ADMIN` if it does not exist.
- Upgrades an existing account to `ADMIN` if the email already exists.
- Safely hashes the password with bcrypt before persisting.

---

---

## 💳 Financial Transaction Management (Module 1 Backend)

Module 1 provides complete RESTful endpoints for tracking personal incomes and expenses, categorized transactions, and a combined transaction history with server-side filtering, sorting, and pagination.

### Endpoints Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Protected | List valid categories (optional `?type=INCOME` or `?type=EXPENSE`) |
| `POST` | `/api/incomes` | Protected | Create a new income record |
| `GET` | `/api/incomes` | Protected | List authenticated user's incomes with pagination & filters |
| `GET` | `/api/incomes/:id` | Protected | Retrieve a single income record (ownership enforced) |
| `PUT` / `PATCH` | `/api/incomes/:id` | Protected | Edit an income record (ownership enforced) |
| `DELETE` | `/api/incomes/:id` | Protected | Delete an income record (ownership enforced) |
| `POST` | `/api/expenses` | Protected | Create a new expense record |
| `GET` | `/api/expenses` | Protected | List authenticated user's expenses with pagination & filters |
| `GET` | `/api/expenses/:id` | Protected | Retrieve a single expense record (ownership enforced) |
| `PUT` / `PATCH` | `/api/expenses/:id` | Protected | Edit an expense record (ownership enforced) |
| `DELETE` | `/api/expenses/:id` | Protected | Delete an expense record (ownership enforced) |
| `GET` | `/api/transactions` | Protected | Retrieve combined income & expense history with summary stats |

### Combined Transactions Query Options (`GET /api/transactions`)

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | String | `ALL` | Filter by type: `INCOME`, `EXPENSE`, or `ALL` |
| `category` | String | - | Case-insensitive category name (e.g. `Salary`, `Food & Dining`) |
| `search` | String | - | Search keyword across descriptions and categories |
| `startDate` | ISO Date | - | Filter records on or after this date (`YYYY-MM-DD`) |
| `endDate` | ISO Date | - | Filter records on or before this date (`YYYY-MM-DD`) |
| `minAmount` | Number | - | Filter transactions with amount >= `minAmount` |
| `maxAmount` | Number | - | Filter transactions with amount <= `maxAmount` |
| `sortBy` | String | `date` | Sort field: `date` or `amount` |
| `sortOrder` | String | `desc` | Sort direction: `desc` or `asc` |
| `page` | Integer | `1` | Page number (min 1) |
| `limit` | Integer | `10` | Records per page (min 1, max 100) |

### Sample Response (`GET /api/transactions`)

```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "_id": "6724a1...",
      "type": "INCOME",
      "amount": 4500,
      "category": "Salary",
      "date": "2026-10-01T00:00:00.000Z",
      "description": "Monthly pay",
      "createdAt": "2026-10-24T18:00:00.000Z",
      "updatedAt": "2026-10-24T18:00:00.000Z"
    },
    {
      "_id": "6724a2...",
      "type": "EXPENSE",
      "amount": 75.50,
      "category": "Food & Dining",
      "paymentMethod": "credit_card",
      "date": "2026-10-03T12:00:00.000Z",
      "description": "Groceries",
      "createdAt": "2026-10-24T18:10:00.000Z",
      "updatedAt": "2026-10-24T18:10:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalRecords": 2,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    },
    "summary": {
      "totalIncome": 4500,
      "totalExpense": 75.5,
      "netBalance": 4424.5
    }
  }
}
```

---

## 📌 Phase Roadmap

- [x] **Phase 1: Project Setup and Architecture**
  - Clean modular structure for Frontend and Backend.
  - Express.js server with MongoDB Mongoose connection.
  - Centralized error handling and 404 middleware.
  - React + Vite + Tailwind CSS foundation.
  - Centralized Axios client and Sonner notification system.
  - Live API & DB Health Diagnostic page.
- [x] **Phase 2: Authentication & User Accounts (Backend Foundation)**
  - Mongoose User model with role (`USER` / `ADMIN`), status, and email normalization.
  - Secure bcrypt password hashing with automatic pre-save hooks.
  - JWT generation and HTTP-only cookie session management.
  - Request validation schemas using Zod.
  - Authentication, role authorization, and rate-limiting middlewares.
  - Endpoints: Register, Login, Logout, Profile (`/me`), and Password Change.
  - Environment-based Admin seed script (`npm run seed:admin`).
- [x] **Phase 3: Frontend Authentication and Premium Application Layout**
  - Public Landing Page with platform roadmap, architecture highlights, and CTA.
  - Polished Login and Registration pages with live validation, password toggles, and feedback.
  - Reusable authenticated `DashboardLayout` with desktop sidebar, mobile drawer, and navbar.
  - User profile menu with avatar, live data display from `/api/auth/me`, and logout action.
  - Protected route and guest route guards with role-based checks.
  - Profile and Change Password management pages communicating with backend.
  - Zero localStorage token storage — 100% reliant on backend HTTP-only cookies.
- [x] **Phase 4: Module 1 Backend - Financial Transaction Management**
  - Mongoose models for `Income`, `Expense`, and `Category`.
  - Category type-matching and default seeder (prevents using income category for expenses and vice versa).
  - Income CRUD with user ownership verification and Zod validation.
  - Expense CRUD with user ownership verification, payment methods, and Zod validation.
  - Combined `GET /api/transactions` with keyword search, type/category/date filtering, sorting, and pagination.
  - Summary aggregation (`totalIncome`, `totalExpense`, `netBalance`).
  - Comprehensive automated test suite (`npm run test:transactions`).
- [x] **Phase 5: Financial Core Frontend (Module 1 - Incomes, Expenses & Transaction History)**
  - Reusable services for Categories, Incomes, Expenses, and Transactions (`categoryService`, `incomeService`, `expenseService`, `transactionService`).
  - Interactive Income Management Page (`/income`) with BDT currency formatting (`৳`), category filter, date range, pagination, Add/Edit modal, and delete confirmation dialogs.
  - Interactive Expense Management Page (`/expenses`) with payment method indicators (Cash, Card, Bank, bKash/Nagad), category filter, search, date range, pagination, Add/Edit modal, and delete confirmation dialogs.
  - Unified Transaction Ledger (`/transactions`) combining incomes and expenses with type tabs (`ALL`, `INCOME`, `EXPENSE`), category filters, sorting by date and amount, and live net balance summary metrics.
  - Accessible modal dialogs (`Modal`, `ConfirmDialog`, `Pagination`, `EmptyState`) with keyboard focus states and ESC dismiss.
  - Comprehensive end-to-end integration test suite (`node src/scripts/verifyModule1Integration.js`) passing 100% against live MongoDB Atlas.
- [ ] **Phase 6: Budgets & Savings Goals**
  - Monthly budget limits and threshold alerts.
  - Savings goal tracking and milestone visualization.
- [ ] **Phase 7: Analytics, Visualizations & Reporting**
  - Interactive cash flow graphs, spending distribution charts, statement exports.



