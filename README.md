# GlowGuard — Skincare Routine & Chemical Safety (React + Tailwind)

### Built With & Tech Stack

![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![XAMPP](https://img.shields.io/badge/XAMPP-FB7A24?style=for-the-badge&logo=xampp&logoColor=white)

Frontend-only implementation of the GlowGuard web application, ready to plug into a
PHP + MySQL backend by flipping a single environment flag.

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

## Getting started (no backend needed)
```bash
npm install
npm run dev        # http://localhost:5173
```
The app runs out of the box against a localStorage "mock database" seeded with the
demo shelf from the screenshots (Celeteque, Rhode, Hello Glow, etc.).

## Connecting the PHP + MySQL backend later
1. Copy `.env.example` → `.env`:
   ```
   VITE_API_URL=http://localhost/glowguard-backend/api
   VITE_USE_MOCK=false
   ```
2. Point `VITE_API_URL` at your PHP folder (or use the Vite proxy already stubbed in
   `vite.config.js`).
3. Implement the endpoints listed at the top of **`src/api/client.js`** — the exact
   request/response contract for every PHP script is documented there. Every service
   function in `src/api/services.js` already calls the matching endpoint when
   `VITE_USE_MOCK=false` and sends `Authorization: Bearer <token>` once your PHP
   auth issues one.

## Suggested MySQL tables
```sql
users        (id, name, email, password_hash, skin_type, created_at)
products     (id, user_id, name, category, time_of_day, created_at)
product_actives (product_id, ingredient_id)
ingredients  (id, name)
clash_rules  (id, active_a, active_b, message)
routines     (id, user_id, routine_date, product_id, completed, position)
tracker      (id, user_id, track_date, completed_count, total)
```

## Project structure
```
src/
  api/
    client.js       Axios instance + endpoint contract (PHP-ready)
    services.js     All data access — mock or real, switched by VITE_USE_MOCK
    seed.js         Demo data: products, ingredients, clash rules
  context/
    AppContext.jsx  Global state (user, products, rules, toast)
  components/
    Navbar.jsx  Modal.jsx  ProductForm.jsx
  pages/
    Landing.jsx  Auth.jsx  Routine.jsx  Shelf.jsx
    Tracker.jsx  Account.jsx  Admin.jsx
```

## Auth page

The `/auth` route now contains the React + Tailwind port of `log3.html`, including the desktop Sign In/Sign Up sliding panel, mobile switch, password visibility toggles, Remember Me, Forgot Password toast, Google placeholder action, and compatibility with the existing localStorage/mock authentication flow.
