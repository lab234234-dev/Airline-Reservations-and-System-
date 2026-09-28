<?php
require_once dirname(__DIR__) . '/config/database.php';

class Flight {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function search($origin = null, $destination = null, $date = null) {
        $sql = "SELECT * FROM flights WHERE 1=1";
        $params = [];

        if (!empty($origin)) {
            $sql .= " AND LOWER(origin) LIKE LOWER(?)";
            $params[] = '%' . trim($origin) . '%';
        }

        if (!empty($destination)) {
            $sql .= " AND LOWER(destination) LIKE LOWER(?)";
            $params[] = '%' . trim($destination) . '%';
        }

        if (!empty($date)) {
            $sql .= " AND DATE(departure_time) = DATE(?)";
            $params[] = $date;
        }

        $sql .= " ORDER BY departure_time ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        return array_map([$this, 'formatFlight'], $rows);
    }

    public function findById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM flights WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ? $this->formatFlight($row) : null;
    }

    public function create($data) {
        $stmt = $this->pdo->prepare("
            INSERT INTO flights (flight_number, airline, origin, destination, departure_time, arrival_time, price, seats_available, total_seats, booked_seats, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['flightNumber'] ?? $data['flight_number'],
            $data['airline'],
            $data['origin'],
            $data['destination'],
            $data['departureTime'] ?? $data['departure_time'],
            $data['arrivalTime'] ?? $data['arrival_time'],
            $data['price'],
            $data['seatsAvailable'] ?? $data['seats_available'] ?? $data['totalSeats'] ?? 150,
            $data['totalSeats'] ?? $data['total_seats'] ?? 150,
            json_encode($data['bookedSeats'] ?? $data['booked_seats'] ?? []),
            $data['status'] ?? 'scheduled'
        ]);
        return $this->findById($this->pdo->lastInsertId());
    }

    public function update($id, $data) {
        $flight = $this->findById($id);
        if (!$flight) return null;

        $flightNumber = $data['flightNumber'] ?? $data['flight_number'] ?? $flight['flightNumber'];
        $airline = $data['airline'] ?? $flight['airline'];
        $origin = $data['origin'] ?? $flight['origin'];
        $destination = $data['destination'] ?? $flight['destination'];
        $departureTime = $data['departureTime'] ?? $data['departure_time'] ?? $flight['departureTime'];
        $arrivalTime = $data['arrivalTime'] ?? $data['arrival_time'] ?? $flight['arrivalTime'];
        $price = $data['price'] ?? $flight['price'];
        $seatsAvailable = $data['seatsAvailable'] ?? $data['seats_available'] ?? $flight['seatsAvailable'];
        $totalSeats = $data['totalSeats'] ?? $data['total_seats'] ?? $flight['totalSeats'];
        $status = $data['status'] ?? $flight['status'];
        $bookedSeats = isset($data['bookedSeats']) ? json_encode($data['bookedSeats']) : (isset($data['booked_seats']) ? json_encode($data['booked_seats']) : json_encode($flight['bookedSeats']));

        $stmt = $this->pdo->prepare("
            UPDATE flights 
            SET flight_number = ?, airline = ?, origin = ?, destination = ?, departure_time = ?, arrival_time = ?, price = ?, seats_available = ?, total_seats = ?, booked_seats = ?, status = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $flightNumber, $airline, $origin, $destination, $departureTime, $arrivalTime, $price, $seatsAvailable, $totalSeats, $bookedSeats, $status, $id
        ]);

        return $this->findById($id);
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("DELETE FROM flights WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function reserveSeats($id, $seatsArray, $decrementCount) {
        $flight = $this->findById($id);
        if (!$flight) return false;

        $existingBooked = $flight['bookedSeats'] ?: [];
        $newBooked = array_unique(array_merge($existingBooked, $seatsArray));
        $newAvailable = max(0, $flight['seatsAvailable'] - $decrementCount);

        $stmt = $this->pdo->prepare("UPDATE flights SET booked_seats = ?, seats_available = ? WHERE id = ?");
        return $stmt->execute([json_encode(array_values($newBooked)), $newAvailable, $id]);
    }

    public function releaseSeats($id, $seatsArray, $incrementCount) {
        $flight = $this->findById($id);
        if (!$flight) return false;

        $existingBooked = $flight['bookedSeats'] ?: [];
        $newBooked = array_diff($existingBooked, $seatsArray);
        $newAvailable = min($flight['totalSeats'], $flight['seatsAvailable'] + $incrementCount);

        $stmt = $this->pdo->prepare("UPDATE flights SET booked_seats = ?, seats_available = ? WHERE id = ?");
        return $stmt->execute([json_encode(array_values($newBooked)), $newAvailable, $id]);
    }

    public function countAll() {
        return (int) $this->pdo->query("SELECT COUNT(*) FROM flights")->fetchColumn();
    }

    public function getOccupancyStats() {
        $stmt = $this->pdo->query("SELECT SUM(total_seats) as total, SUM(seats_available) as available FROM flights");
        $res = $stmt->fetch();
        $total = (int)($res['total'] ?? 0);
        $available = (int)($res['available'] ?? 0);
        $booked = max(0, $total - $available);
        $rate = $total > 0 ? round(($booked / $total) * 100) : 75;
        return [
            'totalSeats' => $total,
            'availableSeats' => $available,
            'bookedSeats' => $booked,
            'rate' => $rate
        ];
    }

    private function formatFlight($row) {
        $booked = json_decode($row['booked_seats'] ?? '[]', true) ?: [];
        return [
            '_id' => (string) $row['id'],
            'id' => (int) $row['id'],
            'flightNumber' => $row['flight_number'],
            'airline' => $row['airline'],
            'origin' => $row['origin'],
            'destination' => $row['destination'],
            'departureTime' => $row['departure_time'],
            'arrivalTime' => $row['arrival_time'],
            'price' => (float) $row['price'],
            'seatsAvailable' => (int) $row['seats_available'],
            'totalSeats' => (int) $row['total_seats'],
            'bookedSeats' => $booked,
            'status' => $row['status'] ?? 'scheduled',
            'createdAt' => $row['created_at'] ?? '',
            'updatedAt' => $row['updated_at'] ?? ''
        ];
    }
}
