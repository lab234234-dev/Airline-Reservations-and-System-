<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

if (isset($_GET['id'])) {
    $booking_id = (int)$_GET['id'];
    $user_id = $_SESSION['user_id'];

    // Verify booking belongs to user
    $stmt = $pdo->prepare("SELECT flight_id, status FROM bookings WHERE id = ? AND user_id = ?");
    $stmt->execute([$booking_id, $user_id]);
    $booking = $stmt->fetch();

    if ($booking && $booking['status'] == 'Confirmed') {
        try {
            $pdo->beginTransaction();
            
            // Mark as Cancelled
            $update = $pdo->prepare("UPDATE bookings SET status = 'Cancelled' WHERE id = ?");
            $update->execute([$booking_id]);

            // Refund seats
            $refund = $pdo->prepare("UPDATE flights SET available_seats = available_seats + 1 WHERE id = ?");
            $refund->execute([$booking['flight_id']]);

            $pdo->commit();
        } catch (Exception $e) {
            $pdo->rollBack();
        }
    }
}
header("Location: booking_history.php");
exit();
?>
