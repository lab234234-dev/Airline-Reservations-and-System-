-- ===================================================
-- SkyHigh Air - Airline Reservation System
-- Database Schema for MySQL / phpMyAdmin
-- Database: airline_reservation
-- ===================================================

DROP DATABASE IF EXISTS `airline_reservation`;
CREATE DATABASE `airline_reservation` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `airline_reservation`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('user', 'admin', 'agent') DEFAULT 'user',
    `profile_pic` LONGTEXT,
    `phone` VARCHAR(30) DEFAULT '',
    `dob` VARCHAR(30) DEFAULT '',
    `gender` VARCHAR(20) DEFAULT '',
    `id_type` VARCHAR(50) DEFAULT '',
    `id_number` VARCHAR(100) DEFAULT '',
    `seat_preference` VARCHAR(50) DEFAULT 'Window',
    `meal_preference` VARCHAR(50) DEFAULT 'Vegetarian',
    `reward_points` INT DEFAULT 250,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Flights Table
CREATE TABLE IF NOT EXISTS `flights` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `flight_number` VARCHAR(50) NOT NULL UNIQUE,
    `airline` VARCHAR(100) NOT NULL,
    `origin` VARCHAR(100) NOT NULL,
    `destination` VARCHAR(100) NOT NULL,
    `departure_time` DATETIME NOT NULL,
    `arrival_time` DATETIME NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `seats_available` INT NOT NULL,
    `total_seats` INT NOT NULL,
    `booked_seats` TEXT, -- JSON Array: ["1A", "1B"]
    `status` ENUM('scheduled', 'delayed', 'cancelled') DEFAULT 'scheduled',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bookings Table
CREATE TABLE IF NOT EXISTS `bookings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `flight_id` INT NOT NULL,
    `origin` VARCHAR(100),
    `destination` VARCHAR(100),
    `airline` VARCHAR(100),
    `flight_number` VARCHAR(50),
    `pnr` VARCHAR(30) NOT NULL UNIQUE,
    `seat_number` VARCHAR(100),
    `passengers` TEXT NOT NULL, -- JSON Array of passengers
    `total_amount` DECIMAL(10,2) NOT NULL,
    `payment_status` ENUM('pending', 'paid', 'failed') DEFAULT 'paid',
    `payment_method` VARCHAR(100) DEFAULT 'Credit/Debit Card',
    `booking_status` ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
    `check_in_status` ENUM('pending', 'completed') DEFAULT 'pending',
    `flight_flying_status` VARCHAR(100) DEFAULT 'Check-In Required',
    `boarding_pass_issued` TINYINT(1) DEFAULT 0,
    `gate` VARCHAR(20) DEFAULT 'B4',
    `terminal` VARCHAR(20) DEFAULT 'T2',
    `boarding_time` VARCHAR(100) DEFAULT '45m Before Departure',
    `transaction_id` VARCHAR(100),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (`user_id`),
    INDEX (`flight_id`),
    INDEX (`pnr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Airport Counter Bookings Table
CREATE TABLE IF NOT EXISTS `airport_bookings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `pnr` VARCHAR(30) NOT NULL UNIQUE,
    `agent_id` INT NOT NULL,
    `agent_name` VARCHAR(150) DEFAULT 'Airport Desk Agent',
    `booking_channel` VARCHAR(50) DEFAULT 'AIRPORT_COUNTER',
    `flight_id` INT NOT NULL,
    `travel_class` VARCHAR(50) DEFAULT 'Economy',
    `passengers` TEXT NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `base_fare` DECIMAL(10,2) NOT NULL,
    `add_on_charges` DECIMAL(10,2) DEFAULT 0,
    `total_paid` DECIMAL(10,2) NOT NULL,
    `payment_status` VARCHAR(50) DEFAULT 'COMPLETED',
    `payment_method` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (`pnr`),
    INDEX (`flight_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Payments Table
CREATE TABLE IF NOT EXISTS `payments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `booking_id` INT,
    `amount` DECIMAL(10,2) NOT NULL,
    `payment_method` VARCHAR(100) NOT NULL,
    `transaction_id` VARCHAR(100) NOT NULL,
    `status` VARCHAR(50) DEFAULT 'success',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (`user_id`),
    INDEX (`booking_id`),
    INDEX (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- Initial Default Seed Data
-- Passwords are hashed with bcrypt (password: 'password123' or 'admin123')
-- ===================================================

-- Default Admin & Customer Accounts
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `reward_points`) VALUES
(1, 'System Administrator', 'admin@skyhigh.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 5000),
(2, 'Counter Desk Agent', 'agent@skyhigh.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', 1000),
(3, 'Demo Traveler', 'passenger@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 850)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Sample Flights
INSERT INTO `flights` (`flight_number`, `airline`, `origin`, `destination`, `departure_time`, `arrival_time`, `price`, `seats_available`, `total_seats`, `booked_seats`, `status`) VALUES
('SH-102', 'SkyHigh Air', 'Surat', 'Mumbai', NOW() + INTERVAL 2 HOUR, NOW() + INTERVAL 3 HOUR + INTERVAL 15 MINUTE, 3600.00, 110, 150, '["12A","14C"]', 'scheduled'),
('AI-208', 'Air India', 'Ahmedabad', 'Delhi', NOW() + INTERVAL 4 HOUR, NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE, 4200.00, 95, 160, '["3F","4A"]', 'scheduled'),
('SH-101', 'SkyHigh Air', 'Mumbai', 'Delhi', NOW() + INTERVAL 1 DAY, NOW() + INTERVAL 1 DAY + INTERVAL 2 HOUR, 4500.00, 85, 150, '["7B"]', 'scheduled'),
('IN-505', 'IndiGo', 'Bangalore', 'Goa', NOW() + INTERVAL 1 DAY + INTERVAL 12 HOUR, NOW() + INTERVAL 1 DAY + INTERVAL 13 HOUR + INTERVAL 15 MINUTE, 3400.00, 130, 180, '[]', 'scheduled'),
('SG-404', 'SpiceJet', 'Jaipur', 'Kolkata', NOW() + INTERVAL 2 DAY, NOW() + INTERVAL 2 DAY + INTERVAL 2 HOUR + INTERVAL 15 MINUTE, 4900.00, 78, 160, '[]', 'scheduled'),
('AI-303', 'Air India', 'Chennai', 'Bangalore', NOW() + INTERVAL 2 DAY + INTERVAL 12 HOUR, NOW() + INTERVAL 2 DAY + INTERVAL 13 HOUR + INTERVAL 30 MINUTE, 2800.00, 140, 180, '[]', 'scheduled'),
('AI-601', 'Air India', 'Delhi', 'Srinagar', NOW() + INTERVAL 3 DAY, NOW() + INTERVAL 3 DAY + INTERVAL 1 HOUR + INTERVAL 30 MINUTE, 5800.00, 60, 150, '[]', 'scheduled'),
('6E-712', 'IndiGo', 'Kochi', 'Chennai', NOW() + INTERVAL 3 DAY + INTERVAL 12 HOUR, NOW() + INTERVAL 3 DAY + INTERVAL 13 HOUR + INTERVAL 10 MINUTE, 3100.00, 115, 180, '[]', 'scheduled'),
('6E-889', 'IndiGo', 'Surat', 'Bangalore', NOW() + INTERVAL 4 DAY, NOW() + INTERVAL 4 DAY + INTERVAL 2 HOUR + INTERVAL 5 MINUTE, 4900.00, 105, 180, '[]', 'scheduled'),
('HY-707', 'Air India Express', 'Hyderabad', 'Pune', NOW() + INTERVAL 4 DAY + INTERVAL 12 HOUR, NOW() + INTERVAL 4 DAY + INTERVAL 13 HOUR + INTERVAL 15 MINUTE, 3200.00, 90, 160, '[]', 'scheduled'),
('EK-501', 'Emirates', 'Mumbai', 'Dubai', NOW() + INTERVAL 1 DAY, NOW() + INTERVAL 1 DAY + INTERVAL 3 HOUR + INTERVAL 30 MINUTE, 16500.00, 180, 300, '[]', 'scheduled'),
('BA-138', 'British Airways', 'Delhi', 'London', NOW() + INTERVAL 2 DAY, NOW() + INTERVAL 2 DAY + INTERVAL 9 HOUR, 48000.00, 210, 320, '[]', 'scheduled'),
('SQ-402', 'Singapore Airlines', 'Bangalore', 'Singapore', NOW() + INTERVAL 2 DAY + INTERVAL 12 HOUR, NOW() + INTERVAL 2 DAY + INTERVAL 17 HOUR, 19800.00, 155, 260, '[]', 'scheduled'),
('AI-101', 'Air India', 'Delhi', 'New York', NOW() + INTERVAL 3 DAY, NOW() + INTERVAL 3 DAY + INTERVAL 15 HOUR + INTERVAL 30 MINUTE, 72000.00, 190, 340, '[]', 'scheduled'),
('TG-318', 'Thai Airways', 'Ahmedabad', 'Bangkok', NOW() + INTERVAL 3 DAY + INTERVAL 12 HOUR, NOW() + INTERVAL 3 DAY + INTERVAL 16 HOUR + INTERVAL 45 MINUTE, 17200.00, 140, 240, '[]', 'scheduled'),
('AF-218', 'Air France', 'Mumbai', 'Paris', NOW() + INTERVAL 4 DAY, NOW() + INTERVAL 4 DAY + INTERVAL 9 HOUR + INTERVAL 30 MINUTE, 52000.00, 165, 280, '[]', 'scheduled')
ON DUPLICATE KEY UPDATE `flight_number`=`flight_number`;
