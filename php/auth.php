<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'login':
        handleLogin();
        break;
    case 'register':
        handleRegister();
        break;
    case 'logout':
        handleLogout();
        break;
    default:
        sendJsonResponse(['error' => 'Invalid action'], 400);
}

function handleLogin() {
    $email = sanitize($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $remember = isset($_POST['remember']);
    
    $errors = [];
    
    if (!$email) {
        $errors['email'] = 'Email is required';
    } elseif (!validateEmail($email)) {
        $errors['email'] = 'Invalid email format';
    }
    
    if (!$password) {
        $errors['password'] = 'Password is required';
    }
    
    if (!empty($errors)) {
        sendJsonResponse(['success' => false, 'message' => 'Please fix the errors', 'errors' => $errors], 400);
    }
    
    try {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user || !verifyPassword($password, $user['password'])) {
            sendJsonResponse(['success' => false, 'message' => 'Invalid email or password'], 401);
        }
        
        // Create session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $user['role'];
        
        // Set remember me cookie if requested
        if ($remember) {
            $token = bin2hex(random_bytes(32));
            $expiry = time() + (30 * 24 * 60 * 60); // 30 days
            
            setcookie('remember_token', $token, $expiry, '/', '', false, true);
            
            // Store token in database (you might want to create a remember_tokens table)
        }
        
        sendJsonResponse([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role']
            ],
            'redirect' => $user['role'] === 'admin' ? 'admin/dashboard.html' : 'index.html'
        ]);
        
    } catch (Exception $e) {
        sendJsonResponse(['success' => false, 'message' => 'Login failed. Please try again.'], 500);
    }
}

function handleRegister() {
    $username = sanitize($_POST['username'] ?? '');
    $email = sanitize($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    $firstName = sanitize($_POST['first_name'] ?? '');
    $lastName = sanitize($_POST['last_name'] ?? '');
    $phone = sanitize($_POST['phone'] ?? '');
    $address = sanitize($_POST['address'] ?? '');
    $city = sanitize($_POST['city'] ?? '');
    $state = sanitize($_POST['state'] ?? '');
    $zipCode = sanitize($_POST['zip_code'] ?? '');
    $country = sanitize($_POST['country'] ?? '');
    
    $errors = [];
    
    // Validation
    if (!$username) {
        $errors['username'] = 'Username is required';
    } elseif (strlen($username) < 3) {
        $errors['username'] = 'Username must be at least 3 characters';
    }
    
    if (!$email) {
        $errors['email'] = 'Email is required';
    } elseif (!validateEmail($email)) {
        $errors['email'] = 'Invalid email format';
    }
    
    if (!$password) {
        $errors['password'] = 'Password is required';
    } elseif (strlen($password) < 6) {
        $errors['password'] = 'Password must be at least 6 characters';
    }
    
    if ($password !== $confirmPassword) {
        $errors['confirm_password'] = 'Passwords do not match';
    }
    
    if (!$firstName) {
        $errors['first_name'] = 'First name is required';
    }
    
    if (!$lastName) {
        $errors['last_name'] = 'Last name is required';
    }
    
    if (!empty($errors)) {
        sendJsonResponse(['success' => false, 'message' => 'Please fix the errors', 'errors' => $errors], 400);
    }
    
    try {
        $db = Database::getInstance()->getConnection();
        
        // Check if username or email already exists
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        
        if ($stmt->fetch()) {
            sendJsonResponse(['success' => false, 'message' => 'Username or email already exists'], 409);
        }
        
        // Create user
        $hashedPassword = hashPassword($password);
        
        $stmt = $db->prepare("
            INSERT INTO users (username, email, password, first_name, last_name, phone, address, city, state, zip_code, country) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $username, $email, $hashedPassword, $firstName, $lastName,
            $phone, $address, $city, $state, $zipCode, $country
        ]);
        
        $userId = $db->lastInsertId();
        
        // Create session
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['email'] = $email;
        $_SESSION['role'] = 'customer';
        
        sendJsonResponse([
            'success' => true,
            'message' => 'Registration successful! Welcome to ModernStore.',
            'user' => [
                'id' => $userId,
                'username' => $username,
                'email' => $email,
                'role' => 'customer'
            ],
            'redirect' => 'index.html'
        ]);
        
    } catch (Exception $e) {
        sendJsonResponse(['success' => false, 'message' => 'Registration failed. Please try again.'], 500);
    }
}

function handleLogout() {
    session_destroy();
    
    // Clear remember me cookie
    if (isset($_COOKIE['remember_token'])) {
        setcookie('remember_token', '', time() - 3600, '/', '', false, true);
    }
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Logout successful',
        'redirect' => 'index.html'
    ]);
}
?>