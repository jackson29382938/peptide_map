<?php
// API Endpoint: Get Analytics Summary
require_once '../config.php';

setJSONHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $days = isset($_GET['days']) ? (int)$_GET['days'] : 7;
    $days = max(1, min(365, $days)); // Limit between 1 and 365 days
    
    $conn = getDBConnection();
    $results = [];
    
    // Calculate date limit
    $dateLimit = date('Y-m-d H:i:s', strtotime("-$days days"));
    
    // Total clicks
    $sql = "SELECT COUNT(*) as count FROM click_events WHERE timestamp > ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$dateLimit]);
    $results['totalClicks'] = (int)$stmt->fetch()['count'];
    
    // Total page views
    $sql = "SELECT COUNT(*) as count FROM page_views WHERE timestamp > ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$dateLimit]);
    $results['totalPageViews'] = (int)$stmt->fetch()['count'];
    
    // Total searches
    $sql = "SELECT COUNT(*) as count FROM search_queries WHERE timestamp > ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$dateLimit]);
    $results['totalSearches'] = (int)$stmt->fetch()['count'];
    
    // Top clicks
    $sql = "SELECT element_id, element_type, element_text, COUNT(*) as clicks
            FROM click_events
            WHERE timestamp > ?
            GROUP BY element_id, element_type, element_text
            ORDER BY clicks DESC
            LIMIT 20";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$dateLimit]);
    $results['topClicks'] = $stmt->fetchAll();
    
    // Top searches
    $sql = "SELECT query, COUNT(*) as count
            FROM search_queries
            WHERE timestamp > ?
            GROUP BY query
            ORDER BY count DESC
            LIMIT 20";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$dateLimit]);
    $results['topSearches'] = $stmt->fetchAll();
    
    // Clicks by hour
    $sql = "SELECT HOUR(timestamp) as hour, COUNT(*) as clicks
            FROM click_events
            WHERE timestamp > ?
            GROUP BY HOUR(timestamp)
            ORDER BY hour";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$dateLimit]);
    $results['clicksByHour'] = $stmt->fetchAll();
    
    echo json_encode($results);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch analytics summary']);
}
?>
