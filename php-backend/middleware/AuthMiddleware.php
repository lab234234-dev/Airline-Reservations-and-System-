<?php
require_once dirname(__DIR__) . '/config/jwt.php';
require_once dirname(__DIR__) . '/models/User.php';
require_once dirname(__DIR__) . '/utils/Response.php';

class AuthMiddleware {
    private static $currentUser = null;

    public static function getUser() {
        if (self::$currentUser !== null) {
            return self::$currentUser;
        }

        $token = null;

        // 1. Check Authorization Header
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (!empty($authHeader) && preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
            $token = $matches[1];
        }

        // 2. Check Cookie
        if (!$token && !empty($_COOKIE['token'])) {
            $token = $_COOKIE['token'];
        }

        if (!$token) {
            return null;
        }

        $payload = JWT::decode($token);
        if (!$payload || empty($payload['id'])) {
            return null;
        }

        $userModel = new User();
        $user = $userModel->findById($payload['id']);
        if ($user) {
            self::$currentUser = $user;
            return $user;
        }

        return null;
    }

    public static function authenticate() {
        $user = self::getUser();
        if (!$user) {
            Response::error('Not authorized, token failed or missing', 401);
        }
        return $user;
    }

    public static function requireAdmin() {
        $user = self::authenticate();
        if ($user['role'] !== 'admin' && $user['role'] !== 'agent') {
            Response::error('Not authorized as an admin or agent', 403);
        }
        return $user;
    }
}
