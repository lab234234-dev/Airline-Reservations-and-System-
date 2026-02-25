<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['admin_id'])) {
    header("Location: admin_login.php");
    exit();
}

// Analytics Queries
$total_users = $pdo->query("SELECT count(*) FROM users")->fetchColumn();
$total_flights = $pdo->query("SELECT count(*) FROM flights")->fetchColumn();
$total_bookings = $pdo->query("SELECT count(*) FROM bookings")->fetchColumn();
$total_revenue = $pdo->query("SELECT sum(amount) FROM payments WHERE status='Success'")->fetchColumn() ?: 0;

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - SkyFly Airlines</title>
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
        <h2 class="mb-3">Admin Dashboard Overview</h2>
        
        <div class="dashboard-grid">
            <div class="stat-card">
                <h3>Total Registered Users</h3>
                <div class="value"><?php echo $total_users; ?></div>
            </div>
            <div class="stat-card" style="border-top-color: #28a745;">
                <h3>Total Flights System</h3>
                <div class="value" style="color: #28a745;"><?php echo $total_flights; ?></div>
            </div>
            <div class="stat-card" style="border-top-color: #219ebc;">
                <h3>Total Bookings Made</h3>
                <div class="value" style="color: #219ebc;"><?php echo $total_bookings; ?></div>
            </div>
            <div class="stat-card" style="border-top-color: #8e44ad;">
                <h3>Total Revenue Gen.</h3>
                <div class="value" style="color: #8e44ad;">$<?php echo number_format($total_revenue, 2); ?></div>
            </div>
        </div>

        <h3 class="mt-4 mb-3">Recent Bookings Overview</h3>
        <div class="table-container">
            <?php
            $stmt = $pdo->query("SELECT b.id, u.name, f.flight_number, b.booking_date, b.status 
                                 FROM bookings b 
                                 JOIN users u ON b.user_id = u.id 
                                 JOIN flights f ON b.flight_id = f.id 
                                 ORDER BY b.booking_date DESC LIMIT 5");
            $recent = $stmt->fetchAll();

            if (count($recent) > 0) {
                echo "<table>
                        <thead><tr><th>Booking ID</th><th>User Name</th><th>Flight</th><th>Date</th><th>Status</th></tr></thead>
                        <tbody>";
                foreach($recent as $r) {
                    $sc = "badge-" . strtolower($r['status']);
                    echo "<tr>
                            <td>#{$r['id']}</td>
                            <td>{$r['name']}</td>
                            <td>{$r['flight_number']}</td>
                            <td>" . date('d M Y, h:i A', strtotime($r['booking_date'])) . "</td>
                            <td><span class='badge {$sc}'>{$r['status']}</span></td>
                          </tr>";
                }
                echo "</tbody></table>";
                echo "<div style='text-align:right;'><a href='view_bookings.php' style='color:#fb8500; font-weight:bold;'>View All Bookings ➔</a></div>";
            } else {
                echo "<p>No recent bookings.</p>";
            }
            ?>
        </div>
    </div>
</body>
</html>
