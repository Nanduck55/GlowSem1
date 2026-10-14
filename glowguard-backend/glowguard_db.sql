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
(1, 1, '10f7a099509555da08eb5177858d873c2812e2ddb26fde949dee2d7bd5675946', '2026-09-21 14:52:36', '2026-10-21 08:52:36'),
(2, 1, '7f6aaa1f06cc163e888c421a0ca5b7d25a361610c91905ed9ec78c4e9c0ba081', '2026-09-21 14:53:52', '2026-10-21 08:53:52'),
(3, 1, '3ca37afe219c495fafedb3263afffb9d8f83536ecbd69e231722eb4033054865', '2026-09-21 14:54:22', '2026-10-21 08:54:22'),
(4, 1, 'ad4532ba6133e0d3bbd4cad74eb53ae7009d421c775e7a81a329a0614eba8139', '2026-09-21 14:54:35', '2026-10-21 08:54:35'),
(5, 1, '015a0bd3d609aca4499075452667fbd99988b50237eaa203fc38423347480198', '2026-09-21 15:02:11', '2026-10-21 09:02:11'),
(6, 1, '4e011ddcb7f3940646a8628906804a88070d9838aea0eb1f99648e91a6f7b049', '2026-09-21 15:02:15', '2026-10-21 09:02:15'),
(7, 1, '26522f03a31170161147faec3f06e5bd2efdb0952b6567541b9184aac371df82', '2026-09-21 15:02:48', '2026-10-21 09:02:48'),
(8, 1, '4dc837102e8ba24dea7a3548f2aaed6c7fbb530eac4f698101bc04464eb08547', '2026-09-21 16:47:49', '2026-10-21 10:47:49'),
(9, 1, 'b49bdf38475af52a4f7f29ec9271229f9f21b58ff1393198f6748c7d7cdf4c2f', '2026-09-21 17:12:47', '2026-10-21 11:12:47'),
(10, 1, '52b42edad99971ce270e00d1ff5d65d68fe3d313d1b149f9d56df1a475189eb6', '2026-09-21 17:41:12', '2026-10-21 11:41:12'),
(13, 1, 'f8b2862f45ba8bc9ae18c26ba01e72e01b7ee8b3e563b04c3cf42bd0907a6bcc', '2026-09-23 12:17:43', '2026-10-23 06:17:43'),
(24, 2, 'b3c5165941022e4ddba1f1809106a756b8fde43b1b24c4ea5b4df35004153223', '2026-09-24 02:35:43', '2026-10-23 20:35:43'),
(30, 5, 'fd56ce1365d17666ce5f711b5729b85f9c02dfe6a0947e8bceadf3d3de79bedf', '2026-09-29 17:13:00', '2026-10-29 17:13:00'),
(34, 6, '98b23b8797ce63b021cd1163108db09291395eeed5672462a1ce3a51346f0ad0', '2026-09-30 23:54:49', '2026-10-30 23:54:49'),
(47, 13, 'b5339bc4452ba1137c04e924579e325eb4dbc84833b25ee3d12e3f53b0d98709', '2026-10-04 14:03:59', '2026-11-03 14:03:59'),
(49, 14, 'e3628886f72759c5d291f4bdf1b400af055d9ed7f842bbe64ccbbb5f8faaa9d1', '2026-10-04 14:10:44', '2026-11-03 14:10:44'),
(57, 18, 'db8b18c9b7da299fc32da680fc339189b22c73021a8c134895f58f0700f2f637', '2026-10-04 14:49:31', '2026-11-03 14:49:31'),
(68, 19, '3981221e41d3e953637dd7e606e3fd71cf51c770d28ed3dbae8fd642c0c43f5d', '2026-10-05 14:40:06', '2026-11-04 14:40:06'),
(71, 20, '5dc47e5d4b00ba41e3f66bcfff31ab18be4583cfe38a9363024077b7876f9cac', '2026-10-06 14:54:38', '2026-11-05 14:54:38'),
(74, 8, '704a6b24319be0f2325d91cc08ea56153c14919071df167f3402024683303b51', '2026-10-07 16:48:49', '2026-11-06 16:48:49');

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

INSERT INTO `routines` (`routine_id`, `user_id`, `routine_name`, `routine_type`) VALUES
(1, 1, '2026-09-23 Routine', '2026-09-23'),
(2, 3, '2026-09-23 Routine', '2026-09-23'),
(3, 1, '2026-09-27', 'daily'),
(4, 1, '2026-09-27', 'PM'),
(5, 6, '__shelf_AM__', 'AM'),
(6, 6, '__shelf_PM__', 'PM'),
(7, 6, '2026-10-01', 'daily'),
(8, 1, '__shelf_AM__', 'AM'),
(9, 1, '__shelf_PM__', 'PM'),
(10, 1, '2026-10-04', 'daily'),
(11, 1, '2026-10-04', 'PM'),
(12, 8, '__shelf_AM__', 'AM'),
(13, 8, '__shelf_PM__', 'PM'),
(14, 8, '2026-10-05', 'daily');

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

INSERT INTO `users` (`user_id`, `full_name`, `email`, `password_hash`, `role`, `skin_type`, `routine_goal`, `status`, `date_joined`) VALUES
(1, 'rai', 'add@mail.com', '$2y$10$kHX7HbSSak0V6k3vpH9ZveFslAeAA2Qo0F.Gp91VqoIxiuawtxApC', '', 'Combination Skin', 'Consistency', NULL, '2026-09-21 14:52:36'),
(2, 'Admin', 'admin@glowguard.com', '$2y$10$iRrwF8t/EiT/9JHEVw/.VOVCE6QQyrA6I.keZW35bhy0C4l3pp56u', 'admin', NULL, NULL, 'active', '2026-09-23 12:11:27'),
(3, 'Rene', 're@mail.com', '$2y$10$7RDVu2ysrKhPqakegh7VUe5SKND8uepyTmErAnH8ueBq/LMMYdl2C', '', 'Oily Skin', 'Gentle Care', NULL, '2026-09-23 14:41:16'),
(4, 'Yuri', 'yuri@gmail.com', '$2y$10$yHg7YDEV3hrcb1Cl1OOSOuJOb.EbIkdEBSCq3IDC1Q8INVZ6AUYpC', '', NULL, NULL, NULL, '2026-09-24 02:29:24'),
(5, 'Bryan', 'consultant@gmail.com', '$2y$10$W5lzrQ10HRe4FzDTf1L7s.NvhTQG/5wWsSPfP/8vRZzbRY34ikXqK', 'consultant', NULL, NULL, 'active', '2026-09-29 05:36:45'),
(6, 'Bryan', 'bryanjosef@gmail.com', '$2y$10$w9FN2CEEgOURRFgBq5uiuehlTARtmH0xCmL6CT4TVAzHCb8RgHWdy', 'user', NULL, NULL, 'active', '2026-09-30 23:54:49'),
(8, 'Rainan Orte', 'rainanorte61@gmail.com', '$2y$10$4a33lvvk722h.QgjF7GU3e7Idj7.vTlnKVN4TzKi9my.Mnqc9DjdS', 'user', 'Oily Skin', 'Oil Control', 'active', '2026-10-04 13:23:23'),
(13, 'boonw', 'boon@mail.com', '$2y$10$lG5yip/98b./ZCOPMPmjseC3l6HRoCdPVv8Q.an/hcbVvzfFJbRRW', 'user', NULL, NULL, 'active', '2026-10-04 14:03:59'),
(14, 'Chanel Oberlyn', 'chanel12@mail.com', '$2y$10$DX06M67F6mMxxgFe0Hege.11g/9L.ZYQrxG1rQgldvseBpfEVHB26', 'user', NULL, NULL, 'active', '2026-10-04 14:10:44'),
(18, 'Jules', 'apn02@outlook.com', '$2y$10$1qGGMs2UhuIvjfKnST69YeLnORz90J0W7RJzWc7n1Jm06yby8b34a', 'user', 'Balanced Skin', NULL, 'active', '2026-10-04 14:49:31'),
(19, 'penis', 'qwas@mail.com', '$2y$10$08m0kl3Z.qOnBgUrb.L6gey.sf4qGf9d5KfwRrPDxy0PmV1j6ei0u', 'user', 'Oily Skin', NULL, 'active', '2026-10-05 14:40:06'),
(20, 'Libey Putney', 'libey@mail.com', '$2y$10$93gZYjcIc/qzV0hTKRz/a.bLQ.2xjX9eDDANsVXqGZRFJ2c1kAeaq', 'user', 'Dry Skin', 'Breakout Care', 'active', '2026-10-06 14:54:38');

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
