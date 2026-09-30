-- Database: `glowguard_db`

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
--
-- Table structure for table `active_ingredients`
--

CREATE TABLE `active_ingredients` (
  `ingredient_id` int(11) NOT NULL,
  `ingredient_name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_tokens`
--

CREATE TABLE `auth_tokens` (
  `token_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ingredient_clash_rules`
--

CREATE TABLE `ingredient_clash_rules` (
  `rule_id` int(11) NOT NULL,
  `ingredient_id_1` int(11) DEFAULT NULL,
  `ingredient_id_2` int(11) DEFAULT NULL,
  `warning_text` text DEFAULT NULL,
  `severity_level` varchar(45) DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `source_reference` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `reset_id` int(11) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_name` varchar(150) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `is_custom` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_ingredients`
--

CREATE TABLE `product_ingredients` (
  `product_id` int(11) NOT NULL,
  `ingredient_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `routines`
--

CREATE TABLE `routines` (
  `routine_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `routine_name` varchar(100) DEFAULT NULL,
  `routine_type` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `routine_logs`
--

CREATE TABLE `routine_logs` (
  `log_id` int(11) NOT NULL,
  `completed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `routine_product_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `routine_products`
--

CREATE TABLE `routine_products` (
  `routine_product_id` int(11) NOT NULL,
  `routine_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `step_order` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` varchar(45) DEFAULT NULL,
  `skin_type` varchar(45) DEFAULT NULL,
  `routine_goal` varchar(100) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `date_joined` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `active_ingredients`
--
ALTER TABLE `active_ingredients`
  ADD PRIMARY KEY (`ingredient_id`);

--
-- Indexes for table `auth_tokens`
--
ALTER TABLE `auth_tokens`
  ADD PRIMARY KEY (`token_id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `auth_tokens_ibfk_1` (`user_id`);

--
-- Indexes for table `ingredient_clash_rules`
--
ALTER TABLE `ingredient_clash_rules`
  ADD PRIMARY KEY (`rule_id`),
  ADD KEY `ingredient_id_1` (`ingredient_id_1`),
  ADD KEY `ingredient_id_2` (`ingredient_id_2`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`reset_id`),
  ADD KEY `email` (`email`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `product_ingredients`
--
ALTER TABLE `product_ingredients`
  ADD PRIMARY KEY (`product_id`,`ingredient_id`),
  ADD KEY `ingredient_id` (`ingredient_id`);

--
-- Indexes for table `routines`
--
ALTER TABLE `routines`
  ADD PRIMARY KEY (`routine_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `routine_logs`
--
ALTER TABLE `routine_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `routine_product_id` (`routine_product_id`);

--
-- Indexes for table `routine_products`
--
ALTER TABLE `routine_products`
  ADD PRIMARY KEY (`routine_product_id`),
  ADD KEY `routine_id` (`routine_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `active_ingredients`
--
ALTER TABLE `active_ingredients`
  MODIFY `ingredient_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_tokens`
--
ALTER TABLE `auth_tokens`
  MODIFY `token_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ingredient_clash_rules`
--
ALTER TABLE `ingredient_clash_rules`
  MODIFY `rule_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `reset_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `routines`
--
ALTER TABLE `routines`
  MODIFY `routine_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `routine_logs`
--
ALTER TABLE `routine_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `routine_products`
--
ALTER TABLE `routine_products`
  MODIFY `routine_product_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `auth_tokens`
--
ALTER TABLE `auth_tokens`
  ADD CONSTRAINT `auth_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `ingredient_clash_rules`
--
ALTER TABLE `ingredient_clash_rules`
  ADD CONSTRAINT `ingredient_clash_rules_ibfk_1` FOREIGN KEY (`ingredient_id_1`) REFERENCES `active_ingredients` (`ingredient_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ingredient_clash_rules_ibfk_2` FOREIGN KEY (`ingredient_id_2`) REFERENCES `active_ingredients` (`ingredient_id`) ON DELETE CASCADE;

--
-- Constraints for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`email`) REFERENCES `users` (`email`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `product_ingredients`
--
ALTER TABLE `product_ingredients`
  ADD CONSTRAINT `product_ingredients_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_ingredients_ibfk_2` FOREIGN KEY (`ingredient_id`) REFERENCES `active_ingredients` (`ingredient_id`) ON DELETE CASCADE;

--
-- Constraints for table `routines`
--
ALTER TABLE `routines`
  ADD CONSTRAINT `routines_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `routine_logs`
--
ALTER TABLE `routine_logs`
  ADD CONSTRAINT `routine_logs_ibfk_1` FOREIGN KEY (`routine_product_id`) REFERENCES `routine_products` (`routine_product_id`) ON DELETE CASCADE;

--
-- Constraints for table `routine_products`
--
ALTER TABLE `routine_products`
  ADD CONSTRAINT `routine_products_ibfk_1` FOREIGN KEY (`routine_id`) REFERENCES `routines` (`routine_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `routine_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;
COMMIT;


-- ------------------------------------------------------------------
-- Starter reference data only (NOT demo/mock user data — no users or
-- products are seeded; every account starts with an empty shelf).
-- Safe to edit or delete from the /admin page once the app is running.
-- Safe to run more than once: nothing is duplicated on re-import.
-- Targets the real glowguard_db tables: active_ingredients and
-- ingredient_clash_rules (which links ingredients by ID).
-- ------------------------------------------------------------------
SET NAMES utf8mb4;

-- active_ingredients has no UNIQUE key on ingredient_name, so INSERT IGNORE
-- would not prevent repeats. Each name is inserted only if it is missing.
INSERT INTO active_ingredients (ingredient_name)
SELECT v.n
FROM (
  SELECT 'Hyaluronic Acid' AS n
  UNION ALL SELECT 'Retinol'
  UNION ALL SELECT 'Salicylic Acid / BHA'
  UNION ALL SELECT 'Glycolic Acid'
  UNION ALL SELECT 'Centella'
  UNION ALL SELECT 'Vitamin C'
  UNION ALL SELECT 'Niacinamide'
  UNION ALL SELECT 'None'
) AS v
WHERE NOT EXISTS (
  SELECT 1 FROM active_ingredients a
  WHERE a.ingredient_name = v.n COLLATE utf8mb4_general_ci
);

-- Clash rules reference ingredients by ID, so the IDs are looked up by name.
-- A rule is only inserted if that ingredient pair isn't already present.
INSERT INTO ingredient_clash_rules (ingredient_id_1, ingredient_id_2, warning_text)
SELECT a.ingredient_id, b.ingredient_id, v.msg
FROM (
  SELECT 'Retinol' AS n1, 'Salicylic Acid / BHA' AS n2,
         'Retinol + Salicylic Acid/BHA may increase irritation when used together in the same routine.' AS msg
  UNION ALL
  SELECT 'Retinol', 'Glycolic Acid',
         'Retinol + Glycolic Acid (AHA) can over-exfoliate — separate into different routines or alternate days.'
  UNION ALL
  SELECT 'Vitamin C', 'Retinol',
         'Vitamin C + Retinol can be irritating together — use Vitamin C in the AM and Retinol in the PM.'
) AS v
JOIN active_ingredients a ON a.ingredient_name = v.n1 COLLATE utf8mb4_general_ci
JOIN active_ingredients b ON b.ingredient_name = v.n2 COLLATE utf8mb4_general_ci
WHERE NOT EXISTS (
  SELECT 1 FROM ingredient_clash_rules r
  WHERE r.ingredient_id_1 = a.ingredient_id
    AND r.ingredient_id_2 = b.ingredient_id
);
