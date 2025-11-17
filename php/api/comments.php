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
    
    // GET comments for a vendor
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['vendor_id'])) {
        $vendorId = (int)$_GET['vendor_id'];
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        
        $stmt = $db->prepare("SELECT id, comment, created_at 
                              FROM vendor_comments 
                              WHERE vendor_id = :vendor_id 
                              ORDER BY created_at DESC 
                              LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':vendor_id', $vendorId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();
        echo json_encode($rows);
        exit();
    }
    
    // POST new comment
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = getJSONInput();
        $vendorId = (int)($data['vendor_id'] ?? 0);
        $comment = trim($data['comment'] ?? '');
        
        if ($vendorId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'vendor_id required']);
            exit();
        }
        
        if (empty($comment)) {
            http_response_code(400);
            echo json_encode(['error' => 'comment required']);
            exit();
        }
        
        if (strlen($comment) > 2000) {
            http_response_code(400);
            echo json_encode(['error' => 'comment too long (max 2000 chars)']);
            exit();
        }
        
        $session = getUserSession();
        $ip = getUserIP();
        
        // Rate limiting: max 5 comments per session per day
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM vendor_comments 
                             WHERE user_session = :session 
                             AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)");
        $stmt->execute([':session' => $session]);
        $row = $stmt->fetch();
        
        if ($row['count'] >= 5) {
            http_response_code(429);
            echo json_encode(['error' => 'Comment limit reached (max 5 per day)']);
            exit();
        }
        
        // Sanitize and insert comment
        $comment = sanitize($comment);
        $stmt = $db->prepare("INSERT INTO vendor_comments (vendor_id, comment, user_session, user_ip) 
                             VALUES (:vendor_id, :comment, :session, :ip)");
        $stmt->execute([
            ':vendor_id' => $vendorId,
            ':comment' => $comment,
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
