<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['admin_id'])) {
    header("Location: admin_login.php");
    exit();
}

// Fetch all bookings with user and flight info
$stmt = $pdo->query("SELECT b.id, b.status, b.booking_date, u.name as user_name, u.email, f.flight_number, f.departure_city, f.arrival_city, p.amount, p.payment_method, p.transaction_id, p.status as payment_status
                     FROM bookings b 
                     JOIN users u ON b.user_id = u.id 
                     JOIN flights f ON b.flight_id = f.id 
                     LEFT JOIN payments p ON b.id = p.booking_id
                     ORDER BY b.booking_date DESC");
$bookings = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>View Bookings - SkyFly Admin</title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
    <nav class="navbar" style="background: #fb8500;">
        <a href="admin_dashboard.php" class="logo">⚙️ Admin Panel</a>
        <div class="nav-links">
            <a href="admin_dashboard.php">Dashboard</a>
            <a href="add_flight.php">Add Flight</a>
            <a href="manage_flights.php">Manage Flights</a>
            <a href="view_bookings.php">Bookings</a>
            <a href="logout.php">Logout</a>
        </div>
    </nav>
    <div class="container">
        <h2 class="mb-3">All Customer Bookings</h2>
        
        <div class="table-container">
            <?php if (count($bookings) > 0): ?>
            <table>
                <thead>
                    <tr>
                        <th>Booking ID</th>
                        <th>Passenger</th>
                        <th>Flight Info</th>
                        <th>Route</th>
                        <th>Booking Date</th>
                        <th>Status</th>
                        <th>Payment</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($bookings as $b): ?>
                    <tr>
                        <td><strong>#<?php echo $b['id']; ?></strong></td>
                        <td><?php echo htmlspecialchars($b['user_name']); ?><br><small><?php echo htmlspecialchars($b['email']); ?></small></td>
                        <td><?php echo $b['flight_number']; ?></td>
                        <td><?php echo $b['departure_city'] . ' ➔ ' . $b['arrival_city']; ?></td>
                        <td><?php echo date('d M Y, h:i A', strtotime($b['booking_date'])); ?></td>
                        <td><span class="badge badge-<?php echo strtolower($b['status']); ?>"><?php echo $b['status']; ?></span></td>
                        <td>
                            <?php if ($b['amount']): ?>
                                $<?php echo number_format($b['amount'], 2); ?><br>
                                <span style="font-size:0.8rem; color:#555;"><?php echo $b['payment_method']; ?> (<?php echo $b['payment_status']; ?>)</span>
                            <?php else: ?>
                                N/A
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php else: ?>
                <div class="card text-center" style="max-width:100%;"><p>No bookings found in the system right now.</p></div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
