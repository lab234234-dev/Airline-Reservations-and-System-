<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['admin_id'])) {
    header("Location: admin_login.php");
    exit();
}

$error = '';
$success = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $flight_number = trim($_POST['flight_number']);
    $airline = trim($_POST['airline']);
    $departure_city = trim($_POST['departure_city']);
    $arrival_city = trim($_POST['arrival_city']);
    $departure_time = $_POST['departure_time'];
    $arrival_time = $_POST['arrival_time'];
    $price = $_POST['price'];
    $total_seats = $_POST['total_seats'];

    if (strtotime($departure_time) >= strtotime($arrival_time)) {
        $error = "Arrival time must be after departure time.";
    } else {
        $stmt = $pdo->prepare("SELECT id FROM flights WHERE flight_number = ?");
        $stmt->execute([$flight_number]);
        if ($stmt->rowCount() > 0) {
            $error = "Flight number already exists.";
        } else {
            $stmt = $pdo->prepare("INSERT INTO flights (flight_number, airline, departure_city, arrival_city, departure_time, arrival_time, price, total_seats, available_seats) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            if ($stmt->execute([$flight_number, $airline, $departure_city, $arrival_city, $departure_time, $arrival_time, $price, $total_seats, $total_seats])) {
                $success = "Flight added successfully!";
            } else {
                $error = "Failed to add flight.";
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Add Flight - SkyFly Admin</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .form-row { display: flex; gap: 20px; }
        .form-row .form-group { flex: 1; }
    </style>
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
    <div class="container d-flex" style="justify-content:center;">
        <div class="card card-large">
            <h2 class="text-center mb-3">Add New Flight</h2>
            <?php if ($error) echo "<div class='alert alert-error'>$error</div>"; ?>
            <?php if ($success) echo "<div class='alert alert-success'>$success</div>"; ?>
            
            <form method="POST">
                <div class="form-row">
                    <div class="form-group">
                        <label>Flight Number</label>
                        <input type="text" name="flight_number" class="form-control" placeholder="e.g. AA-102" required>
                    </div>
                    <div class="form-group">
                        <label>Airline Name</label>
                        <input type="text" name="airline" class="form-control" placeholder="e.g. American Airlines" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Departure City</label>
                        <input type="text" name="departure_city" class="form-control" placeholder="City" required>
                    </div>
                    <div class="form-group">
                        <label>Arrival City</label>
                        <input type="text" name="arrival_city" class="form-control" placeholder="City" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Departure Time</label>
                        <input type="datetime-local" name="departure_time" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Arrival Time</label>
                        <input type="datetime-local" name="arrival_time" class="form-control" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Price ($)</label>
                        <input type="number" step="0.01" name="price" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Total Seats</label>
                        <input type="number" name="total_seats" class="form-control" required>
                    </div>
                </div>
                <button type="submit" class="btn" style="width:100%; background:#023047; margin-top:10px;">Save Flight Details</button>
            </form>
        </div>
    </div>
</body>
</html>
