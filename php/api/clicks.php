<?php
// API Endpoint: Get Detailed Click Statistics
require_once '../config.php';

setJSONHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $days = isset($_GET['days']) ? (int)$_GET['days'] : 7;
    $days = max(1, min(365, $days));
    
    $dateLimit = date('Y-m-d H:i:s', strtotime("-$days days"));
    
    $conn = getDBConnection();
    $sql = "SELECT 
                element_id,
                element_type,
                element_text,
                COUNT(*) as click_count,
                MAX(timestamp) as last_clicked,
                AVG(click_x) as avg_x,
                AVG(click_y) as avg_y
            FROM click_events
            WHERE timestamp > ?
            GROUP BY element_id, element_type, element_text
            ORDER BY click_count DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([$dateLimit]);
    $results = $stmt->fetchAll();
    
    echo json_encode($results);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch click statistics']);
}
?>
