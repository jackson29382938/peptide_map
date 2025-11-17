<?php
require_once __DIR__ . '/../config.php';
setJSONHeaders();

// Helper to get user session
function getUserSession() {
    if (!isset($_COOKIE['vendor_session'])) {
        $session = bin2hex(random_bytes(16));
        setcookie('vendor_session', $session, time() + (365 * 24 * 60 * 60), '/');
        return $session;
    }
    return $_COOKIE['vendor_session'];
}

// Helper to get user IP
function getUserIP() {
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return $_SERVER['HTTP_X_FORWARDED_FOR'];
    }
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

try {
    $db = getDBConnection();
    
    // GET ratings for a vendor
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['vendor_id'])) {
        $vendorId = (int)$_GET['vendor_id'];
        $stmt = $db->prepare("SELECT rating, COUNT(*) as count 
                              FROM vendor_ratings 
                              WHERE vendor_id = :vendor_id 
                              GROUP BY rating 
                              ORDER BY rating DESC");
        $stmt->execute([':vendor_id' => $vendorId]);
        $rows = $stmt->fetchAll();
        echo json_encode($rows);
        exit();
    }
    
    // POST new rating
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = getJSONInput();
        $vendorId = (int)($data['vendor_id'] ?? 0);
        $rating = (int)($data['rating'] ?? 0);
        
        if ($vendorId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'vendor_id required']);
            exit();
        }
        
        if ($rating < 1 || $rating > 5) {
            http_response_code(400);
            echo json_encode(['error' => 'rating must be 1-5']);
            exit();
        }
        
        $session = getUserSession();
        $ip = getUserIP();
        
        // Check if user already rated (within last 24 hours from same session)
        $stmt = $db->prepare("SELECT id FROM vendor_ratings 
                             WHERE vendor_id = :vendor_id 
                             AND user_session = :session 
                             AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)");
        $stmt->execute([':vendor_id' => $vendorId, ':session' => $session]);
        
        if ($stmt->fetch()) {
            http_response_code(429);
            echo json_encode(['error' => 'You can only rate once per 24 hours']);
            exit();
        }
        
        // Insert rating
        $stmt = $db->prepare("INSERT INTO vendor_ratings (vendor_id, rating, user_session, user_ip) 
                             VALUES (:vendor_id, :rating, :session, :ip)");
        $stmt->execute([
            ':vendor_id' => $vendorId,
            ':rating' => $rating,
            ':session' => $session,
            ':ip' => $ip
        ]);
        
        echo json_encode(['status' => 'ok', 'id' => $db->lastInsertId()]);
        exit();
    }
    
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
?>
