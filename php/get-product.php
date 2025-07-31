<?php
require_once 'config.php';

try {
    $productId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if (!$productId) {
        http_response_code(400);
        echo json_encode(['error' => 'Product ID is required']);
        exit;
    }
    
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.id = ? AND p.is_active = 1
    ");
    $stmt->execute([$productId]);
    $product = $stmt->fetch();
    
    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        exit;
    }
    
    // Get product reviews
    $reviewStmt = $db->prepare("
        SELECT r.*, u.username, u.first_name, u.last_name 
        FROM reviews r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.product_id = ? 
        ORDER BY r.created_at DESC 
        LIMIT 10
    ");
    $reviewStmt->execute([$productId]);
    $reviews = $reviewStmt->fetchAll();
    
    // Calculate average rating
    $ratingStmt = $db->prepare("
        SELECT AVG(rating) as avg_rating, COUNT(*) as review_count 
        FROM reviews 
        WHERE product_id = ?
    ");
    $ratingStmt->execute([$productId]);
    $ratingData = $ratingStmt->fetch();
    
    $product['reviews'] = $reviews;
    $product['avg_rating'] = round($ratingData['avg_rating'] ?? 0, 1);
    $product['review_count'] = $ratingData['review_count'] ?? 0;
    
    header('Content-Type: application/json');
    echo json_encode($product);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch product']);
}
?>