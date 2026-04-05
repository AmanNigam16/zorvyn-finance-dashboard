# Finance Dashboard Frontend

## Overview

This frontend is built to work with the backend finance system for the Zorvyn assignment.

It provides a simple interface where different users can interact with financial data based on their roles. The focus is on correctly consuming backend APIs and reflecting role-based behavior in the UI.

---

## What It Covers

* User login and signup
* Role-based access (Admin, Analyst, Viewer)
* Viewing financial data on dashboard
* Viewing and filtering transaction records
* Admin actions for managing users and records

---

## Role Behavior (UI)

* **Viewer** → Can only see dashboard analytics
* **Analyst** → Can view dashboard + transaction records (read-only)
* **Admin** → Full access (manage records and users)

The UI adjusts automatically based on the logged-in user’s role. The first-ever user sign-up in the Database results in ADMIN role automatically being assigned. Future user registrations will default to the VIEWER role and can be updated by an admin later (as admins can change roles/status).

---

## Main Screens

* **Dashboard** → summary (income, expense, balance), trends, categories
* **Transactions** → list of financial records with filters
* **Users (Admin only)** → manage user roles and status

---

## Tech Used

* React (Vite)
* Context API (auth state)
* API calls to backend

---

## Setup

```bash
npm install
npm run dev
```

Create `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## Notes

* Frontend depends on backend APIs running locally
* Focus is on functionality and role-based behavior
* Simplified UI elements relevant to the assignment instead of complex UI

---

## Demo Users

ADMIN
aman.admin1@gmail.com - abc123

ANALYST
aman.analyst1@gmail.com	- 654321 

VIEWER
aman.viewer1@gmail.com - 654321

---

## Final Summary

This frontend is kept simple and aligned with the backend requirements by focusing on correct data flow, role-based access, and usability.
