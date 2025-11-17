<?php
require_once __DIR__ . '/../config.php';
setJSONHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $db = getDBConnection();
    $data = getJSONInput();

    $company_id = (int)($data['company_id'] ?? 0);
    $rating = (int)($data['rating'] ?? 0);
    $comment = trim($data['comment'] ?? '');

    if ($company_id <= 0 || !in_array($rating, [-1,0,1], true)) {
        http_response_code(400);
        echo json_encode(['error' => 'invalid payload']);
        exit();
    }

    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';

    $stmt = $db->prepare("INSERT INTO company_votes (company_id, rating, comment, ip_address, user_agent, created_at, updated_at)
        VALUES (:company_id, :rating, :comment, :ip, :ua, NOW(), NOW())");
    $stmt->execute([
        ':company_id' => $company_id,
        ':rating' => $rating,
        ':comment' => $comment,
        ':ip' => $ip,
        ':ua' => $ua
    ]);

    echo json_encode(['status' => 'ok']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
