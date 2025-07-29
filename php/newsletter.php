<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

try {
    $email = sanitize($_POST['email'] ?? '');
    
    if (!$email) {
        sendJsonResponse(['success' => false, 'message' => 'Email is required'], 400);
    }
    
    if (!validateEmail($email)) {
        sendJsonResponse(['success' => false, 'message' => 'Invalid email format'], 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Create newsletter table if it doesn't exist
    $db->exec("
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE
        )
    ");
    
    // Check if email already exists
    $stmt = $db->prepare("SELECT id FROM newsletter_subscribers WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        sendJsonResponse(['success' => false, 'message' => 'Email is already subscribed to our newsletter'], 409);
    }
    
    // Insert new subscriber
    $stmt = $db->prepare("INSERT INTO newsletter_subscribers (email) VALUES (?)");
    $stmt->execute([$email]);
    
    // Here you could integrate with email service providers like:
    // - Mailchimp
    // - SendGrid
    // - AWS SES
    // - Etc.
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Thank you for subscribing! Check your email for a 10% discount code.'
    ]);
    
} catch (PDOException $e) {
    if ($e->getCode() == 23000) { // Duplicate entry
        sendJsonResponse(['success' => false, 'message' => 'Email is already subscribed'], 409);
    } else {
        sendJsonResponse(['success' => false, 'message' => 'Subscription failed. Please try again.'], 500);
    }
} catch (Exception $e) {
    sendJsonResponse(['success' => false, 'message' => 'Subscription failed. Please try again.'], 500);
}
?>