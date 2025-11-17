<?php
// API Endpoint: Log Click Event
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
    if (!isset($data['elementType']) || !isset($data['sessionId'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit();
    }
    
    // Sanitize inputs
    $elementId = sanitize($data['elementId'] ?? null);
    $elementType = sanitize($data['elementType']);
    $elementText = sanitize($data['elementText'] ?? null);
    $pageUrl = sanitize($data['pageUrl'] ?? '');
    $sessionId = sanitize($data['sessionId']);
    $userAgent = sanitize($data['userAgent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? '');
    $screenWidth = isset($data['screenWidth']) ? (int)$data['screenWidth'] : null;
    $screenHeight = isset($data['screenHeight']) ? (int)$data['screenHeight'] : null;
    $clickX = isset($data['clickX']) ? (int)$data['clickX'] : null;
    $clickY = isset($data['clickY']) ? (int)$data['clickY'] : null;
    
    // Insert into database
    $conn = getDBConnection();
    $sql = "INSERT INTO click_events 
            (element_id, element_type, element_text, page_url, session_id, 
             user_agent, screen_width, screen_height, click_x, click_y)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        $elementId,
        $elementType,
        $elementText,
        $pageUrl,
        $sessionId,
        $userAgent,
        $screenWidth,
        $screenHeight,
        $clickX,
        $clickY
    ]);
    
    echo json_encode([
        'success' => true,
        'id' => $conn->lastInsertId()
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to log click']);
}
?>
