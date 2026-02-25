<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['admin_id'])) {
    header("Location: admin_login.php");
    exit();
}

if (isset($_GET['delete'])) {
    $id = (int)$_GET['delete'];
    $stmt = $pdo->prepare("DELETE FROM flights WHERE id = ?");
    $stmt->execute([$id]);
    header("Location: manage_flights.php?msg=deleted");
    exit();
}

$stmt = $pdo->query("SELECT * FROM flights ORDER BY departure_time DESC");
$flights = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Manage Flights - SkyFly Admin</title>
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
        <h2 class="mb-3">Manage Existing Flights</h2>
        
        <?php if (isset($_GET['msg']) && $_GET['msg'] == 'deleted') echo "<div class='alert alert-success'>Flight deleted successfully.</div>"; ?>

        <div class="table-container">
            <?php if (count($flights) > 0): ?>
            <table>
                <thead>
                    <tr>
                        <th>Flight No.</th>
                        <th>Airline</th>
                        <th>Route</th>
                        <th>Departure</th>
                        <th>Arrival</th>
                        <th>Price</th>
                        <th>Seats (Avail/Total)</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($flights as $f): ?>
                    <tr>
                        <td><strong><?php echo $f['flight_number']; ?></strong></td>
                        <td><?php echo $f['airline']; ?></td>
                        <td><?php echo $f['departure_city']; ?> ➔ <br><?php echo $f['arrival_city']; ?></td>
                        <td><?php echo date('d M Y, h:i A', strtotime($f['departure_time'])); ?></td>
                        <td><?php echo date('d M Y, h:i A', strtotime($f['arrival_time'])); ?></td>
                        <td>$<?php echo number_format($f['price'], 2); ?></td>
                        <td><?php echo $f['available_seats'] . " / " . $f['total_seats']; ?></td>
                        <td>
                            <a href="manage_flights.php?delete=<?php echo $f['id']; ?>" class="badge badge-failed" onclick="return confirm('Delete this flight? This action cannot be undone.')">Delete</a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php else: ?>
                <div class="card text-center" style="max-width:100%;"><p>No flights found in the system. <a href="add_flight.php">Add one now</a>.</p></div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
