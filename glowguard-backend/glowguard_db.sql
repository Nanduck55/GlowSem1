-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 07, 2026 at 07:25 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `glowguard_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `active_ingredients`
--

CREATE TABLE `active_ingredients` (
  `ingredient_id` int(11) NOT NULL,
  `ingredient_name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `active_ingredients`
--

INSERT INTO `active_ingredients` (`ingredient_id`, `ingredient_name`, `description`) VALUES
(1, 'Hyaluronic Acid', 'Provides hydration and holds moisture in the skin.'),
(2, 'Retinol', 'Promotes cell turnover and stimulates collagen production.'),
(3, 'Salicylic Acid / BHA', 'Exfoliates inside pores to clear acne and excess oil.'),
(4, 'Glycolic Acid', 'Surface AHA exfoliant that improves skin texture and brightness.'),
(5, 'Centella', 'Soothes inflammation and repairs damaged skin barrier.'),
(6, 'Vitamin C', 'Antioxidant that brightens skin tone and fades hyperpigmentation.'),
(7, 'Niacinamide', 'Regulates oil production and reduces redness.'),
(8, 'None', 'No active ingredient.'),

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

--
-- Dumping data for table `auth_tokens`
--


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

--
-- Dumping data for table `ingredient_clash_rules`
--

INSERT INTO `ingredient_clash_rules` (`rule_id`, `ingredient_id_1`, `ingredient_id_2`, `warning_text`, `severity_level`, `last_updated`, `source_reference`) VALUES
(17, 9, 2, 'Combining Salicylic Acid (BHA) with Retinol can lead to excessive skin dryness, peeling, and barrier damage.', 'High', '2026-09-29 16:14:21', 'Dermatology Guidelines'),
(18, 6, 9, 'Using Vitamin C directly with Salicylic Acid may cause redness and reduce the effectiveness of Vitamin C due to low pH.', 'Moderate', '2026-09-29 16:14:21', 'Dermatology Guidelines'),
(36, 7, 6, 'Combining high concentrations of Niacinamide and Vitamin C can cause temporary facial flushing and skin irritation. Consider using Vitamin C in the morning and Niacinamide at night.', 'Moderate Risk', '2026-09-30 18:36:18', 'Dermatology Guidelines'),
(37, 4, 3, 'Layering Glycolic Acid (AHA) with Salicylic Acid (BHA) can over-exfoliate the skin, compromising the natural moisture barrier and leading to extreme dryness or peeling.', 'High Risk', '2026-09-30 18:36:18', 'Dermatology Guidelines'),
(38, 4, 9, 'Layering Glycolic Acid (AHA) with Salicylic Acid (BHA) can over-exfoliate the skin, compromising the natural moisture barrier and leading to extreme dryness or peeling.', 'High Risk', '2026-09-30 18:36:18', 'Dermatology Guidelines'),
(40, 4, 6, 'Using AHAs like Glycolic Acid alongside Vitamin C can alter skin pH levels, destabilizing the antioxidant efficacy and causing burning or stinging sensations.', 'Moderate Risk', '2026-09-30 18:36:18', 'Dermatology Guidelines'),
(41, 2, 3, 'Combining Retinol with Salicylic Acid dramatically increases the risk of severe dryness, flaking, and skin barrier breakage.', 'High Risk', '2026-09-30 18:36:18', 'Dermatology Guidelines'),
(42, 2, 4, 'Combining Retinol with AHAs like Glycolic Acid causes severe chemical exfoliation overlap, increasing skin sensitivity to sunlight and raw irritation.', 'High Risk', '2026-09-30 18:36:18', 'Dermatology Guidelines'),
(43, 2, 6, 'Retinol and Vitamin C operate at different optimal pH levels. Applying them simultaneously deactivates active properties and risks skin redness.', 'Moderate Risk', '2026-09-30 18:36:18', 'Dermatology Guidelines');

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
-- Table structure for table `product_recommendations`
--

CREATE TABLE `product_recommendations` (
  `recommendation_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `skin_type` varchar(45) NOT NULL,
  `star_ingredient` varchar(100) DEFAULT '',
  `recommendation_note` text NOT NULL,
  `is_visible` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
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

--
-- Dumping data for table `routines`
--



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
  `role` varchar(45) NOT NULL DEFAULT 'user',
  `skin_type` varchar(45) DEFAULT NULL,
  `routine_goal` varchar(100) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `date_joined` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--


-- --------------------------------------------------------

--
-- Table structure for table `user_products`
--

CREATE TABLE `user_products` (
  `user_product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
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
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `product_ingredients`
--
ALTER TABLE `product_ingredients`
  ADD PRIMARY KEY (`product_id`,`ingredient_id`),
  ADD KEY `ingredient_id` (`ingredient_id`);

--
-- Indexes for table `product_recommendations`
--
ALTER TABLE `product_recommendations`
  ADD PRIMARY KEY (`recommendation_id`),
  ADD KEY `fk_recommendations_product` (`product_id`);

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
-- Indexes for table `user_products`
--
ALTER TABLE `user_products`
  ADD PRIMARY KEY (`user_product_id`),
  ADD KEY `fk_user_products_user` (`user_id`),
  ADD KEY `fk_user_products_product` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `active_ingredients`
--
ALTER TABLE `active_ingredients`
  MODIFY `ingredient_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `auth_tokens`
--
ALTER TABLE `auth_tokens`
  MODIFY `token_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `ingredient_clash_rules`
--
ALTER TABLE `ingredient_clash_rules`
  MODIFY `rule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `reset_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `product_recommendations`
--
ALTER TABLE `product_recommendations`
  MODIFY `recommendation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `routines`
--
ALTER TABLE `routines`
  MODIFY `routine_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `routine_logs`
--
ALTER TABLE `routine_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `routine_products`
--
ALTER TABLE `routine_products`
  MODIFY `routine_product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `user_products`
--
ALTER TABLE `user_products`
  MODIFY `user_product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

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
-- Constraints for table `product_ingredients`
--
ALTER TABLE `product_ingredients`
  ADD CONSTRAINT `product_ingredients_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_ingredients_ibfk_2` FOREIGN KEY (`ingredient_id`) REFERENCES `active_ingredients` (`ingredient_id`) ON DELETE CASCADE;

--
-- Constraints for table `product_recommendations`
--
ALTER TABLE `product_recommendations`
  ADD CONSTRAINT `fk_recommendations_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

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

--
-- Constraints for table `user_products`
--
ALTER TABLE `user_products`
  ADD CONSTRAINT `fk_user_products_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_products_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
