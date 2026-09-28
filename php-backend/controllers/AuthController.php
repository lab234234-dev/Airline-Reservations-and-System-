<?php
require_once dirname(__DIR__) . '/models/User.php';
require_once dirname(__DIR__) . '/config/jwt.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';
require_once dirname(__DIR__) . '/utils/Response.php';

class AuthController {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    public function register($input) {
        $name = trim($input['name'] ?? '');
        $email = trim(strtolower($input['email'] ?? ''));
        $password = $input['password'] ?? '';
        $role = $input['role'] ?? 'user';
        $profilePic = $input['profilePic'] ?? $input['profile_pic'] ?? '';

        if (empty($name) || empty($email) || empty($password)) {
            Response::error('Please provide name, email, and password');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Invalid email address format');
        }

        if (strlen($password) < 6) {
            Response::error('Password must be at least 6 characters long');
        }

        $existing = $this->userModel->findByEmail($email);
        if ($existing) {
            Response::error('User with this email already exists', 400);
        }

        $hashed = password_hash($password, PASSWORD_BCRYPT);
        $user = $this->userModel->create([
            'name' => $name,
            'email' => $email,
            'password' => $hashed,
            'role' => $role,
            'profilePic' => $profilePic,
            'rewardPoints' => 250 // Welcome bonus!
        ]);

        $token = JWT::encode(['id' => $user['id'], 'role' => $user['role'], 'email' => $user['email']]);
        
        // Set secure cookie
        setcookie('token', $token, [
            'expires' => time() + (30 * 86400),
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);

        $user['_id'] = (string) $user['id'];
        $user['token'] = $token;
        Response::json($user, 201);
    }

    public function login($input) {
        $email = trim(strtolower($input['email'] ?? ''));
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            Response::error('Please provide both email and password');
        }

        $user = $this->userModel->findByEmail($email);
        if (!$user || !password_verify($password, $user['password'])) {
            Response::error('Invalid email or password', 401);
        }

        $token = JWT::encode(['id' => $user['id'], 'role' => $user['role'], 'email' => $user['email']]);

        setcookie('token', $token, [
            'expires' => time() + (30 * 86400),
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);

        unset($user['password']);
        $user['_id'] = (string) $user['id'];
        $user['token'] = $token;
        Response::json($user);
    }

    public function logout() {
        setcookie('token', '', [
            'expires' => time() - 3600,
            'path' => '/',
            'httponly' => true
        ]);
        Response::success('Logged out successfully');
    }

    public function getMe() {
        $user = AuthMiddleware::authenticate();
        $user['_id'] = (string) $user['id'];
        Response::json($user);
    }

    public function updateProfile($input) {
        $currentUser = AuthMiddleware::authenticate();
        $updated = $this->userModel->updateProfile($currentUser['id'], $input);
        $updated['_id'] = (string) $updated['id'];
        Response::json($updated);
    }
}
