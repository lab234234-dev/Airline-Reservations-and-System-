<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$user_id = $_SESSION['user_id'];

$stmt = $pdo->prepare("SELECT b.*, f.airline, f.flight_number, f.departure_city, f.arrival_city, f.departure_time, p.amount 
                       FROM bookings b 
                       JOIN flights f ON b.flight_id = f.id 
                       LEFT JOIN payments p ON b.id = p.booking_id
                       WHERE b.user_id = ? 
                       ORDER BY b.booking_date DESC");
$stmt->execute([$user_id]);
$bookings = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking History - SkyFly Airlines</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .ticket-card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            display: flex;
            overflow: hidden;
            flex-wrap: wrap;
        }
        .ticket-left {
            background: #023047;
            color: white;
            padding: 20px;
            flex: 1;
            min-width: 250px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .ticket-right {
            padding: 20px;
            flex: 2;
            min-width: 300px;
            position: relative;
        }
        .flight-route { font-size: 1.5rem; font-weight: bold; margin: 10px 0; }
        .cancel-btn { position: absolute; top: 20px; right: 20px; }
    </style>
</head>
<body>
    <nav class="navbar">
        <a href="../index.php" class="logo">✈️ SkyFly Airlines</a>
        <div class="nav-links">
            <a href="dashboard.php">Dashboard</a>
            <a href="search_flights.php">Search</a>
            <a href="booking_history.php">History</a>
            <a href="logout.php">Logout</a>
        </div>
    </nav>
    <div class="container">
        <h2 class="mb-3 text-center">Your Booking History</h2>

        <?php if (count($bookings) > 0): ?>
            <?php foreach ($bookings as $booking): ?>
            <div class="ticket-card">
                <div class="ticket-left">
                    <h3><?php echo $booking['airline']; ?></h3>
                    <p>Flight No: <?php echo $booking['flight_number']; ?></p>
                    <p>Booking Date: <?php echo date('M d, Y', strtotime($booking['booking_date'])); ?></p>
                </div>
                <div class="ticket-right">
                    <div class="flight-route">
                        <?php echo $booking['departure_city']; ?> ➔ <?php echo $booking['arrival_city']; ?>
                    </div>
                    <p><strong>Departure:</strong> <?php echo date('d M Y, h:i A', strtotime($booking['departure_time'])); ?></p>
                    <p><strong>Seat:</strong> <?php echo $booking['seat_number'] ?: 'TBD'; ?></p>
                    <p><strong>Amount:</strong> $<?php echo number_format($booking['amount'] ?? 0, 2); ?></p>
                    <p><strong>Status:</strong> <span class="badge badge-<?php echo strtolower($booking['status']); ?>"><?php echo $booking['status']; ?></span></p>
                    
                    <?php if($booking['status'] == 'Confirmed' && strtotime($booking['departure_time']) > time()): ?>
                        <a href="cancel_booking.php?id=<?php echo $booking['id']; ?>" class="btn cancel-btn" style="background:#dc3545;" onclick="return confirm('Are you sure you want to cancel this booking? This action cannot be undone.')">Cancel Ticket</a>
                    <?php endif; ?>
                </div>
            </div>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="card text-center" style="max-width:100%;">
                <p>You haven't made any bookings yet.</p>
                <a href="search_flights.php" class="btn mt-3">Book a Flight</a>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
