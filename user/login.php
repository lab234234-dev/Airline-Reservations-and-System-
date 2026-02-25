<?php
session_start();
require_once '../config/database.php';

if (isset($_SESSION['user_id'])) {
    header("Location: dashboard.php");
    exit();
}

$error = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    if(empty($email) || empty($password)){
        $error = "Please enter both email and password.";
    } else {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            header("Location: dashboard.php");
            exit();
        } else {
            $error = "Invalid email or password.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Login - SkyFly Airlines</title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
    <nav class="navbar">
        <a href="../index.php" class="logo">✈️ SkyFly Airlines</a>
        <div class="nav-links">
            <a href="../index.php">Home</a>
            <a href="register.php">Register</a>
        </div>
    </nav>
    <div class="container d-flex" style="justify-content: center; align-items: center;">
        <div class="card" style="width: 100%;">
            <h2 class="text-center mb-3">User Login</h2>
            <?php if ($error) echo "<div class='alert alert-error'>$error</div>"; ?>
            <form method="POST">
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" class="form-control" placeholder="john@example.com" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" class="form-control" placeholder="••••••••" required>
                </div>
                <button type="submit" class="btn" style="width:100%;">Login</button>
            </form>
            <p class="text-center mt-3">Don't have an account? <a href="register.php" style="color:#023047;">Sign up here</a></p>
        </div>
    </div>
</body>
</html>
