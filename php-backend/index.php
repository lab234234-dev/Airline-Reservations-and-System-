<?php
// SkyHigh Air - PHP REST API Front Controller

error_reporting(E_ALL);
ini_set('display_errors', '0'); // Return JSON errors instead of HTML

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/FlightController.php';
require_once __DIR__ . '/controllers/BookingController.php';
require_once __DIR__ . '/controllers/AirportController.php';
require_once __DIR__ . '/controllers/AdminController.php';
require_once __DIR__ . '/controllers/UploadController.php';

// Parse incoming request
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Normalize URI: strip base directory path if running in subfolder like /php-backend
$scriptDir = dirname($_SERVER['SCRIPT_NAME']);
if ($scriptDir !== '/' && strpos($uri, $scriptDir) === 0) {
    $uri = substr($uri, strlen($scriptDir));
}
$uri = '/' . ltrim($uri, '/');

// Parse JSON body if present
$body = [];
$rawInput = file_get_contents('php://input');
if (!empty($rawInput)) {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $body = $decoded;
    }
}
// Merge $_POST if sent as form-data
$input = array_merge($_POST, $body);

try {
    // 1. Health check & Root
    if ($uri === '/' || $uri === '/api' || $uri === '/api/health') {
        require_once __DIR__ . '/config/database.php';
        $driver = Database::getInstance()->getDriver();
        Response::json([
            'status' => 'online',
            'service' => 'SkyHigh Air PHP API',
            'version' => '1.0.0',
            'database' => strtoupper($driver),
            'timestamp' => date('c')
        ]);
    }

    // 2. Automated DB Setup / Seed Endpoint
    if ($uri === '/api/setup' || $uri === '/setup') {
        require __DIR__ . '/setup.php';
        exit;
    }

    // 3. Auth Routes
    $authController = new AuthController();
    if ($method === 'POST' && $uri === '/api/auth/register') {
        $authController->register($input);
    }
    if ($method === 'POST' && $uri === '/api/auth/login') {
        $authController->login($input);
    }
    if ($method === 'POST' && $uri === '/api/auth/logout') {
        $authController->logout();
    }
    if ($method === 'GET' && $uri === '/api/auth/me') {
        $authController->getMe();
    }
    if (($method === 'PUT' || $method === 'POST') && $uri === '/api/auth/profile') {
        $authController->updateProfile($input);
    }

    // 4. File Upload & Static Serve Routes
    $uploadController = new UploadController();
    if ($method === 'POST' && $uri === '/api/upload') {
        $uploadController->uploadAvatar($input);
    }
    if ($method === 'GET' && preg_match('#^/(?:api/)?uploads/([0-9a-zA-Z_.-]+)$#', $uri, $matches)) {
        $uploadController->serveFile($matches[1]);
    }

    // 4. Flight Routes
    $flightController = new FlightController();
    if ($method === 'GET' && $uri === '/api/flights') {
        $flightController->index($_GET);
    }
    if ($method === 'POST' && $uri === '/api/flights') {
        $flightController->store($input);
    }
    if (preg_match('#^/api/flights/([0-9a-zA-Z_-]+)$#', $uri, $matches)) {
        $flightId = $matches[1];
        if ($method === 'GET') {
            $flightController->show($flightId);
        } elseif ($method === 'PUT') {
            $flightController->update($flightId, $input);
        } elseif ($method === 'DELETE') {
            $flightController->destroy($flightId);
        }
    }

    // 5. Booking Routes
    $bookingController = new BookingController();
    if ($method === 'POST' && $uri === '/api/bookings') {
        $bookingController->store($input);
    }
    if ($method === 'GET' && $uri === '/api/bookings/my-bookings') {
        $bookingController->myBookings();
    }
    if ($method === 'POST' && $uri === '/api/bookings/checkin-pnr') {
        $bookingController->completeCheckInByPnr($input);
    }
    if ($method === 'GET' && $uri === '/api/bookings') {
        $bookingController->index();
    }
    if (preg_match('#^/api/bookings/([0-9a-zA-Z_-]+)/checkin$#', $uri, $matches)) {
        $bookingController->completeCheckIn($matches[1]);
    }
    if (preg_match('#^/api/bookings/([0-9a-zA-Z_-]+)/cancel$#', $uri, $matches)) {
        $bookingController->cancel($matches[1]);
    }
    if (preg_match('#^/api/bookings/([0-9a-zA-Z_-]+)$#', $uri, $matches)) {
        $bookingId = $matches[1];
        if ($method === 'GET') {
            $bookingController->show($bookingId);
        } elseif ($method === 'DELETE') {
            $bookingController->cancel($bookingId);
        }
    }

    // 6. Airport Counter Routes
    $airportController = new AirportController();
    if ($method === 'POST' && $uri === '/api/airport/book-counter-ticket') {
        $airportController->bookCounterTicket($input);
    }
    if ($method === 'GET' && $uri === '/api/airport/counter-bookings') {
        $airportController->getCounterBookings();
    }

    // 7. Admin Routes
    $adminController = new AdminController();
    if ($method === 'GET' && ($uri === '/api/admin/stats' || $uri === '/api/admin')) {
        $adminController->stats();
    }

    // 404 Fallback
    Response::error("Endpoint not found: [{$method}] {$uri}", 404);

} catch (Exception $e) {
    Response::error('Server Error: ' . $e->getMessage(), 500);
}
