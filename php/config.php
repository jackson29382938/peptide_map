<?php
// Database Configuration for InfinityFree
// Update these values with your InfinityFree MySQL credentials

// Database credentials. Prefer overriding these without editing this tracked file:
//   * create php/config.local.php (git-ignored) that define()s DB_HOST / DB_NAME / DB_USER / DB_PASS, or
//   * set DB_HOST / DB_NAME / DB_USER / DB_PASS environment variables.
// The literal values below are the original defaults and should be rotated and then removed.
if (file_exists(__DIR__ . '/config.local.php')) {
    require_once __DIR__ . '/config.local.php';
}
if (!defined('DB_HOST')) define('DB_HOST', getenv('DB_HOST') ?: 'sql304.infinityfree.com');
if (!defined('DB_NAME')) define('DB_NAME', getenv('DB_NAME') ?: 'if0_40377460_common_clicks');
if (!defined('DB_USER')) define('DB_USER', getenv('DB_USER') ?: 'if0_40377460');
if (!defined('DB_PASS')) define('DB_PASS', getenv('DB_PASS') ?: 'IBraverest1');

// Create database connection
function getDBConnection() {
    try {
        $conn = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $conn;
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
}

// Set JSON headers
function setJSONHeaders() {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Get POST data as JSON
function getJSONInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}

// Sanitize input
function sanitize($data) {
    if (is_array($data)) {
        return array_map('sanitize', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)));
}
?>
