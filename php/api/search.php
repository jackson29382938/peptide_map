<?php
// API Endpoint: Log Search Query
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
    if (!isset($data['query']) || !isset($data['sessionId'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit();
    }
    
    // Sanitize inputs
    $query = sanitize($data['query']);
    $resultsCount = isset($data['resultsCount']) ? (int)$data['resultsCount'] : 0;
    $sessionId = sanitize($data['sessionId']);
    
    // Insert into database
    $conn = getDBConnection();
    $sql = "INSERT INTO search_queries (query, results_count, session_id)
            VALUES (?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([$query, $resultsCount, $sessionId]);
    
    echo json_encode([
        'success' => true,
        'id' => $conn->lastInsertId()
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to log search']);
}
?>
