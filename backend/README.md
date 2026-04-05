# Finance Data Processing and Access Control Backend

## Overview

This backend powers a role-based finance dashboard where users can register, sign in, manage financial records, and access summary analytics based on their permissions.

The project is structured to demonstrate backend fundamentals clearly:

* modular routing
* layered architecture
* role-based access control
* validation and consistent API responses
* MongoDB-backed persistence

---

## Tech Stack

* Node.js
* Express
* TypeScript
* MongoDB Atlas with Mongoose
* JWT authentication

---

## Project Structure

```text
src/
  config/
  middlewares/
  modules/
    auth/
    user/
    finance/
    dashboard/
  utils/
  app.ts
  server.ts
```

Each module follows:

Controller -> Service -> Model

This keeps routing, business logic, and persistence concerns separated and easy to maintain.

---

## Roles and Access Rules 

Role    -  Access 
ADMIN   -  Full access to user management, finance CRUD, records, and dashboard APIs 
ANALYST -  Can view finance records and dashboard analytics 
VIEWER  -  Can access dashboard analytics only 

### Registration Behavior

* On a fresh database, the first registered account becomes `ADMIN`
* After that, public registration creates `VIEWER` accounts
* Admins can create users and update user roles/status from the user module

---

## Implemented Features

### Auth

* Register
* Login
* JWT-based protected profile
* Password hashing with bcrypt
* Duplicate email prevention
* Inactive account blocking

Routes:

* POST `/api/v1/auth/register`
* POST `/api/v1/auth/login`
* GET `/api/v1/auth/profile`

### Users

* Admin creates users
* Admin lists users
* Admin views a user by id
* Admin updates user role
* Admin updates active/inactive status

Routes:

* POST `/api/v1/users`
* GET `/api/v1/users`
* GET `/api/v1/users/:id`
* PATCH `/api/v1/users/:id/role`
* PATCH `/api/v1/users/:id/status`

### Finance Records

* Admin creates records
* Admin updates records
* Admin soft deletes records
* Admin and Analyst can view records
* Filtering by type, category, and date range
* Pagination with bounded page size

Routes:

* POST `/api/v1/finance`
* GET `/api/v1/finance`
* GET `/api/v1/finance/:id`
* PATCH `/api/v1/finance/:id`
* DELETE `/api/v1/finance/:id`

### Dashboard

* Summary totals
* Category breakdown
* Monthly trends
* Recent transactions
* Optional date range filtering
* Uses MongoDB aggregation pipelines

Routes:

* GET `/api/v1/dashboard/summary`
* GET `/api/v1/dashboard/categories`
* GET `/api/v1/dashboard/trends`
* GET `/api/v1/dashboard/recent`

---

## Data Modeling Notes

### User

Fields:

* `name`
* `email`
* `password`
* `role`
* `isActive`

### FinancialRecord

Fields:

* `amount`
* `type`
* `category`
* `date`
* `note`
* `createdBy`
* `isDeleted`

Design choices:

* password excluded from normal reads
* soft delete used for finance records
* indexes added for finance query fields

---

## API Response Shape

Successful responses follow:

```json
{
  "success": true,
  "message": "Readable message",
  "data": {}
}
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster1.mmaqhxt.mongodb.net/?appName=Cluster1
JWT_SECRET=replace_this_with_a_secure_secret
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
```

### 3. Run in development

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
npm start
```

---

## Demo Users

ADMIN
aman.admin1@gmail.com - abc123

ANALYST
aman.analyst1@gmail.com	- 654321 

VIEWER
aman.viewer1@gmail.com - 654321

---

## Frontend Pairing

The frontend present in the `frontend/` folder provides:

* sign in and sign up
* finance dashboard
* transactions page
* admin-only user management page

This makes the key backend features visible and usable during evaluation.
