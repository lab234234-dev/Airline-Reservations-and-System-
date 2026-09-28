<?php
require_once dirname(__DIR__) . '/config/database.php';
require_once __DIR__ . '/Flight.php';

class Booking {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function create($data) {
        $stmt = $this->pdo->prepare("
            INSERT INTO bookings (
                user_id, flight_id, origin, destination, airline, flight_number,
                pnr, seat_number, passengers, total_amount, payment_status,
                payment_method, booking_status, check_in_status, flight_flying_status,
                boarding_pass_issued, gate, terminal, boarding_time, transaction_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $passengersJson = is_array($data['passengers']) ? json_encode($data['passengers']) : $data['passengers'];

        $stmt->execute([
            $data['userId'] ?? $data['user_id'],
            $data['flightId'] ?? $data['flight_id'],
            $data['origin'] ?? '',
            $data['destination'] ?? '',
            $data['airline'] ?? '',
            $data['flightNumber'] ?? $data['flight_number'] ?? '',
            $data['pnr'],
            $data['seatNumber'] ?? $data['seat_number'] ?? '',
            $passengersJson,
            $data['totalAmount'] ?? $data['total_amount'],
            $data['paymentStatus'] ?? $data['payment_status'] ?? 'paid',
            $data['paymentMethod'] ?? $data['payment_method'] ?? 'Credit/Debit Card',
            $data['bookingStatus'] ?? $data['booking_status'] ?? 'confirmed',
            $data['checkInStatus'] ?? $data['check_in_status'] ?? 'pending',
            $data['flightFlyingStatus'] ?? $data['flight_flying_status'] ?? 'Check-In Required',
            $data['boardingPassIssued'] ?? $data['boarding_pass_issued'] ?? 0,
            $data['gate'] ?? 'B' . rand(1, 12),
            $data['terminal'] ?? 'T' . rand(1, 3),
            $data['boardingTime'] ?? '45m Before Departure',
            $data['transactionId'] ?? $data['transaction_id'] ?? ''
        ]);

        return $this->findById($this->pdo->lastInsertId());
    }

    public function findById($id) {
        $stmt = $this->pdo->prepare("
            SELECT b.*, 
                   f.flight_number as f_number, f.airline as f_airline, f.origin as f_origin, 
                   f.destination as f_destination, f.departure_time as f_dep, f.arrival_time as f_arr,
                   f.price as f_price,
                   u.name as u_name, u.email as u_email, u.phone as u_phone, u.profile_pic as u_profile_pic
            FROM bookings b
            LEFT JOIN flights f ON b.flight_id = f.id
            LEFT JOIN users u ON b.user_id = u.id
            WHERE b.id = ? LIMIT 1
        ");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ? $this->formatBooking($row) : null;
    }

    public function findByPnr($pnr) {
        $cleanPnr = trim(strtoupper($pnr));
        $stmt = $this->pdo->prepare("
            SELECT b.*, 
                   f.flight_number as f_number, f.airline as f_airline, f.origin as f_origin, 
                   f.destination as f_destination, f.departure_time as f_dep, f.arrival_time as f_arr,
                   f.price as f_price,
                   u.name as u_name, u.email as u_email, u.phone as u_phone, u.profile_pic as u_profile_pic
            FROM bookings b
            LEFT JOIN flights f ON b.flight_id = f.id
            LEFT JOIN users u ON b.user_id = u.id
            WHERE UPPER(b.pnr) = ? LIMIT 1
        ");
        $stmt->execute([$cleanPnr]);
        $row = $stmt->fetch();
        return $row ? $this->formatBooking($row) : null;
    }

    public function findByUserId($userId) {
        $stmt = $this->pdo->prepare("
            SELECT b.*, 
                   f.flight_number as f_number, f.airline as f_airline, f.origin as f_origin, 
                   f.destination as f_destination, f.departure_time as f_dep, f.arrival_time as f_arr,
                   f.price as f_price,
                   u.name as u_name, u.email as u_email, u.phone as u_phone, u.profile_pic as u_profile_pic
            FROM bookings b
            LEFT JOIN flights f ON b.flight_id = f.id
            LEFT JOIN users u ON b.user_id = u.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        ");
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll();
        return array_map([$this, 'formatBooking'], $rows);
    }

    public function findAll() {
        $stmt = $this->pdo->query("
            SELECT b.*, 
                   f.flight_number as f_number, f.airline as f_airline, f.origin as f_origin, 
                   f.destination as f_destination, f.departure_time as f_dep, f.arrival_time as f_arr,
                   f.price as f_price,
                   u.name as u_name, u.email as u_email, u.phone as u_phone, u.profile_pic as u_profile_pic
            FROM bookings b
            LEFT JOIN flights f ON b.flight_id = f.id
            LEFT JOIN users u ON b.user_id = u.id
            ORDER BY b.created_at DESC
        ");
        $rows = $stmt->fetchAll();
        return array_map([$this, 'formatBooking'], $rows);
    }

    public function completeCheckIn($id) {
        $booking = $this->findById($id);
        if (!$booking) return null;

        $gate = $booking['gate'] ?: 'B' . rand(1, 12);
        $terminal = $booking['terminal'] ?: 'T' . rand(1, 3);
        $boardingTime = '45m Before Departure';

        $stmt = $this->pdo->prepare("
            UPDATE bookings
            SET check_in_status = 'completed',
                boarding_pass_issued = 1,
                flight_flying_status = 'In Flight ✈️ (Flying)',
                gate = ?,
                terminal = ?,
                boarding_time = ?
            WHERE id = ?
        ");
        $stmt->execute([$gate, $terminal, $boardingTime, $id]);

        return $this->findById($id);
    }

    public function cancel($id) {
        $booking = $this->findById($id);
        if (!$booking) return null;

        $stmt = $this->pdo->prepare("UPDATE bookings SET booking_status = 'cancelled' WHERE id = ?");
        $stmt->execute([$id]);

        // Release seats on flight
        if (!empty($booking['flightId']) && !empty($booking['passengers'])) {
            $flightModel = new Flight();
            $seatsToRelease = [];
            foreach ($booking['passengers'] as $p) {
                if (!empty($p['seatNumber'])) {
                    $seatsToRelease[] = $p['seatNumber'];
                }
            }
            $flightModel->releaseSeats($booking['flightId'], $seatsToRelease, count($booking['passengers']));
        }

        return $this->findById($id);
    }

    public function countAll() {
        return (int) $this->pdo->query("SELECT COUNT(*) FROM bookings")->fetchColumn();
    }

    public function countCheckedIn() {
        return (int) $this->pdo->query("SELECT COUNT(*) FROM bookings WHERE check_in_status = 'completed'")->fetchColumn();
    }

    public function getRouteStats() {
        $stmt = $this->pdo->query("
            SELECT origin, destination, COUNT(*) as count, SUM(total_amount) as revenue
            FROM bookings
            WHERE booking_status != 'cancelled'
            GROUP BY origin, destination
            ORDER BY count DESC
            LIMIT 6
        ");
        $rows = $stmt->fetchAll();
        $stats = [];
        foreach ($rows as $r) {
            $stats[] = [
                '_id' => ($r['origin'] ?: 'Origin') . ' ➔ ' . ($r['destination'] ?: 'Dest'),
                'count' => (int) $r['count'],
                'revenue' => (float) $r['revenue']
            ];
        }
        return $stats;
    }

    public function getAirlineStats() {
        $stmt = $this->pdo->query("
            SELECT airline, COUNT(*) as count, SUM(total_amount) as revenue
            FROM bookings
            WHERE booking_status != 'cancelled'
            GROUP BY airline
            ORDER BY revenue DESC
        ");
        $rows = $stmt->fetchAll();
        $stats = [];
        foreach ($rows as $r) {
            $stats[] = [
                '_id' => $r['airline'] ?: 'SkyHigh Air',
                'count' => (int) $r['count'],
                'revenue' => (float) $r['revenue']
            ];
        }
        return $stats;
    }

    public function getPaymentMethodStats() {
        $stmt = $this->pdo->query("
            SELECT payment_method, COUNT(*) as count, SUM(total_amount) as revenue
            FROM bookings
            GROUP BY payment_method
            ORDER BY count DESC
        ");
        $rows = $stmt->fetchAll();
        $stats = [];
        foreach ($rows as $r) {
            $stats[] = [
                '_id' => $r['payment_method'] ?: 'Credit/Debit Card',
                'count' => (int) $r['count'],
                'revenue' => (float) $r['revenue']
            ];
        }
        return $stats;
    }

    private function formatBooking($row) {
        $passengers = json_decode($row['passengers'] ?? '[]', true) ?: [];

        $flight = null;
        if (!empty($row['f_number']) || !empty($row['flight_id'])) {
            $flight = [
                '_id' => (string) ($row['flight_id'] ?? ''),
                'id' => (int) ($row['flight_id'] ?? 0),
                'flightNumber' => $row['f_number'] ?? $row['flight_number'] ?? '',
                'airline' => $row['f_airline'] ?? $row['airline'] ?? '',
                'origin' => $row['f_origin'] ?? $row['origin'] ?? '',
                'destination' => $row['f_destination'] ?? $row['destination'] ?? '',
                'departureTime' => $row['f_dep'] ?? '',
                'arrivalTime' => $row['f_arr'] ?? '',
                'price' => (float) ($row['f_price'] ?? $row['total_amount'] ?? 0)
            ];
        }

        $user = null;
        if (isset($row['u_name'])) {
            $user = [
                '_id' => (string) $row['user_id'],
                'id' => (int) $row['user_id'],
                'name' => $row['u_name'] ?? 'User',
                'email' => $row['u_email'] ?? '',
                'phone' => $row['u_phone'] ?? '',
                'profilePic' => $row['u_profile_pic'] ?? '',
                'profile_pic' => $row['u_profile_pic'] ?? ''
            ];
        }

        return [
            '_id' => (string) $row['id'],
            'id' => (int) $row['id'],
            'user' => $user ?: (string) $row['user_id'],
            'userId' => (int) $row['user_id'],
            'flight' => $flight,
            'flightId' => (int) $row['flight_id'],
            'origin' => $row['origin'],
            'destination' => $row['destination'],
            'airline' => $row['airline'],
            'flightNumber' => $row['flight_number'],
            'pnr' => $row['pnr'],
            'seatNumber' => $row['seat_number'],
            'passengers' => $passengers,
            'totalAmount' => (float) $row['total_amount'],
            'paymentStatus' => $row['payment_status'],
            'paymentMethod' => $row['payment_method'],
            'bookingStatus' => $row['booking_status'],
            'checkInStatus' => $row['check_in_status'],
            'flightFlyingStatus' => $row['flight_flying_status'],
            'boardingPassIssued' => (bool) $row['boarding_pass_issued'],
            'gate' => $row['gate'],
            'terminal' => $row['terminal'],
            'boardingTime' => $row['boarding_time'],
            'transactionId' => $row['transaction_id'],
            'createdAt' => $row['created_at'] ?? '',
            'updatedAt' => $row['updated_at'] ?? ''
        ];
    }
}
