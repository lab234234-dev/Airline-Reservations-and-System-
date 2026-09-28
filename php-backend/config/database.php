<?php
// Database Connection Manager (MySQL with Seamless SQLite Fallback)

class Database {
    private static $instance = null;
    private $pdo;
    private $driver = 'mysql';

    private function __construct() {
        $host = getenv('DB_HOST') ?: '127.0.0.1';
        $port = getenv('DB_PORT') ?: '3306';
        $dbName = getenv('DB_NAME') ?: 'airline_reservation';
        $user = getenv('DB_USER') ?: 'root';
        $pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';

        // Attempt MySQL connection first
        try {
            // First connect without DB to check / create if needed
            $dsnWithoutDb = "mysql:host={$host};port={$port};charset=utf8mb4";
            $tempPdo = new PDO($dsnWithoutDb, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_TIMEOUT => 2
            ]);

            // Ensure database exists
            $tempPdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

            $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";
            $this->pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            $this->driver = 'mysql';
        } catch (Exception $e) {
            // If MySQL is not running, fallback to SQLite
            $sqliteDir = dirname(__DIR__) . '/database';
            if (!is_dir($sqliteDir)) {
                mkdir($sqliteDir, 0777, true);
            }
            $sqlitePath = $sqliteDir . '/airline_reservation.sqlite';
            $this->pdo = new PDO("sqlite:" . $sqlitePath, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            $this->pdo->exec("PRAGMA foreign_keys = ON;");
            $this->driver = 'sqlite';
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->pdo;
    }

    public function getDriver() {
        return $this->driver;
    }
}
