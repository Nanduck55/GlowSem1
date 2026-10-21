-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 21, 2026 at 03:58 PM
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
(9, 'Salicylic Acid', 'BHA exfoliator for acne and oil control');

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

INSERT INTO `auth_tokens` (`token_id`, `user_id`, `token`, `created_at`, `expires_at`) VALUES
(1, 25, '772afb9ba292958eb3b4d046f4817495cd9761f52a481efa016abce597918576', '2026-10-18 07:25:56', '2026-11-17 07:25:56'),
(2, 27, '8489f55fc6827f36f5bc372729c610f68ef6f34bd248ff3bdb93e05498c8fb64', '2026-10-18 07:25:59', '2026-11-17 07:25:59'),
(3, 27, '5a2181bedee62dc38ffe63723014b22ce9ef148456d9646917cc09b323da912f', '2026-10-18 07:26:08', '2026-11-17 07:26:08'),
(9, 28, '39abed3335fc06835c0118e4aa346b06cba0566810c1ea8dbfd0c7018a2b0554', '2026-10-21 12:57:22', '2026-11-20 12:57:22');

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
  `user_id` int(11) DEFAULT NULL,
  `product_name` varchar(150) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `is_custom` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `user_id`, `product_name`, `brand`, `category`, `is_custom`) VALUES
(37, NULL, 'Gentle Hydrating Cleanser', 'GlowGuard Essentials', 'Cleanser', 0),
(38, NULL, 'Daily Barrier Moisturizer', 'GlowGuard Essentials', 'Moisturizer', 0),
(39, NULL, 'Niacinamide Brightening Serum', 'GlowGuard Essentials', 'Serum', 0),
(40, NULL, 'Soothing Centella Toner', 'GlowGuard Essentials', 'Toner', 0),
(41, NULL, 'Broad Spectrum Sunscreen SPF 50', 'GlowGuard Essentials', 'Sunscreen', 0),
(42, NULL, 'banana', NULL, 'Serum', 0),
(44, NULL, 'Black Soap', NULL, 'Other', 1),
(45, NULL, 'banana', NULL, 'Serum', 1),
(46, NULL, 'Clitique', NULL, 'Cleanser', 1),
(47, NULL, 'baanaaa', NULL, 'Moisturizer', 1),
(51, NULL, 'Its a Pineaple juice', NULL, 'Sunscreen', 0),
(52, NULL, 'Its a Pineaple juice', NULL, 'Sunscreen', 1);

-- --------------------------------------------------------

--
-- Table structure for table `product_ingredients`
--

CREATE TABLE `product_ingredients` (
  `product_id` int(11) NOT NULL,
  `ingredient_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_ingredients`
--

INSERT INTO `product_ingredients` (`product_id`, `ingredient_id`) VALUES
(44, 7),
(45, 5),
(46, 4),
(52, 6);

-- --------------------------------------------------------

--
-- Table structure for table `product_recommendations`
--

CREATE TABLE `product_recommendations` (
  `recommendation_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `skin_type` varchar(45) NOT NULL,
  `star_ingredient_id` int(11) DEFAULT NULL,
  `recommendation_note` text NOT NULL,
  `is_visible` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_recommendations`
--

INSERT INTO `product_recommendations` (`recommendation_id`, `product_id`, `skin_type`, `star_ingredient_id`, `recommendation_note`, `is_visible`, `created_at`) VALUES
(23, 42, 'Oily', NULL, 'its a banana for testing', 1, '2026-10-11 15:11:10'),
(24, 51, 'Dry', 6, 'Idk if youre supposed to put pineaple juice on your face but yeah!', 1, '2026-10-21 12:56:46');

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

INSERT INTO `routines` (`routine_id`, `user_id`, `routine_name`, `routine_type`) VALUES
(22, 27, '__shelf_PM__', 'PM'),
(23, 27, '2026-10-18', 'daily'),
(24, 27, '2026-10-18', 'PM'),
(25, 28, '__shelf_AM__', 'AM'),
(26, 28, '__shelf_PM__', 'PM'),
(27, 28, '2026-10-22', 'daily'),
(28, 28, '2026-10-26', 'daily'),
(29, 28, '2026-10-22', 'removed_PM'),
(30, 28, '2026-10-21', 'daily'),
(31, 28, '2026-10-23', 'daily'),
(32, 28, '2026-10-27', 'daily');

-- --------------------------------------------------------

--
-- Table structure for table `routine_logs`
--

CREATE TABLE `routine_logs` (
  `log_id` int(11) NOT NULL,
  `completed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `routine_product_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `routine_logs`
--

INSERT INTO `routine_logs` (`log_id`, `completed_at`, `routine_product_id`) VALUES
(6, '2026-10-18 07:27:16', 51);

-- --------------------------------------------------------

--
-- Table structure for table `routine_products`
--

CREATE TABLE `routine_products` (
  `routine_product_id` int(11) NOT NULL,
  `routine_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `step_order` int(11) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `target_days` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`target_days`)),
  `status` varchar(20) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `routine_products`
--

INSERT INTO `routine_products` (`routine_product_id`, `routine_id`, `product_id`, `step_order`, `start_date`, `duration`, `target_days`, `status`) VALUES
(49, 22, 44, 0, NULL, NULL, NULL, 'active'),
(50, 23, 44, 1, NULL, NULL, NULL, 'active'),
(51, 24, 44, 0, NULL, NULL, NULL, 'active'),
(52, 25, 45, 0, NULL, NULL, NULL, 'active'),
(53, 26, 45, 0, NULL, NULL, NULL, 'active'),
(54, 27, 45, 1, NULL, NULL, NULL, 'active'),
(55, 28, 45, 1, NULL, NULL, NULL, 'active'),
(58, 30, 46, 1, NULL, NULL, NULL, 'active'),
(59, 26, 46, 0, NULL, NULL, NULL, 'active'),
(60, 25, 47, 0, NULL, NULL, NULL, 'active'),
(61, 30, 47, 2, NULL, NULL, NULL, 'active'),
(62, 27, 47, 2, NULL, NULL, NULL, 'active'),
(63, 31, 47, 1, NULL, NULL, NULL, 'active'),
(64, 28, 47, 2, NULL, NULL, NULL, 'active'),
(65, 32, 47, 1, NULL, NULL, NULL, 'active'),
(66, 25, 52, 0, NULL, NULL, NULL, 'active'),
(67, 26, 52, 0, NULL, NULL, NULL, 'active'),
(68, 30, 52, 3, NULL, NULL, NULL, 'active');

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

INSERT INTO `users` (`user_id`, `full_name`, `email`, `password_hash`, `role`, `skin_type`, `routine_goal`, `status`, `date_joined`) VALUES
(25, 'Rainan', 'admin@glowguard.com', '$2y$10$Qernta4ScsdvE/xAi0r9ROL1MVGEYaRZGLXPgKB/CpA6HWkjmEOia', 'admin', NULL, NULL, 'active', '2026-10-17 16:10:18'),
(26, 'Bryan', 'consultant@gmail.com', '$2y$10$zxtf9s0cM25Dwlunhc7qLOK1EOy4CWf7AYtwkP9ji/x4q8Lz5yCdi', 'consultant', NULL, NULL, 'active', '2026-10-17 16:10:37'),
(27, 'Gyle', 'gyleguerzo@gmail.com', '$2y$10$9Bz2GAkvshEE6Ad1F8DBwu/TChjkg9abmCOnPo.hC/QkHksBMiZ8y', 'user', 'Normal Skin', NULL, 'active', '2026-10-18 07:25:59'),
(28, 'Rainan Orte', 'rainanorte61@gmail.com', '$2y$10$Fi1dAwM.rp/sC7ArVeEy8OTdMS3WdIcEi6ozSADquux2Dq7lYG60.', 'user', 'Dry Skin', NULL, 'active', '2026-10-20 09:54:35');

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
-- Dumping data for table `user_products`
--

INSERT INTO `user_products` (`user_product_id`, `user_id`, `product_id`, `added_at`) VALUES
(27, 27, 44, '2026-10-18 07:27:11'),
(28, 28, 45, '2026-10-21 05:03:26'),
(29, 28, 46, '2026-10-21 05:10:37'),
(30, 28, 47, '2026-10-21 05:12:14'),
(31, 28, 52, '2026-10-21 12:58:07');

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
  ADD KEY `fk_products_user` (`user_id`);

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
  ADD KEY `fk_recommendations_product` (`product_id`),
  ADD KEY `fk_recommendations_ingredient` (`star_ingredient_id`);

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
  MODIFY `token_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `ingredient_clash_rules`
--
ALTER TABLE `ingredient_clash_rules`
  MODIFY `rule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `reset_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `product_recommendations`
--
ALTER TABLE `product_recommendations`
  MODIFY `recommendation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `routines`
--
ALTER TABLE `routines`
  MODIFY `routine_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `routine_logs`
--
ALTER TABLE `routine_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `routine_products`
--
ALTER TABLE `routine_products`
  MODIFY `routine_product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `user_products`
--
ALTER TABLE `user_products`
  MODIFY `user_product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

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
  ADD CONSTRAINT `fk_products_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `fk_recommendations_ingredient` FOREIGN KEY (`star_ingredient_id`) REFERENCES `active_ingredients` (`ingredient_id`) ON DELETE SET NULL ON UPDATE CASCADE,
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
