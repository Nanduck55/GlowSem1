# GlowGuard — Skincare Routine & Chemical Safety (React + Tailwind)

[![PHP](https://img.shields.io/badge/PHP-7.4%20%7C%208.x-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)
[![MariaDB](https://img.shields.io/badge/MariaDB-10.4+-003545?style=for-the-badge&logo=mariadb&logoColor=white)](https://mariadb.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
[![Build Status](https://img.shields.io/badge/Master_Build-NIGHTLY-blue?style=for-the-badge)](./TEST_PROTOCOL.md)

An end-to-end web platform engineered to analyze skincare routines, cross-reference active chemical ingredients, and prevent adverse skin reactions using automated conflict detection.

## Features implemented
- **AM/PM Routine Builder** — weekly date picker, per-date routines, reorderable list
  items (edit / remove / delete via the ⋯ menu), AM/PM/Both usage tags.
- **Chemical Clash Detection** — a rules engine (`findClashes`) evaluates each routine
  against the clash-rule table and shows live "Routine Safety" alerts
  (e.g. *Retinol + Salicylic Acid/BHA*).
- **Digital Product Shelf** — CRUD for products with category, time-of-day and actives,
  plus category filtering.
- **Routine Tracker** — 28-day completion heat-map with full/partial-day statistics.
- **User Accounts** — register / login / profile / logout, route-protected pages.
- **Admin Management** — ingredient dictionary CRUD + safety clash-rule CRUD.
- **Responsive UI** — mobile nav, adaptive grids, Tailwind design system matching the
  green GlowGuard theme.

---

## 🛠 System Architecture & Stack

* **Frontend:** React.js (SPA, JSX component routing, state management)
* **Backend API:** PHP (PDO Prepared Statements, CORS Preflight Handlers, JSON REST Protocol)
* **Database:** MariaDB / MySQL (10-table normalized relational schema)
* **API Testing Suite:** Thunder Client / cURL Matrix

---

## 🗄 Database Schema Overview

The engine operates on a normalized 10-table architecture in `glowguard_db`:

1. `active_ingredients` — Master registry of chemical active ingredients
2. `ingredient_clash_rules` — Core chemical conflict matrix and severity mapping
3. `products` — Skincare product catalog items
4. `product_ingredients` — Many-to-many junction mapping products to ingredients
5. `routines` — User-created skincare routine routines
6. `routine_products` — Junction mapping routines to catalog products
7. `routine_logs` — Activity tracking and compatibility execution logs
8. `users` — User authentication profiles
9. `auth_tokens` — Active API session management
10. `password_resets` — Secure recovery verification workflow

---

## 🧪 Quality Assurance & Test Verification

The backend has been verified against 7 core API protocol layers:

| Test ID | Category | Target Layer | Expected Result |
| :--- | :--- | :--- | :--- |
| **TEST-01** | Web Pipeline & JSON Contract | HTTP / Application | `200 OK` (Strict JSON) |
| **TEST-02** | Preflight CORS Handshake | Protocol | `204 No Content` / `200 OK` |
| **TEST-03** | SQL Injection Defense | Data / Security | `401 Unauthorized` / Blocked |
| **TEST-04** | HTTP Verb Enforcement | Routing | `405 Method Not Allowed` |
| **TEST-05** | Payload Validation | Processing | `400 Bad Request` |
| **TEST-06** | XSS & Input Sanitization | Input Safety / DOM | Safe Escaped String |
| **TEST-07** | Route Protection | Auth Guard | `401 Unauthorized` |

*For complete step-by-step reproduction instructions, refer to [`TEST_PROTOCOL.md`](./TEST_PROTOCOL.md).*

---

## 🚀 Setup & Installation

1. Clone repository to your local web server directory (`xampp/htdocs/`):
   ```bash
   git clone [https://github.com/Nanduck55/GlowSem1.git](https://github.com/Nanduck55/GlowSem1.git)

