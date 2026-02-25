<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

if (!isset($_GET['flight_id'])) {
    header("Location: search_flights.php");
    exit();
}

$flight_id = $_GET['flight_id'];
$stmt = $pdo->prepare("SELECT * FROM flights WHERE id = ?");
$stmt->execute([$flight_id]);
$flight = $stmt->fetch();

if (!$flight || $flight['available_seats'] <= 0) {
    die("Flight not found or no seats available.");
}

$error = '';
$success = '';

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['payment_status']) && $_POST['payment_status'] == 'Success') {
    $seat_number = trim($_POST['seat_number']);
    $payment_method = $_POST['payment_method'];
    $amount = $flight['price'];
    $transaction_id = "TXN" . time() . rand(100, 999);

    try {
        $pdo->beginTransaction();

        // Check seat availability again to avoid race condition
        $checkSeat = $pdo->prepare("SELECT available_seats FROM flights WHERE id = ? FOR UPDATE");
        $checkSeat->execute([$flight_id]);
        $avail = $checkSeat->fetchColumn();

        if ($avail > 0) {
            // Create booking
            $stmt = $pdo->prepare("INSERT INTO bookings (user_id, flight_id, seat_number, status) VALUES (?, ?, ?, 'Confirmed')");
            $stmt->execute([$_SESSION['user_id'], $flight_id, $seat_number]);
            $booking_id = $pdo->lastInsertId();

            // Create payment
            $stmt = $pdo->prepare("INSERT INTO payments (booking_id, amount, payment_method, transaction_id, status) VALUES (?, ?, ?, ?, 'Success')");
            $stmt->execute([$booking_id, $amount, $payment_method, $transaction_id]);

            // Reduce seats
            $stmt = $pdo->prepare("UPDATE flights SET available_seats = available_seats - 1 WHERE id = ?");
            $stmt->execute([$flight_id]);

            $pdo->commit();
            header("Location: booking_success.php?booking_id=$booking_id");
            exit();
        } else {
            $pdo->rollBack();
            $error = "Sorry, seats are no longer available.";
        }
    } catch(Exception $e) {
        $pdo->rollBack();
        $error = "Booking failed: " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Book Ticket - SkyFly Airlines</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .flight-details {
            background: #f8f9fa;
            border-left: 4px solid #023047;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            border-bottom: 1px dashed #ccc;
            padding-bottom: 10px;
        }
        .info-row span { font-size: 1.1rem; }
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
    <div class="container d-flex" style="justify-content:center;">
        <div class="card card-large">
            <h2 class="text-center mb-3">Review & Book Flight</h2>
            <?php if ($error) echo "<div class='alert alert-error'>$error</div>"; ?>

            <div class="flight-details">
                <div class="info-row">
                    <span><strong>Flight:</strong> <?php echo $flight['airline']; ?> (<?php echo $flight['flight_number']; ?>)</span>
                    <span><strong>Price:</strong> $<?php echo number_format($flight['price'], 2); ?></span>
                </div>
                <div class="info-row">
                    <span><strong>From:</strong> <?php echo $flight['departure_city']; ?></span>
                    <span><strong>Departure:</strong> <?php echo date('d M Y, h:i A', strtotime($flight['departure_time'])); ?></span>
                </div>
                <div class="info-row">
                    <span><strong>To:</strong> <?php echo $flight['arrival_city']; ?></span>
                    <span><strong>Arrival:</strong> <?php echo date('d M Y, h:i A', strtotime($flight['arrival_time'])); ?></span>
                </div>
            </div>

            <form id="bookingForm" method="POST">
                <input type="hidden" name="payment_status" id="paymentStatus" value="Pending">
                <div class="form-group">
                    <label>Passenger Name</label>
                    <input type="text" class="form-control" value="<?php echo htmlspecialchars($_SESSION['user_name']); ?>" readonly>
                </div>
                <div class="form-group">
                    <label>Select Your Seat</label>
                    <div style="background: white; border: 1px solid #ccc; padding: 15px; border-radius: 6px;">
                        <select name="seat_number" class="form-control" required style="cursor: pointer;">
                            <option value="">-- Click to choose an available seat --</option>
                            <?php
                            // Fetch already booked seats for this flight
                            $stmt = $pdo->prepare("SELECT seat_number FROM bookings WHERE flight_id = ? AND status = 'Confirmed'");
                            $stmt->execute([$flight_id]);
                            $booked_seats = $stmt->fetchAll(PDO::FETCH_COLUMN);

                            // We assume a simple structure: Rows 1 to 20, Seats A, B, C, D, E, F
                            $rows = ceil($flight['total_seats'] / 6);
                            $cols = ['A', 'B', 'C', 'D', 'E', 'F'];
                            
                            for ($r = 1; $r <= $rows; $r++) {
                                foreach ($cols as $c) {
                                    $seat = $r . $c;
                                    // Check if we haven't exceeded total capacity and seat isn't booked
                                    if ((($r - 1) * 6 + array_search($c, $cols) + 1) <= $flight['total_seats']) {
                                        if (in_array($seat, $booked_seats)) {
                                            echo "<option value='$seat' disabled>Seat $seat - Already Booked</option>";
                                        } else {
                                            echo "<option value='$seat'>Seat $seat - Available</option>";
                                        }
                                    }
                                }
                            }
                            ?>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Select Payment Gateway</label>
                    <select name="payment_method" id="paymentMethod" class="form-control">
                        <option value="Credit Card">Credit / Debit Card</option>
                        <option value="PayPal">PayPal API</option>
                        <option value="Razorpay">Razorpay</option>
                    </select>
                </div>

                <div class="text-center mt-4">
                    <button type="button" class="btn" style="width:100%; background:#28a745; font-size:1.2rem;" onclick="openPaymentGateway()">Pay $<?php echo number_format($flight['price'], 2); ?> & Confirm Booking</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Payment Modal Simulation -->
    <div class="payment-modal" id="paymentModal">
        <div class="payment-content">
            <span class="close-btn" onclick="closePaymentGateway()">×</span>
            <h3 class="mb-3" id="paymentTitle">Processing Payment</h3>
            <p>Please do not close or refresh this window.</p>
            <div id="loader" style="margin:20px auto; width:40px; height:40px; border:4px solid #f3f3f3; border-top:4px solid #023047; border-radius:50%; animation:spin 1s linear infinite;"></div>
            <p id="paymentMsg" style="color:#023047; font-weight:bold;"></p>
        </div>
    </div>

    <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>

    <script>
        function openPaymentGateway() {
            var method = document.getElementById('paymentMethod').value;
            document.getElementById('paymentTitle').innerText = method + ' Secure Checkout';
            document.getElementById('paymentModal').classList.add('active');
            
            // Simulate API interaction delay
            setTimeout(() => {
                document.getElementById('loader').style.borderTopColor = "#28a745";
                document.getElementById('paymentMsg').innerText = "Payment Successful! Redirecting...";
                document.getElementById('paymentMsg').style.color = "#28a745";
                document.getElementById('paymentStatus').value = "Success";
                setTimeout(() => {
                    document.getElementById('bookingForm').submit();
                }, 1500);
            }, 3000);
        }

        function closePaymentGateway() {
            document.getElementById('paymentModal').classList.remove('active');
        }
    </script>
</body>
</html>
