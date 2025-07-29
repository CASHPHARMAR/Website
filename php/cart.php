<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'add':
        addToCart();
        break;
    case 'update':
        updateCart();
        break;
    case 'remove':
        removeFromCart();
        break;
    case 'clear':
        clearCart();
        break;
    default:
        sendJsonResponse(['error' => 'Invalid action'], 400);
}

function addToCart() {
    if (!isLoggedIn()) {
        sendJsonResponse(['success' => false, 'message' => 'Please login to add items to cart'], 401);
    }
    
    $productId = (int)($_POST['product_id'] ?? 0);
    $quantity = (int)($_POST['quantity'] ?? 1);
    
    if (!$productId || $quantity < 1) {
        sendJsonResponse(['success' => false, 'message' => 'Invalid product or quantity'], 400);
    }
    
    try {
        $db = Database::getInstance()->getConnection();
        
        // Check if product exists and is active
        $stmt = $db->prepare("SELECT id, name, price, sale_price, stock_quantity FROM products WHERE id = ? AND is_active = 1");
        $stmt->execute([$productId]);
        $product = $stmt->fetch();
        
        if (!$product) {
            sendJsonResponse(['success' => false, 'message' => 'Product not found'], 404);
        }
        
        // Check stock
        if ($product['stock_quantity'] < $quantity) {
            sendJsonResponse(['success' => false, 'message' => 'Insufficient stock'], 400);
        }
        
        $userId = $_SESSION['user_id'];
        
        // Check if item already in cart
        $stmt = $db->prepare("SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$userId, $productId]);
        $existingItem = $stmt->fetch();
        
        if ($existingItem) {
            $newQuantity = $existingItem['quantity'] + $quantity;
            
            // Check total stock
            if ($product['stock_quantity'] < $newQuantity) {
                sendJsonResponse(['success' => false, 'message' => 'Cannot add more items. Insufficient stock'], 400);
            }
            
            $stmt = $db->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?");
            $stmt->execute([$newQuantity, $userId, $productId]);
        } else {
            $stmt = $db->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
            $stmt->execute([$userId, $productId, $quantity]);
        }
        
        sendJsonResponse([
            'success' => true,
            'message' => 'Item added to cart successfully'
        ]);
        
    } catch (Exception $e) {
        sendJsonResponse(['success' => false, 'message' => 'Failed to add item to cart'], 500);
    }
}

function updateCart() {
    if (!isLoggedIn()) {
        sendJsonResponse(['success' => false, 'message' => 'Please login'], 401);
    }
    
    $productId = (int)($_POST['product_id'] ?? 0);
    $quantity = (int)($_POST['quantity'] ?? 0);
    
    if (!$productId) {
        sendJsonResponse(['success' => false, 'message' => 'Invalid product'], 400);
    }
    
    try {
        $db = Database::getInstance()->getConnection();
        $userId = $_SESSION['user_id'];
        
        if ($quantity <= 0) {
            // Remove item from cart
            $stmt = $db->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?");
            $stmt->execute([$userId, $productId]);
            
            sendJsonResponse([
                'success' => true,
                'message' => 'Item removed from cart'
            ]);
        } else {
            // Check stock
            $stmt = $db->prepare("SELECT stock_quantity FROM products WHERE id = ? AND is_active = 1");
            $stmt->execute([$productId]);
            $product = $stmt->fetch();
            
            if (!$product || $product['stock_quantity'] < $quantity) {
                sendJsonResponse(['success' => false, 'message' => 'Insufficient stock'], 400);
            }
            
            // Update quantity
            $stmt = $db->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?");
            $stmt->execute([$quantity, $userId, $productId]);
            
            sendJsonResponse([
                'success' => true,
                'message' => 'Cart updated successfully'
            ]);
        }
        
    } catch (Exception $e) {
        sendJsonResponse(['success' => false, 'message' => 'Failed to update cart'], 500);
    }
}

function removeFromCart() {
    if (!isLoggedIn()) {
        sendJsonResponse(['success' => false, 'message' => 'Please login'], 401);
    }
    
    $productId = (int)($_POST['product_id'] ?? 0);
    
    if (!$productId) {
        sendJsonResponse(['success' => false, 'message' => 'Invalid product'], 400);
    }
    
    try {
        $db = Database::getInstance()->getConnection();
        $userId = $_SESSION['user_id'];
        
        $stmt = $db->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$userId, $productId]);
        
        sendJsonResponse([
            'success' => true,
            'message' => 'Item removed from cart'
        ]);
        
    } catch (Exception $e) {
        sendJsonResponse(['success' => false, 'message' => 'Failed to remove item'], 500);
    }
}

function clearCart() {
    if (!isLoggedIn()) {
        sendJsonResponse(['success' => false, 'message' => 'Please login'], 401);
    }
    
    try {
        $db = Database::getInstance()->getConnection();
        $userId = $_SESSION['user_id'];
        
        $stmt = $db->prepare("DELETE FROM cart WHERE user_id = ?");
        $stmt->execute([$userId]);
        
        sendJsonResponse([
            'success' => true,
            'message' => 'Cart cleared successfully'
        ]);
        
    } catch (Exception $e) {
        sendJsonResponse(['success' => false, 'message' => 'Failed to clear cart'], 500);
    }
}
?>