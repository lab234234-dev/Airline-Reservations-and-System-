<?php
// SkyHigh Air - Instant Database Setup & Migration Script
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/Response.php';

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    $driver = $db->getDriver();

    if ($driver === 'sqlite') {
        // SQLite Schema Creation
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                profile_pic TEXT DEFAULT '',
                phone TEXT DEFAULT '',
                dob TEXT DEFAULT '',
                gender TEXT DEFAULT '',
                id_type TEXT DEFAULT '',
                id_number TEXT DEFAULT '',
                seat_preference TEXT DEFAULT 'Window',
                meal_preference TEXT DEFAULT 'Vegetarian',
                reward_points INTEGER DEFAULT 250,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS flights (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                flight_number TEXT NOT NULL UNIQUE,
                airline TEXT NOT NULL,
                origin TEXT NOT NULL,
                destination TEXT NOT NULL,
                departure_time DATETIME NOT NULL,
                arrival_time DATETIME NOT NULL,
                price REAL NOT NULL,
                seats_available INTEGER NOT NULL,
                total_seats INTEGER NOT NULL,
                booked_seats TEXT DEFAULT '[]',
                status TEXT DEFAULT 'scheduled',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                flight_id INTEGER NOT NULL,
                origin TEXT,
                destination TEXT,
                airline TEXT,
                flight_number TEXT,
                pnr TEXT NOT NULL UNIQUE,
                seat_number TEXT,
                passengers TEXT NOT NULL,
                total_amount REAL NOT NULL,
                payment_status TEXT DEFAULT 'paid',
                payment_method TEXT DEFAULT 'Credit/Debit Card',
                booking_status TEXT DEFAULT 'confirmed',
                check_in_status TEXT DEFAULT 'pending',
                flight_flying_status TEXT DEFAULT 'Check-In Required',
                boarding_pass_issued INTEGER DEFAULT 0,
                gate TEXT DEFAULT 'B4',
                terminal TEXT DEFAULT 'T2',
                boarding_time TEXT DEFAULT '45m Before Departure',
                transaction_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS airport_bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pnr TEXT NOT NULL UNIQUE,
                agent_id INTEGER NOT NULL,
                agent_name TEXT DEFAULT 'Airport Desk Agent',
                booking_channel TEXT DEFAULT 'AIRPORT_COUNTER',
                flight_id INTEGER NOT NULL,
                travel_class TEXT DEFAULT 'Economy',
                passengers TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                base_fare REAL NOT NULL,
                add_on_charges REAL DEFAULT 0,
                total_paid REAL NOT NULL,
                payment_status TEXT DEFAULT 'COMPLETED',
                payment_method TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                booking_id INTEGER,
                amount REAL NOT NULL,
                payment_method TEXT NOT NULL,
                transaction_id TEXT NOT NULL,
                status TEXT DEFAULT 'success',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ");
    } else {
        // MySQL Schema Creation
        $sql = file_get_contents(__DIR__ . '/database/schema.sql');
        // Execute statements
        $pdo->exec($sql);
    }

    // Insert Default Seed Users if not present
    $passHash = password_hash('password123', PASSWORD_BCRYPT);
    $adminHash = password_hash('admin123', PASSWORD_BCRYPT);

    $userCheck = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    if ($userCheck == 0) {
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, reward_points) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute(['System Administrator', 'admin@skyhigh.com', $adminHash, 'admin', 5000]);
        $stmt->execute(['Counter Desk Agent', 'agent@skyhigh.com', $passHash, 'agent', 1000]);
        $stmt->execute(['Demo Traveler', 'passenger@test.com', $passHash, 'user', 850]);
    }

    // Insert Default Flights if not present
    $flightCheck = $pdo->query("SELECT COUNT(*) FROM flights")->fetchColumn();
    if ($flightCheck == 0) {
        $flights = [
            ['SH-102', 'SkyHigh Air', 'Surat', 'Mumbai', date('Y-m-d H:i:s', time() + 7200), date('Y-m-d H:i:s', time() + 11700), 3600, 110, 150, json_encode(['12A', '14C'])],
            ['AI-208', 'Air India', 'Ahmedabad', 'Delhi', date('Y-m-d H:i:s', time() + 14400), date('Y-m-d H:i:s', time() + 19800), 4200, 95, 160, json_encode(['3F', '4A'])],
            ['SH-101', 'SkyHigh Air', 'Mumbai', 'Delhi', date('Y-m-d H:i:s', time() + 86400), date('Y-m-d H:i:s', time() + 93600), 4500, 85, 150, json_encode(['7B'])],
            ['IN-505', 'IndiGo', 'Bangalore', 'Goa', date('Y-m-d H:i:s', time() + 129600), date('Y-m-d H:i:s', time() + 134100), 3400, 130, 180, '[]'],
            ['SG-404', 'SpiceJet', 'Jaipur', 'Kolkata', date('Y-m-d H:i:s', time() + 172800), date('Y-m-d H:i:s', time() + 180900), 4900, 78, 160, '[]'],
            ['AI-303', 'Air India', 'Chennai', 'Bangalore', date('Y-m-d H:i:s', time() + 216000), date('Y-m-d H:i:s', time() + 221400), 2800, 140, 180, '[]'],
            ['AI-601', 'Air India', 'Delhi', 'Srinagar', date('Y-m-d H:i:s', time() + 259200), date('Y-m-d H:i:s', time() + 264600), 5800, 60, 150, '[]'],
            ['6E-712', 'IndiGo', 'Kochi', 'Chennai', date('Y-m-d H:i:s', time() + 302400), date('Y-m-d H:i:s', time() + 306600), 3100, 115, 180, '[]'],
            ['6E-889', 'IndiGo', 'Surat', 'Bangalore', date('Y-m-d H:i:s', time() + 345600), date('Y-m-d H:i:s', time() + 353100), 4900, 105, 180, '[]'],
            ['HY-707', 'Air India Express', 'Hyderabad', 'Pune', date('Y-m-d H:i:s', time() + 388800), date('Y-m-d H:i:s', time() + 393300), 3200, 90, 160, '[]'],
            ['EK-501', 'Emirates', 'Mumbai', 'Dubai', date('Y-m-d H:i:s', time() + 86400), date('Y-m-d H:i:s', time() + 99000), 16500, 180, 300, '[]'],
            ['BA-138', 'British Airways', 'Delhi', 'London', date('Y-m-d H:i:s', time() + 172800), date('Y-m-d H:i:s', time() + 205200), 48000, 210, 320, '[]'],
            ['SQ-402', 'Singapore Airlines', 'Bangalore', 'Singapore', date('Y-m-d H:i:s', time() + 216000), date('Y-m-d H:i:s', time() + 232200), 19800, 155, 260, '[]'],
            ['AI-101', 'Air India', 'Delhi', 'New York', date('Y-m-d H:i:s', time() + 259200), date('Y-m-d H:i:s', time() + 315000), 72000, 190, 340, '[]'],
            ['TG-318', 'Thai Airways', 'Ahmedabad', 'Bangkok', date('Y-m-d H:i:s', time() + 302400), date('Y-m-d H:i:s', time() + 317700), 17200, 140, 240, '[]'],
            ['AF-218', 'Air France', 'Mumbai', 'Paris', date('Y-m-d H:i:s', time() + 345600), date('Y-m-d H:i:s', time() + 379800), 52000, 165, 280, '[]'],
        ];

        $stmt = $pdo->prepare("INSERT INTO flights (flight_number, airline, origin, destination, departure_time, arrival_time, price, seats_available, total_seats, booked_seats, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')");
        foreach ($flights as $f) {
            $stmt->execute($f);
        }
    }

    // Insert a sample booking if none exist
    $bookingCheck = $pdo->query("SELECT COUNT(*) FROM bookings")->fetchColumn();
    if ($bookingCheck == 0) {
        $firstFlight = $pdo->query("SELECT * FROM flights LIMIT 1")->fetch();
        $userObj = $pdo->query("SELECT * FROM users WHERE email='passenger@test.com'")->fetch();
        if ($firstFlight && $userObj) {
            $pnr = 'SH-DEMO1';
            $txn = 'TXN-DEMO889';
            $passengers = json_encode([
                [
                    'name' => 'Demo Traveler',
                    'age' => 28,
                    'gender' => 'Male',
                    'seatNumber' => '12A',
                    'mealPreference' => 'Vegetarian'
                ]
            ]);

            $stmt = $pdo->prepare("INSERT INTO bookings (user_id, flight_id, origin, destination, airline, flight_number, pnr, seat_number, passengers, total_amount, payment_status, payment_method, booking_status, check_in_status, flight_flying_status, boarding_pass_issued, gate, terminal, boarding_time, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', 'Credit Card', 'confirmed', 'completed', 'In Flight ✈️ (Flying)', 1, 'B4', 'T2', '45m Before Departure', ?)");
            $stmt->execute([
                $userObj['id'],
                $firstFlight['id'],
                $firstFlight['origin'],
                $firstFlight['destination'],
                $firstFlight['airline'],
                $firstFlight['flight_number'],
                $pnr,
                '12A',
                $passengers,
                $firstFlight['price'],
                $txn
            ]);

            // Add payment
            $bookingId = $pdo->lastInsertId();
            $pdo->prepare("INSERT INTO payments (user_id, booking_id, amount, payment_method, transaction_id, status) VALUES (?, ?, ?, 'Credit Card', ?, 'success')")
                ->execute([$userObj['id'], $bookingId, $firstFlight['price'], $txn]);
        }
    }

    $msg = "Database setup completed successfully! Active driver: " . strtoupper($driver);
    if (php_sapi_name() === 'cli') {
        echo $msg . "\n";
    } else {
        Response::success($msg, [
            'driver' => $driver,
            'tables' => ['users', 'flights', 'bookings', 'airport_bookings', 'payments'],
            'demo_accounts' => [
                ['role' => 'admin', 'email' => 'admin@skyhigh.com', 'password' => 'admin123'],
                ['role' => 'user', 'email' => 'passenger@test.com', 'password' => 'password123'],
                ['role' => 'agent', 'email' => 'agent@skyhigh.com', 'password' => 'password123']
            ]
        ]);
    }
} catch (Exception $e) {
    if (php_sapi_name() === 'cli') {
        echo "Setup error: " . $e->getMessage() . "\n";
    } else {
        Response::error("Setup failed: " . $e->getMessage(), 500);
    }
}
