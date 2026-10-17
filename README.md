# GlowGuard 🌿✨

> **Smart Skincare Routine Tracking & Active Ingredient Safety System**

GlowGuard is a full-stack web application designed to help users curate personalized skincare routines, track personal product inventories, and avoid hazardous active ingredient contraindications. Combining a modern **React** user interface with a robust **PHP / MySQL** backend, GlowGuard balances user-centric routine scheduling with enterprise-grade data lifecycle protection and role-based administration.

## 🛡️ Tech Stack & Badges

### Core Technologies
![Static Badge](https://img.shields.io/badge/Tailwind%20-%20%2306B6D4?logo=tailwindcss)
![Static Badge](https://img.shields.io/badge/PHP%20-%208.x%2B%20-%20%23777BB4%20?logo=php)
![Static Badge](https://img.shields.io/badge/Mysql%20-%20Database%20-%20%23777BB4%20?logo=mysql)
![Static Badge](https://img.shields.io/badge/React%20-%20Framework%20-%20%2361DAFB%20?logo=react)
![Static Badge](https://img.shields.io/badge/MariaDB%20-%20Database%20-%20%23003545?logo=mariadb)\
![Static Badge](https://img.shields.io/badge/PHP%20Mailer%20-%20OTP%20-%20%23003545?logo=php)



---

## 📌 Problem Statement & Project Overview

Modern skincare regimens frequently involve potent active ingredients such as **Retinoids (Adapalene, Tretinoin)**, **Direct Acids (AHA/BHA, Salicylic Acid)**, and **Vitamin C (L-Ascorbic Acid)**. Applying incompatible active chemical pairings at the same time can cause severe skin barrier breakdown, chemical burns, or render treatments ineffective.

### How GlowGuard Solves This:
1. **Automated Active Ingredient Clash Engine:** Scans scheduled products in a user's routine to detect incompatible active pairings before application.
2. **Frequency-Aware Scheduling:** Allows users to safely alternate strong actives across different days of the week (e.g., Retinoids on Mon/Wed/Fri vs. Exfoliants on Tue/Thu) or time slots (AM vs. PM), preventing false-positive clash alerts.
3. **Dual-Catalog Management:** Combines a verified master product catalog maintained by professional consultants with private custom products added by standard users.

---

## 🌟 Features by User Role

### 👤 Standard Users (End-Users)
* **Skin Profile & Goal Tracking:** Tailors routines based on skin type (Oily, Dry, Combination, Sensitive) and skin concerns.
* **Digital Bathroom Shelf (`user_products`):** A personal digital inventory allowing users to save catalog items to their shelf without duplicating global database rows.
* **Custom Product Creation:** Enables users to create private custom products (`is_custom = 1`) exclusively for their account.
* **Smart Routine Builder:**
  * Categorizes routine steps into **AM**, **PM**, or **Both**.
  * Assigns weekly frequency presets (*Everyday*, *Weekdays*, *2x a Week*, or specific days like *Mon/Wed/Fri*).
  * Sets usage durations (*Until I remove it* or timed treatment periods).
* **Real-Time Contraindication Warnings:** Evaluates active routines on target days and displays warnings if conflicting active ingredients overlap.

### 👩‍⚕️ Consultants (Skincare Experts / Content Managers)
* **Master Catalog Management:** Adds and verifies official skincare products in the master library.
* **Active Ingredient Mapping:** Tags active chemical compounds on catalog items to feed the safety clash engine.
* **Clash Rules Configuration:** Defines safety rule pairings between active chemical groups to protect users platform-wide.

### 👑 Admins (System Administrators)
* **User Oversight Dashboard:** Manages registered accounts, tracks platform metrics, and oversees catalog integrity.
* **Role Promotion & Elevation:** Securely promotes standard users to Consultant or Admin roles.
* **System Audit Logging:** Monitors catalog updates and user lifecycle activities.

---

## 📐 System Architecture & Database Integrity

### 1. Catalog Protection Architecture (`products.user_id`)
To manage both verified catalog products and private user items in a single normalized table without risking master catalog corruption during user account deletion:
* **Custom User Items (`user_id = [INT]`):** Linked directly to the creator's `user_id`. Configured with **`ON DELETE CASCADE`** so deleting a user account automatically cleans up their private items.
* **Official Catalog Items (`user_id = NULL`):** Belong to the global platform. Because `NULL` never matches a deleted integer ID, `NULL` serves as an **architectural shield** that prevents `ON DELETE CASCADE` from wiping master catalog data during account deletion.

### 2. Authorship Audit Trail (`created_by`)
* Tracks which staff member added a catalog item using `created_by` referencing `users(user_id)` with **`ON DELETE SET NULL`**.
* If a consultant or admin account is deleted, the product remains active in the global catalog while `created_by` safely reverts to `NULL`.

### 3. Application Security Layers
* **Strict Role Separation:** Public registration forms default strictly to `role = 'user'`. Higher-tier roles (`consultant`, `admin`) are isolated from public signup endpoints.
* **SQL Injection Prevention:** All PHP API endpoints use **PDO Prepared Statements** with parameterized inputs.
* **Cross-Site Scripting (XSS) Defense:** React JSX handles DOM rendering, automatically escaping untrusted text inputs.
* **Password Hashing:** Passwords are encrypted using PHP's native `password_hash()` (Bcrypt/Argon2).

---

## 🗄️ Database Schema Overview (`glowguard_db`)

**users:** Stores core account profiles, login credentials, assigned roles (admin, consultant, user), skin types, and account status.
**auth_tokens:** Manages active user authentication sessions and token expiration timestamps.
**password_resets:** Stores temporary security tokens and expiration dates for password recovery requests.
**products:** Unified product repository containing both verified global catalog items (user_id = NULL) and private custom items (user_id assigned).
**user_products:** Represents a user's digital bathroom shelf, mapping saved products to individual accounts without duplicating catalog data.
**product_recommendations:** Stores consultant-curated product suggestions, skin type tags, and targeted notes.
**routines:** Defines personalized routine containers created by users (e.g., "Morning Refresh", "Nightly Treatment").
**routine_products:** Links products to specific routines, defining step ordering, application frequency, and targeted time slots (AM/PM).
**routine_logs:** Logs historical execution records every time a user completes a routine step.
**active_ingredients:** Master dictionary of skincare chemical compounds (e.g., Retinoids, Vitamin C, Salicylic Acid).
**product_ingredients:** Junction table mapping products to their constituent active ingredients.
**ingredient_clash_rules:** Stores contraindication safety rules, conflict severity ratings, and warning notes between incompatible active ingredient pairs.
---

## 🚀 Setup & Installation Guide

### Prerequisites
* **XAMPP** (Apache, PHP 8.x, MySQL/MariaDB)
* **Node.js** (v16.x or higher) & **npm**

---

### Step 1: Database Initialization

1. Open the **XAMPP Control Panel** and start **Apache** and **MySQL**.
2. Navigate to phpMyAdmin in your browser: `http://localhost/phpmyadmin/`.
3. Create a new database named **`glowguard_db`** with collation set to `utf8mb4_general_ci`.
4. Import your SQL schema dump into `glowguard_db`.

---

### Step 2: Seed Initial Admin & Consultant Accounts

Because elevated roles (`admin`, `consultant`) cannot be registered through the public UI without confirmation code, seed the initial administrative accounts using XAMPP's PHP CLI:

#### 1. Create Initial Admin Account
```cmd
C:\xampp\php\php.exe create-admin.php admin@glowguard.com "Rainan" "glowadmin"
```

#### 2. Create Initial Consultant Account
```cmd
C:\xampp\php\php.exe create-consultant.php consultant@gmail.com "Bryan" "glowconsult"
```

---

### Step 3: Frontend Setup & `.env` Configuration

1. Open a terminal and navigate to the frontend application folder:
   ```bash
   cd glowguard-frontend
   ```
2. Create the frontend environment configuration file:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and point to your local PHP backend endpoint:
   ```env
   REACT_APP_API_URL=http://localhost/glowguard-api
   ```
4. Install npm dependencies:
   ```bash
   npm install
   ```
5. Launch the React development server:
   ```bash
   npm run dev
   ```
6. Access GlowGuard in your browser at `http://localhost:3000`.

---

## 👥 Default Seeded System Credentials

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@glowguard.com` | `glowadmin` | User Management, Role Elevation, Platform Analytics |
| **Consultant** | `consultant@gmail.com` | `glowconsult` | Official Catalog Curation & Active Ingredient Safety Rules |
| **Standard User** | *(Public Register)* | *(User Defined)* | Digital Bathroom Shelf, Custom Items, Routine Scheduling |


## 👥 Group Members
1. Jordan Escano - Frontend Developer (React, Tailwind, Javascript)
2. Bryan Josef Sarmiento - Lead Designer and Database Overseer (Figma, Mysql)
3. Rainan Orte - Backend Developer and Database Manager (PHP, Mysql)
4. Chirelou Quinto - Documenter 1 
5. Markrain Rodolfo - Tester
6. John Jefferson - Documenter 2