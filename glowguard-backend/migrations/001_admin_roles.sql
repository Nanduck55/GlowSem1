-- Run this ONCE on an existing `glowguard` database (phpMyAdmin -> SQL tab).
-- Fresh installs don't need it: schema.sql already includes these columns.
-- Written for XAMPP's MariaDB. On MySQL, remove the "IF NOT EXISTS" parts
-- (MySQL doesn't support them for ADD COLUMN) and run each line once.

USE glowguard;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role   ENUM('user','admin')         NOT NULL DEFAULT 'user' AFTER skin_goal,
  ADD COLUMN IF NOT EXISTS status ENUM('active','deactivated') NOT NULL DEFAULT 'active' AFTER role;

-- Make yourself an admin (change the email to your own account's):
-- UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
