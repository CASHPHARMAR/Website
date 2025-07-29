<?php
require_once 'config.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Get parameters
    $category = isset($_GET['category']) ? (int)$_GET['category'] : null;
    $featured = isset($_GET['featured']) ? (bool)$_GET['featured'] : false;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $search = isset($_GET['search']) ? sanitize($_GET['search']) : '';
    $minPrice = isset($_GET['min_price']) ? (float)$_GET['min_price'] : null;
    $maxPrice = isset($_GET['max_price']) ? (float)$_GET['max_price'] : null;
    
    // Build query
    $where = ['p.is_active = 1'];
    $params = [];
    
    if ($category) {
        $where[] = 'p.category_id = ?';
        $params[] = $category;
    }
    
    if ($search) {
        $where[] = '(p.name LIKE ? OR p.description LIKE ?)';
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    if ($minPrice !== null) {
        $where[] = 'COALESCE(p.sale_price, p.price) >= ?';
        $params[] = $minPrice;
    }
    
    if ($maxPrice !== null) {
        $where[] = 'COALESCE(p.sale_price, p.price) <= ?';
        $params[] = $maxPrice;
    }
    
    $whereClause = implode(' AND ', $where);
    
    // Get products with category information
    $sql = "
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE $whereClause 
        ORDER BY p.created_at DESC 
        LIMIT ? OFFSET ?
    ";
    
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();
    
    // Get total count for pagination
    $countSql = "SELECT COUNT(*) FROM products p WHERE $whereClause";
    $countParams = array_slice($params, 0, -2); // Remove limit and offset
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($countParams);
    $totalCount = $countStmt->fetchColumn();
    
    $response = [
        'products' => $products,
        'total' => $totalCount,
        'limit' => $limit,
        'offset' => $offset,
        'has_more' => ($offset + $limit) < $totalCount
    ];
    
    // If it's a simple request (for featured products), just return the products array
    if ($featured || isset($_GET['simple'])) {
        header('Content-Type: application/json');
        echo json_encode($products);
    } else {
        header('Content-Type: application/json');
        echo json_encode($response);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch products']);
}
?>