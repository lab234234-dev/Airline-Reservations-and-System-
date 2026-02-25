<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$user_id = $_SESSION['user_id'];
$user_name = $_SESSION['user_name'];

$stmt = $pdo->prepare("SELECT count(*) FROM bookings WHERE user_id = ?");
$stmt->execute([$user_id]);
$total_bookings = $stmt->fetchColumn();

$stmt = $pdo->prepare("SELECT count(*) FROM bookings WHERE user_id = ? AND status = 'Confirmed'");
$stmt->execute([$user_id]);
$confirmed_bookings = $stmt->fetchColumn();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Dashboard - SkyFly Airlines</title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
    <nav class="navbar">
        <a href="../index.php" class="logo">✈️ SkyFly Airlines</a>
        <div class="nav-links">
            <a href="dashboard.php">Dashboard</a>
            <a href="search_flights.php">Search Flights</a>
            <a href="booking_history.php">Booking History</a>
            <a href="logout.php">Logout</a>
        </div>
    </nav>
    <div class="container">
        <h2>Welcome, <?php echo htmlspecialchars($user_name); ?>!</h2>
        <p class="mb-3">Manage your travel plans and view your booking history from here.</p>

        <div class="dashboard-grid">
            <div class="stat-card">
                <h3>Total Bookings</h3>
                <div class="value"><?php echo $total_bookings; ?></div>
            </div>
            <div class="stat-card" style="border-top-color: #fb8500;">
                <h3>Confirmed Flights</h3>
                <div class="value" style="color: #fb8500;"><?php echo $confirmed_bookings; ?></div>
            </div>
            <div class="stat-card" style="border-top-color: #219ebc;">
                <h3>Upcoming Trips</h3>
                <div class="value" style="color: #219ebc;">
                    <a href="search_flights.php" class="btn" style="margin-top:10px;">Book Now</a>
                </div>
            </div>
        </div>

        <h3 class="mt-4 mb-3">Recent Activity</h3>
        <?php
        $stmt = $pdo->prepare("SELECT b.*, f.flight_number, f.departure_city, f.arrival_city, f.departure_time 
                               FROM bookings b 
                               JOIN flights f ON b.flight_id = f.id 
                               WHERE b.user_id = ? 
                               ORDER BY b.booking_date DESC LIMIT 5");
        $stmt->execute([$user_id]);
        $recent_bookings = $stmt->fetchAll();

        if (count($recent_bookings) > 0) {
            echo "<div class='table-container'><table>
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Flight</th>
                            <th>Route</th>
                            <th>Departure Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>";
            foreach($recent_bookings as $booking) {
                $statusClass = 'badge-' . strtolower($booking['status']);
                echo "<tr>
                        <td>#{$booking['id']}</td>
                        <td>{$booking['flight_number']}</td>
                        <td>{$booking['departure_city']} ➔ {$booking['arrival_city']}</td>
                        <td>" . date('d M Y, h:i A', strtotime($booking['departure_time'])) . "</td>
                        <td><span class='badge {$statusClass}'>{$booking['status']}</span></td>
                      </tr>";
            }
            echo "</tbody></table></div>";
            echo "<div style='text-align:right; margin-top:10px;'><a href='booking_history.php' style='color:#023047; font-weight:bold;'>View All History ➔</a></div>";
        } else {
            echo "<div class='card text-center'><p>You have no recent bookings. <a href='search_flights.php' style='color:#023047;font-weight:bold;'>Search Flights</a></p></div>";
        }
        ?>
    </div>
</body>
</html>
