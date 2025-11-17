<?php
// API Endpoint: Export Click Data as CSV
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $conn = getDBConnection();
    $sql = "SELECT * FROM click_events ORDER BY timestamp DESC LIMIT 10000";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $results = $stmt->fetchAll();
    
    if (empty($results)) {
        echo "No data available";
        exit();
    }
    
    // Set CSV headers
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename=click_analytics_' . date('Y-m-d') . '.csv');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    // Open output stream
    $output = fopen('php://output', 'w');
    
    // Write CSV headers
    fputcsv($output, array_keys($results[0]));
    
    // Write data rows
    foreach ($results as $row) {
        fputcsv($output, $row);
    }
    
    fclose($output);
    
} catch(Exception $e) {
    http_response_code(500);
    echo "Error exporting data";
}
?>
