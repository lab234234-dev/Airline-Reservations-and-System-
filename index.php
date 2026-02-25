<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SkyFly Airline Reservation System - Home</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <nav class="navbar">
        <a href="index.php" class="logo">✈️ SkyFly Airlines</a>
        <div class="nav-links">
            <a href="index.php">Home</a>
            <?php if(isset($_SESSION['user_id'])): ?>
                <a href="user/dashboard.php">Dashboard</a>
            <?php elseif(isset($_SESSION['admin_id'])): ?>
                <a href="admin/admin_dashboard.php">Admin Panel</a>
            <?php else: ?>
                <a href="user/login.php">User Login</a>
                <a href="admin/admin_login.php">Admin Login</a>
            <?php endif; ?>
        </div>
    </nav>

    <div class="hero">
        <h1>Experience the Joy of Flying</h1>
        <p>Book your next destination with SkyFly Airlines. Fast, secure, and comfortable travel for both business and leisure.</p>
        <div style="display:flex; gap:20px; z-index:10; position:relative;">
            <?php if(isset($_SESSION['user_id'])): ?>
                <a href="user/search_flights.php" class="btn">Search Flights</a>
            <?php else: ?>
                <a href="user/login.php" class="btn">Book Now</a>
                <a href="user/register.php" class="btn btn-secondary">Sign Up Free</a>
            <?php endif; ?>
        </div>
    </div>

    <footer class="footer">
        <p>&copy; <?php echo date('Y'); ?> SkyFly Airline Reservation System. All rights reserved.</p>
    </footer>
</body>
</html>
