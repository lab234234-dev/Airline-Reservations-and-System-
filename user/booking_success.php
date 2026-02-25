<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

if (!isset($_GET['booking_id'])) {
    header("Location: dashboard.php");
    exit();
}

$booking_id = $_GET['booking_id'];

$stmt = $pdo->prepare("SELECT b.*, f.airline, f.flight_number, f.departure_city, f.arrival_city, p.transaction_id, p.payment_method 
                       FROM bookings b 
                       JOIN flights f ON b.flight_id = f.id 
                       LEFT JOIN payments p ON b.id = p.booking_id
                       WHERE b.id = ? AND b.user_id = ?");
$stmt->execute([$booking_id, $_SESSION['user_id']]);
$booking = $stmt->fetch();

if (!$booking) {
    die("Booking not found or not authorized.");
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Booking Success - SkyFly Airlines</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .ticket {
            background: white;
            border: 2px dashed #023047;
            padding: 20px;
            margin: 20px auto;
            max-width: 600px;
            text-align: left;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <a href="../index.php" class="logo">✈️ SkyFly Airlines</a>
        <div class="nav-links">
            <a href="dashboard.php">Dashboard</a>
            <a href="search_flights.php">Search</a>
            <a href="logout.php">Logout</a>
        </div>
    </nav>
    <div class="container text-center">
        <div class="card card-large">
            <h1 style="color:#28a745;">🎉 Booking Confirmed!</h1>
            <p>Your flight has been successfully booked. Have a great journey.</p>
            
            <div class="ticket">
                <h3>E-Ticket: #<?php echo str_pad($booking['id'], 6, '0', STR_PAD_LEFT); ?></h3>
                <hr style="margin:10px 0;">
                <p><strong>Passenger Name:</strong> <?php echo htmlspecialchars($_SESSION['user_name']); ?></p>
                <p><strong>Airline:</strong> <?php echo $booking['airline']; ?> (<?php echo $booking['flight_number']; ?>)</p>
                <p><strong>Route:</strong> <?php echo $booking['departure_city']; ?> ➔ <?php echo $booking['arrival_city']; ?></p>
                <p><strong>Seat Number:</strong> <?php echo $booking['seat_number'] ?: 'Auto-assigned at Check-in'; ?></p>
                <p><strong>Status:</strong> <span class="badge badge-confirmed"><?php echo $booking['status']; ?></span></p>
                <br>
                <h4>Payment Details</h4>
                <hr style="margin:10px 0;">
                <p><strong>Payment Method:</strong> <?php echo $booking['payment_method']; ?></p>
                <p><strong>Transaction ID:</strong> <?php echo $booking['transaction_id']; ?></p>
            </div>

            <a href="dashboard.php" class="btn btn-secondary">Go to Dashboard</a>
            <button class="btn" onclick="window.print()">Print Ticket</button>
        </div>
    </div>
</body>
</html>
