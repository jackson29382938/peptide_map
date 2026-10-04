<?php
require_once __DIR__ . '/../config.php';
setJSONHeaders();

try {
    $db = getDBConnection();

    // GET single vendor
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
        $id = (int)$_GET['id'];
        $stmt = $db->prepare("SELECT v.id, v.name, v.url, v.description, v.created_at, v.updated_at,
            COALESCE(AVG(r.rating), 0) AS avg_rating,
            COALESCE(COUNT(DISTINCT r.id), 0) AS total_ratings,
            COALESCE(SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END), 0) AS star_5,
            COALESCE(SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END), 0) AS star_4,
            COALESCE(SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END), 0) AS star_3,
            COALESCE(SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END), 0) AS star_2,
            COALESCE(SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END), 0) AS star_1,
            COALESCE(COUNT(DISTINCT c.id), 0) AS total_comments
          FROM peptide_vendors v
          LEFT JOIN vendor_ratings r ON r.vendor_id = v.id
          LEFT JOIN vendor_comments c ON c.vendor_id = v.id
          WHERE v.id = :id
          GROUP BY v.id");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        echo json_encode($row ?: []);
        exit();
    }

    // GET list
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $db->query("SELECT v.id, v.name, v.url, v.description, v.created_at, v.updated_at,
            COALESCE(AVG(r.rating), 0) AS avg_rating,
            COALESCE(COUNT(DISTINCT r.id), 0) AS total_ratings,
            COALESCE(SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END), 0) AS star_5,
            COALESCE(SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END), 0) AS star_4,
            COALESCE(SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END), 0) AS star_3,
            COALESCE(SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END), 0) AS star_2,
            COALESCE(SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END), 0) AS star_1,
            COALESCE(COUNT(DISTINCT c.id), 0) AS total_comments
          FROM peptide_vendors v
          LEFT JOIN vendor_ratings r ON r.vendor_id = v.id
          LEFT JOIN vendor_comments c ON c.vendor_id = v.id
          GROUP BY v.id
          ORDER BY avg_rating DESC, total_ratings DESC, v.name ASC");
        $rows = $stmt->fetchAll();
        echo json_encode($rows);
        exit();
    }

    // POST add/update
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!isAdminRequest()) {
            http_response_code(403);
            echo json_encode(['error' => 'Adding or editing vendors requires an admin token']);
            exit();
        }
        $data = getJSONInput();
        $action = isset($data['action']) ? $data['action'] : '';

        // Only http(s) links may be stored; anything else (javascript:, data:) would become a
        // clickable attack link on the vendor list.
        $isHttpUrl = function ($u) {
            return (bool)preg_match('#^https?://[^\s]+$#i', $u) && strlen($u) <= 500;
        };

        if ($action === 'add') {
            $name = sanitize($data['name'] ?? '');
            $url = sanitize($data['url'] ?? '');
            $description = sanitize($data['description'] ?? '');
            if (!$name || !$url || !$isHttpUrl(html_entity_decode($url))) { 
                http_response_code(400); 
                echo json_encode(['error'=>'name and a valid http(s) url required']); 
                exit(); 
            }
            $stmt = $db->prepare("INSERT INTO peptide_vendors (name, url, description) VALUES (:name, :url, :description)");
            $stmt->execute([':name'=>$name, ':url'=>$url, ':description'=>$description]);
            echo json_encode(['status'=>'ok', 'id'=>$db->lastInsertId()]);
            exit();
        }

        if ($action === 'update') {
            $id = (int)($data['id'] ?? 0);
            $name = sanitize($data['name'] ?? '');
            $url = sanitize($data['url'] ?? '');
            $description = sanitize($data['description'] ?? '');
            if ($id <= 0 || !$name || !$url || !$isHttpUrl(html_entity_decode($url))) { 
                http_response_code(400); 
                echo json_encode(['error'=>'id, name and a valid http(s) url required']); 
                exit(); 
            }
            $stmt = $db->prepare("UPDATE peptide_vendors SET name=:name, url=:url, description=:description, updated_at=NOW() WHERE id=:id");
            $stmt->execute([':name'=>$name, ':url'=>$url, ':description'=>$description, ':id'=>$id]);
            echo json_encode(['status'=>'ok']);
            exit();
        }

        http_response_code(400);
        echo json_encode(['error'=>'invalid action']);
        exit();
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (Exception $e) {
    http_response_code(500);
    error_log('companies.php: ' . $e->getMessage());
    echo json_encode(['error' => 'Server error']);
}
