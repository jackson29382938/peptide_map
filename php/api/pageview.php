<?php
// API Endpoint: Log Page View
require_once '../config.php';

setJSONHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $data = getJSONInput();
    
    // Validate required fields
    if (!isset($data['sessionId'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit();
    }
    
    // Sanitize inputs
    $pageUrl = sanitize($data['pageUrl'] ?? '');
    $sessionId = sanitize($data['sessionId']);
    $userAgent = sanitize($data['userAgent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? '');
    $referrer = sanitize($data['referrer'] ?? $_SERVER['HTTP_REFERER'] ?? '');
    
    // Insert into database
    $conn = getDBConnection();
    $sql = "INSERT INTO page_views (page_url, session_id, user_agent, referrer)
            VALUES (?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([$pageUrl, $sessionId, $userAgent, $referrer]);
    
    echo json_encode([
        'success' => true,
        'id' => $conn->lastInsertId()
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to log page view']);
}
?>
