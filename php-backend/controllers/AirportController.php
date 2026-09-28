<?php
require_once dirname(__DIR__) . '/models/AirportBooking.php';
require_once dirname(__DIR__) . '/models/Flight.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';
require_once dirname(__DIR__) . '/utils/Response.php';

class AirportController {
    private $airportBookingModel;
    private $flightModel;

    public function __construct() {
        $this->airportBookingModel = new AirportBooking();
        $this->flightModel = new Flight();
    }

    public function bookCounterTicket($input) {
        $currentUser = AuthMiddleware::requireAdmin();

        $travelDetails = $input['travelDetails'] ?? [];
        $passengers = $input['passengers'] ?? [];
        $contact = $input['contact'] ?? [];
        $billing = $input['billing'] ?? [];

        $flightId = $travelDetails['flightId'] ?? null;
        if (empty($flightId)) {
            Response::error('Flight ID is required');
        }

        if (empty($passengers) || !is_array($passengers)) {
            Response::error('At least one passenger is required');
        }

        $flight = $this->flightModel->findById($flightId);
        if (!$flight) {
            Response::error('Flight not found', 404);
        }

        if ($flight['seatsAvailable'] < count($passengers)) {
            Response::error("Not enough seats available. Only {$flight['seatsAvailable']} seats remaining.", 400);
        }

        // Validate seats are not already booked
        $requestedSeats = [];
        foreach ($passengers as $p) {
            if (!empty($p['seatNumber'])) {
                $requestedSeats[] = strtoupper($p['seatNumber']);
            }
        }

        $existingBooked = array_map('strtoupper', $flight['bookedSeats'] ?? []);
        foreach ($requestedSeats as $seat) {
            if (in_array($seat, $existingBooked)) {
                Response::error("Seat {$seat} has already been reserved! Please select another seat.", 409);
            }
        }

        // Generate PNR
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $pnr = 'SK';
        for ($i = 0; $i < 4; $i++) {
            $pnr .= $chars[rand(0, strlen($chars) - 1)];
        }

        // Reserve seats
        $this->flightModel->reserveSeats($flightId, $requestedSeats, count($passengers));

        $booking = $this->airportBookingModel->create([
            'pnr' => $pnr,
            'agentId' => $currentUser['id'],
            'agentName' => $currentUser['name'] ?? 'Airport Desk Agent',
            'flightId' => $flightId,
            'travelClass' => $travelDetails['class'] ?? 'Economy',
            'passengers' => $passengers,
            'phone' => $contact['phone'] ?? '',
            'email' => $contact['email'] ?? '',
            'baseFare' => $billing['baseFare'] ?? $flight['price'],
            'addOnCharges' => $billing['addOnCharges'] ?? 0,
            'totalPaid' => $billing['totalPaid'] ?? $flight['price'],
            'paymentStatus' => 'COMPLETED',
            'paymentMethod' => $billing['paymentMethod'] ?? 'CASH'
        ]);

        Response::json([
            'message' => 'Airport counter ticket issued successfully!',
            'pnr' => $pnr,
            'booking' => $booking
        ], 201);
    }

    public function getCounterBookings() {
        AuthMiddleware::requireAdmin();
        $bookings = $this->airportBookingModel->findAll();
        Response::json($bookings);
    }
}
