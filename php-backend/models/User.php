<?php
require_once dirname(__DIR__) . '/config/database.php';

class User {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function findByEmail($email) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        return $stmt->fetch();
    }

    public function findById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        if ($user) {
            unset($user['password']);
        }
        return $user;
    }

    public function create($data) {
        $stmt = $this->pdo->prepare("
            INSERT INTO users (name, email, password, role, profile_pic, reward_points)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['name'],
            $data['email'],
            $data['password'],
            $data['role'] ?? 'user',
            $data['profilePic'] ?? $data['profile_pic'] ?? '',
            $data['rewardPoints'] ?? 250
        ]);
        return $this->findById($this->pdo->lastInsertId());
    }

    public function updateProfile($id, $fields) {
        $allowed = [
            'name' => 'name',
            'profilePic' => 'profile_pic',
            'profile_pic' => 'profile_pic',
            'phone' => 'phone',
            'dob' => 'dob',
            'gender' => 'gender',
            'idType' => 'id_type',
            'id_type' => 'id_type',
            'idNumber' => 'id_number',
            'id_number' => 'id_number',
            'seatPreference' => 'seat_preference',
            'seat_preference' => 'seat_preference',
            'mealPreference' => 'meal_preference',
            'meal_preference' => 'meal_preference',
            'rewardPoints' => 'reward_points',
            'reward_points' => 'reward_points'
        ];

        $updates = [];
        $params = [];
        foreach ($fields as $key => $val) {
            if (isset($allowed[$key])) {
                $col = $allowed[$key];
                $updates[] = "`$col` = ?";
                $params[] = $val;
            }
        }

        if (empty($updates)) {
            return $this->findById($id);
        }

        $params[] = $id;
        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $this->findById($id);
    }

    public function addRewardPoints($id, $points) {
        $stmt = $this->pdo->prepare("UPDATE users SET reward_points = reward_points + ? WHERE id = ?");
        $stmt->execute([$points, $id]);
        return $this->findById($id);
    }

    public function countAll() {
        return (int) $this->pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    }
}
