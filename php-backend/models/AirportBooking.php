<?php
require_once dirname(__DIR__) . '/config/database.php';

class AirportBooking {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function create($data) {
        $stmt = $this->pdo->prepare("
            INSERT INTO airport_bookings (
                pnr, agent_id, agent_name, booking_channel, flight_id,
                travel_class, passengers, phone, email, base_fare,
                add_on_charges, total_paid, payment_status, payment_method
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $passengersJson = is_array($data['passengers']) ? json_encode($data['passengers']) : $data['passengers'];

        $stmt->execute([
            $data['pnr'],
            $data['agentId'] ?? $data['agent_id'] ?? 1,
            $data['agentName'] ?? $data['agent_name'] ?? 'Airport Desk Agent',
            'AIRPORT_COUNTER',
            $data['flightId'] ?? $data['flight_id'],
            $data['travelClass'] ?? $data['travel_class'] ?? 'Economy',
            $passengersJson,
            $data['phone'] ?? '',
            $data['email'] ?? '',
            $data['baseFare'] ?? $data['base_fare'] ?? 0,
            $data['addOnCharges'] ?? $data['add_on_charges'] ?? 0,
            $data['totalPaid'] ?? $data['total_paid'] ?? 0,
            $data['paymentStatus'] ?? $data['payment_status'] ?? 'COMPLETED',
            $data['paymentMethod'] ?? $data['payment_method'] ?? 'CASH'
        ]);

        return $this->findById($this->pdo->lastInsertId());
    }

    public function findById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM airport_bookings WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ? $this->format($row) : null;
    }

    public function findByPnr($pnr) {
        $stmt = $this->pdo->prepare("SELECT * FROM airport_bookings WHERE UPPER(pnr) = ? LIMIT 1");
        $stmt->execute([trim(strtoupper($pnr))]);
        $row = $stmt->fetch();
        return $row ? $this->format($row) : null;
    }

    public function findAll() {
        $stmt = $this->pdo->query("SELECT * FROM airport_bookings ORDER BY created_at DESC");
        $rows = $stmt->fetchAll();
        return array_map([$this, 'format'], $rows);
    }

    private function format($row) {
        $passengers = json_decode($row['passengers'] ?? '[]', true) ?: [];
        return [
            '_id' => (string) $row['id'],
            'id' => (int) $row['id'],
            'pnr' => $row['pnr'],
            'agentId' => $row['agent_id'],
            'agentName' => $row['agent_name'],
            'bookingChannel' => $row['booking_channel'],
            'travelDetails' => [
                'flightId' => (string) $row['flight_id'],
                'class' => $row['travel_class']
            ],
            'passengers' => $passengers,
            'contact' => [
                'phone' => $row['phone'],
                'email' => $row['email']
            ],
            'billing' => [
                'baseFare' => (float) $row['base_fare'],
                'addOnCharges' => (float) $row['add_on_charges'],
                'totalPaid' => (float) $row['total_paid'],
                'paymentStatus' => $row['payment_status'],
                'paymentMethod' => $row['payment_method']
            ],
            'createdAt' => $row['created_at'] ?? ''
        ];
    }
}
