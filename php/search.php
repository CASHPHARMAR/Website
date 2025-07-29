<?php
require_once 'config.php';

try {
    $query = isset($_GET['q']) ? sanitize($_GET['q']) : '';
    
    if (strlen($query) < 2) {
        http_response_code(400);
        echo json_encode(['error' => 'Search query must be at least 2 characters']);
        exit;
    }
    
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.is_active = 1 
        AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)
        ORDER BY 
            CASE 
                WHEN p.name LIKE ? THEN 1
                WHEN p.description LIKE ? THEN 2
                WHEN c.name LIKE ? THEN 3
                ELSE 4
            END,
            p.name ASC
        LIMIT 20
    ");
    
    $searchTerm = "%$query%";
    $exactSearchTerm = "%$query%";
    
    $stmt->execute([
        $searchTerm, $searchTerm, $searchTerm,
        $exactSearchTerm, $exactSearchTerm, $exactSearchTerm
    ]);
    
    $products = $stmt->fetchAll();
    
    header('Content-Type: application/json');
    echo json_encode($products);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Search failed']);
}
?>