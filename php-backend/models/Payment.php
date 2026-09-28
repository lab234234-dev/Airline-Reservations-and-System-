<?php
require_once dirname(__DIR__) . '/config/database.php';

class Payment {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function create($data) {
        $stmt = $this->pdo->prepare("
            INSERT INTO payments (user_id, booking_id, amount, payment_method, transaction_id, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['userId'] ?? $data['user_id'],
            $data['bookingId'] ?? $data['booking_id'] ?? null,
            $data['amount'],
            $data['paymentMethod'] ?? $data['payment_method'] ?? 'Credit Card',
            $data['transactionId'] ?? $data['transaction_id'],
            $data['status'] ?? 'success'
        ]);
        return $this->pdo->lastInsertId();
    }

    public function getTotalRevenue() {
        $stmt = $this->pdo->query("SELECT SUM(amount) FROM payments WHERE status = 'success'");
        return (float) ($stmt->fetchColumn() ?: 0);
    }
}
