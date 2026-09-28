<?php
require_once dirname(__DIR__) . '/models/Flight.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';
require_once dirname(__DIR__) . '/utils/Response.php';

class FlightController {
    private $flightModel;

    public function __construct() {
        $this->flightModel = new Flight();
    }

    public function index($queryParams) {
        $origin = $queryParams['origin'] ?? null;
        $destination = $queryParams['destination'] ?? null;
        $date = $queryParams['date'] ?? null;

        $flights = $this->flightModel->search($origin, $destination, $date);
        Response::json($flights);
    }

    public function show($id) {
        $flight = $this->flightModel->findById($id);
        if (!$flight) {
            Response::error('Flight not found', 404);
        }
        Response::json($flight);
    }

    public function store($input) {
        AuthMiddleware::requireAdmin();

        $flightNumber = trim($input['flightNumber'] ?? $input['flight_number'] ?? '');
        $airline = trim($input['airline'] ?? '');
        $origin = trim($input['origin'] ?? '');
        $destination = trim($input['destination'] ?? '');
        $departureTime = $input['departureTime'] ?? $input['departure_time'] ?? '';
        $arrivalTime = $input['arrivalTime'] ?? $input['arrival_time'] ?? '';
        $price = $input['price'] ?? 0;
        $totalSeats = $input['totalSeats'] ?? $input['total_seats'] ?? 150;

        if (empty($flightNumber) || empty($origin) || empty($destination) || empty($departureTime) || empty($arrivalTime)) {
            Response::error('Please fill in all mandatory flight fields');
        }

        $flight = $this->flightModel->create([
            'flightNumber' => $flightNumber,
            'airline' => $airline,
            'origin' => $origin,
            'destination' => $destination,
            'departureTime' => $departureTime,
            'arrivalTime' => $arrivalTime,
            'price' => $price,
            'totalSeats' => $totalSeats,
            'seatsAvailable' => $totalSeats,
            'bookedSeats' => []
        ]);

        Response::json($flight, 201);
    }

    public function update($id, $input) {
        AuthMiddleware::requireAdmin();

        $flight = $this->flightModel->update($id, $input);
        if (!$flight) {
            Response::error('Flight not found', 404);
        }
        Response::json($flight);
    }

    public function destroy($id) {
        AuthMiddleware::requireAdmin();

        $flight = $this->flightModel->findById($id);
        if (!$flight) {
            Response::error('Flight not found', 404);
        }

        $this->flightModel->delete($id);
        Response::success('Flight deleted successfully');
    }
}
