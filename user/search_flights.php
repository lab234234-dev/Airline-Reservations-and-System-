<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$flights = [];
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $departure = trim($_POST['departure_city']);
    $arrival = trim($_POST['arrival_city']);
    $date = $_POST['departure_date'];

    $query = "SELECT * FROM flights WHERE available_seats > 0";
    $params = [];

    if (!empty($departure)) {
        $query .= " AND departure_city LIKE ?";
        $params[] = "%$departure%";
    }
    if (!empty($arrival)) {
        $query .= " AND arrival_city LIKE ?";
        $params[] = "%$arrival%";
    }
    if (!empty($date)) {
        $query .= " AND DATE(departure_time) = ?";
        $params[] = $date;
    }

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $flights = $stmt->fetchAll();
} else {
    // Show some upcoming flights by default
    $stmt = $pdo->prepare("SELECT * FROM flights WHERE departure_time > NOW() AND available_seats > 0 ORDER BY departure_time ASC LIMIT 10");
    $stmt->execute();
    $flights = $stmt->fetchAll();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Search Flights - SkyFly Airlines</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .search-area {
            background: linear-gradient(-45deg, #023047, #219ebc);
            padding: 40px;
            border-radius: 12px;
            color: white;
            margin-bottom: 30px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .search-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            align-items: end;
        }
    </style>
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
        <div class="search-area">
            <h2 class="mb-3">Find Your Next Destination</h2>
            <form method="POST" class="search-grid">
                <div class="form-group mb-0">
                    <label style="color:white;">From City</label>
                    <input type="text" name="departure_city" class="form-control" placeholder="e.g. New York">
                </div>
                <div class="form-group mb-0">
                    <label style="color:white;">To City</label>
                    <input type="text" name="arrival_city" class="form-control" placeholder="e.g. London">
                </div>
                <div class="form-group mb-0">
                    <label style="color:white;">Date of Travel</label>
                    <input type="date" name="departure_date" class="form-control">
                </div>
                <button type="submit" class="btn" style="background: #fb8500;">Search Flights</button>
            </form>
        </div>

        <h3>Available Flights</h3>
        <div class="table-container mt-3">
            <?php if (count($flights) > 0): ?>
            <table>
                <thead>
                    <tr>
                        <th>Airline</th>
                        <th>Flight No.</th>
                        <th>Route</th>
                        <th>Departure</th>
                        <th>Arrival</th>
                        <th>Price</th>
                        <th>Seats</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($flights as $flight): ?>
                    <tr>
                        <td><strong><?php echo htmlspecialchars($flight['airline']); ?></strong></td>
                        <td><?php echo htmlspecialchars($flight['flight_number']); ?></td>
                        <td><?php echo htmlspecialchars($flight['departure_city']); ?> ➔ <?php echo htmlspecialchars($flight['arrival_city']); ?></td>
                        <td><?php echo date('d M Y, h:i A', strtotime($flight['departure_time'])); ?></td>
                        <td><?php echo date('d M Y, h:i A', strtotime($flight['arrival_time'])); ?></td>
                        <td><strong>$<?php echo number_format($flight['price'], 2); ?></strong></td>
                        <td><?php echo $flight['available_seats']; ?> left</td>
                        <td>
                            <a href="book_ticket.php?flight_id=<?php echo $flight['id']; ?>" class="btn" style="padding: 8px 16px; font-size:0.9rem;">Book</a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php else: ?>
                <div class="card text-center" style="max-width:100%;">
                    <p style="font-size:1.1rem; color:#555;">No flights found for your search criteria. Please try different dates or cities.</p>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
