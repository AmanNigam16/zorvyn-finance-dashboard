# Zorvyn Finance Dashboard Assignment

## Overview

This repository contains the full-stack submission for the Zorvyn finance dashboard assignment.

It includes:

* `backend/` -> Express + TypeScript + MongoDB backend
* `frontend/` -> React + Vite frontend connected to the backend APIs

The project demonstrates:

* modular backend architecture
* role-based access control
* finance record management
* dashboard analytics
* frontend integration for auth, records, and admin user management

---

## Roles

| Role    | Acces                                                                     |
| ------- | --------------------------------------------------------------------------|
| ADMIN   | Full access to dashboard, transactions, finance CRUD, and user management |
| ANALYST | Access to dashboard and transaction records                               |
| VIEWER  | Access to dashboard analytics only                                        |

### Important Bootstrap Note

* On a fresh database, the first registered account becomes `ADMIN`
* Every later public signup becomes `VIEWER`
* Admins can create additional users and change roles/status from the frontend and backend

---

## Running the Project

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Frontend Environment

Create `frontend/.env` if needed:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## Main Frontend Pages

* `/dashboard` -> dashboard summary, trends, category breakdown, recent activity
* `/transactions` -> record filters, pagination, and admin CRUD
* `/users` -> admin-only user creation and role/status management

---

## Submission Notes

This project is intentionally focused on clarity, role logic, API structure, and maintainability rather than unnecessary complexity.

The backend and frontend were aligned so the major implemented backend capabilities are also visible and usable from the UI.
