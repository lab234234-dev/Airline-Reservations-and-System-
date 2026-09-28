<?php
require_once dirname(__DIR__) . '/models/Booking.php';
require_once dirname(__DIR__) . '/models/Flight.php';
require_once dirname(__DIR__) . '/models/Payment.php';
require_once dirname(__DIR__) . '/models/User.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';
require_once dirname(__DIR__) . '/utils/Response.php';

class BookingController {
    private $bookingModel;
    private $flightModel;
    private $paymentModel;
    private $userModel;

    public function __construct() {
        $this->bookingModel = new Booking();
        $this->flightModel = new Flight();
        $this->paymentModel = new Payment();
        $this->userModel = new User();
    }

    public function store($input) {
        $currentUser = AuthMiddleware::authenticate();

        $flightId = $input['flightId'] ?? $input['flight_id'] ?? null;
        $passengers = $input['passengers'] ?? [];
        $totalAmount = $input['totalAmount'] ?? $input['total_amount'] ?? 0;
        $paymentMethod = $input['paymentMethod'] ?? $input['payment_method'] ?? 'Credit/Debit Card';
        $paymentStatus = $input['paymentStatus'] ?? $input['payment_status'] ?? 'paid';

        if (empty($flightId)) {
            Response::error('Flight ID is required');
        }

        $flight = $this->flightModel->findById($flightId);
        if (!$flight) {
            Response::error('Flight not found', 404);
        }

        $passengerCount = count($passengers) > 0 ? count($passengers) : 1;
        if ($flight['seatsAvailable'] < $passengerCount) {
            Response::error('Not enough seats available on this flight', 400);
        }

        // Generate Transaction ID and unique PNR
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $pnrCode = 'SH-';
        for ($i = 0; $i < 5; $i++) {
            $pnrCode .= $chars[rand(0, strlen($chars) - 1)];
        }

        $txnId = 'TXN-' . strtoupper(bin2hex(random_bytes(4)));

        // Determine seat numbers
        $seatNumbers = [];
        if (!empty($passengers)) {
            foreach ($passengers as $p) {
                if (!empty($p['seatNumber'])) {
                    $seatNumbers[] = $p['seatNumber'];
                }
            }
        }
        $seatString = !empty($seatNumbers) ? implode(', ', $seatNumbers) : ($input['seatNumber'] ?? '12A');

        $booking = $this->bookingModel->create([
            'userId' => $currentUser['id'],
            'flightId' => $flight['id'],
            'origin' => $flight['origin'],
            'destination' => $flight['destination'],
            'airline' => $flight['airline'],
            'flightNumber' => $flight['flightNumber'],
            'pnr' => $pnrCode,
            'seatNumber' => $seatString,
            'passengers' => $passengers,
            'totalAmount' => $totalAmount ?: $flight['price'],
            'paymentStatus' => $paymentStatus,
            'paymentMethod' => $paymentMethod,
            'bookingStatus' => 'confirmed',
            'checkInStatus' => 'pending',
            'flightFlyingStatus' => 'Check-In Required',
            'boardingPassIssued' => 0,
            'gate' => 'B' . rand(1, 12),
            'terminal' => 'T' . rand(1, 3),
            'boardingTime' => '45m Before Departure',
            'transactionId' => $txnId
        ]);

        // Record payment
        try {
            $this->paymentModel->create([
                'userId' => $currentUser['id'],
                'bookingId' => $booking['id'],
                'amount' => $totalAmount ?: $flight['price'],
                'paymentMethod' => $paymentMethod,
                'transactionId' => $txnId,
                'status' => 'success'
            ]);
        } catch (Exception $e) {
            // Payment record logged
        }

        // Award rewards points (10% of total)
        try {
            $points = floor(($totalAmount ?: $flight['price']) * 0.1);
            $this->userModel->addRewardPoints($currentUser['id'], $points);
        } catch (Exception $e) {
            // Reward point logged
        }

        // Reserve seats on flight
        if (!empty($seatNumbers)) {
            $this->flightModel->reserveSeats($flight['id'], $seatNumbers, $passengerCount);
        }

        Response::json([
            'booking' => $booking,
            'message' => 'Payment received & booking confirmed successfully!',
            'paymentRequired' => false
        ], 201);
    }

    public function myBookings() {
        $currentUser = AuthMiddleware::authenticate();
        $bookings = $this->bookingModel->findByUserId($currentUser['id']);
        Response::json($bookings);
    }

    public function index() {
        AuthMiddleware::requireAdmin();
        $bookings = $this->bookingModel->findAll();
        Response::json($bookings);
    }

    public function show($id) {
        $currentUser = AuthMiddleware::authenticate();
        $booking = $this->bookingModel->findById($id);

        if (!$booking) {
            Response::error('Booking not found', 404);
        }

        if ($booking['userId'] != $currentUser['id'] && $currentUser['role'] !== 'admin' && $currentUser['role'] !== 'agent') {
            Response::error('Not authorized to view this booking', 403);
        }

        Response::json($booking);
    }

    public function cancel($id) {
        $currentUser = AuthMiddleware::authenticate();
        $booking = $this->bookingModel->findById($id);

        if (!$booking) {
            Response::error('Booking not found', 404);
        }

        if ($booking['userId'] != $currentUser['id'] && $currentUser['role'] !== 'admin') {
            Response::error('Not authorized to cancel this booking', 403);
        }

        if ($booking['bookingStatus'] === 'cancelled') {
            Response::error('Booking is already cancelled', 400);
        }

        $cancelled = $this->bookingModel->cancel($id);
        Response::json([
            'message' => 'Booking cancelled successfully. Refund initiated to original payment method.',
            'booking' => $cancelled
        ]);
    }

    public function completeCheckIn($id) {
        $currentUser = AuthMiddleware::authenticate();
        $booking = $this->bookingModel->findById($id);

        if (!$booking) {
            Response::error('Booking not found', 404);
        }

        $updated = $this->bookingModel->completeCheckIn($id);
        Response::json([
            'message' => 'Web Check-In confirmed! Boarding pass issued and flight marked ready for flying.',
            'booking' => $updated
        ]);
    }

    public function completeCheckInByPnr($input) {
        $pnr = trim($input['pnr'] ?? '');
        if (empty($pnr)) {
            Response::error('PNR is required');
        }

        $booking = $this->bookingModel->findByPnr($pnr);
        if (!$booking) {
            Response::error('Booking not found for this PNR: ' . $pnr, 404);
        }

        $updated = $this->bookingModel->completeCheckIn($booking['id']);
        Response::json([
            'message' => 'Web Check-In confirmed! Boarding pass issued and flight marked ready for flying.',
            'booking' => $updated
        ]);
    }
}
