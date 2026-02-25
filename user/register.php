<?php
session_start();
require_once '../config/database.php';

$error = '';
$success = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $phone = trim($_POST['phone']);

    if (empty($name) || empty($email) || empty($password)) {
        $error = "Please fill all required fields.";
    } else {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->rowCount() > 0) {
            $error = "Email is already registered.";
        } else {
            $hashed = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)");
            if ($stmt->execute([$name, $email, $hashed, $phone])) {
                $success = "Registration successful! You can now login.";
            } else {
                $error = "Something went wrong. Please try again.";
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - SkyFly Airlines</title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
    <nav class="navbar">
        <a href="../index.php" class="logo">✈️ SkyFly Airlines</a>
        <div class="nav-links">
            <a href="../index.php">Home</a>
            <a href="login.php">Login</a>
        </div>
    </nav>
    <div class="container d-flex" style="justify-content: center; align-items: center;">
        <div class="card" style="width: 100%;">
            <h2 class="text-center mb-3">Create User Account</h2>
            <?php if ($error) echo "<div class='alert alert-error'>$error</div>"; ?>
            <?php if ($success) echo "<div class='alert alert-success'>$success</div>"; ?>
            <form method="POST">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" name="name" class="form-control" placeholder="John Doe" required>
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" class="form-control" placeholder="john@example.com" required>
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" name="phone" class="form-control" placeholder="+123456789">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" class="form-control" placeholder="••••••••" required>
                </div>
                <button type="submit" class="btn" style="width:100%;">Register</button>
            </form>
            <p class="text-center mt-3">Already have an account? <a href="login.php" style="color:#023047;">Login here</a></p>
        </div>
    </div>
</body>
</html>
