<?php
require_once 'config.php';

try {
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->query("SELECT * FROM categories ORDER BY name");
    $categories = $stmt->fetchAll();
    
    header('Content-Type: application/json');
    echo json_encode($categories);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch categories']);
}
?>