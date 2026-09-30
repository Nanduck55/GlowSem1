-- Run this ONCE on an existing `glowguard` database (phpMyAdmin -> SQL tab)
-- if you need the new Beauty Consultant role. Written for XAMPP's MariaDB.
--
-- Fresh installs don't need it: schema.sql already stores `role` as a plain
-- VARCHAR(45), which already accepts 'consultant'.
--
-- If you previously ran 001_admin_roles.sql, `role` is an
-- ENUM('user','admin') and will REJECT 'consultant' until you widen it.
-- This statement is safe either way — it just (re)defines the column as a
-- plain VARCHAR, which accepts 'user', 'admin', 'consultant', or any future
-- role, without needing another migration next time.

USE glowguard;

ALTER TABLE users
  MODIFY COLUMN role VARCHAR(45) NOT NULL DEFAULT 'user';

-- Turn an existing account into a Beauty Consultant (change the email to
-- theirs). Prefer running glowguard-backend/create-consultant.php instead —
-- it also sets a fresh password — but this works too if you just need the
-- role flipped:
-- UPDATE users SET role = 'consultant' WHERE email = 'consultant@example.com';
