<?php
// Database Setup Script
// Run this ONCE after uploading to create the database tables

require_once 'config.php';

echo "<!DOCTYPE html>
<html>
<head>
    <title>Database Setup</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .success { color: green; padding: 10px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; margin: 10px 0; }
        .error { color: red; padding: 10px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; margin: 10px 0; }
        .warning { color: orange; padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; margin: 10px 0; }
        h1 { color: #333; }
        code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>🗄️ Database Setup</h1>";

try {
    $conn = getDBConnection();
    
    echo "<div class='success'>✅ Database connection successful!</div>";
    
    // Create click_events table
    $sql1 = "CREATE TABLE IF NOT EXISTS click_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        element_id VARCHAR(255),
        element_type VARCHAR(100),
        element_text TEXT,
        page_url TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_id VARCHAR(100),
        user_agent TEXT,
        screen_width INT,
        screen_height INT,
        click_x INT,
        click_y INT,
        INDEX idx_timestamp (timestamp),
        INDEX idx_session (session_id),
        INDEX idx_element (element_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $conn->exec($sql1);
    echo "<div class='success'>✅ Table 'click_events' created successfully!</div>";
    
    // Create page_views table
    $sql2 = "CREATE TABLE IF NOT EXISTS page_views (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_url TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_id VARCHAR(100),
        user_agent TEXT,
        referrer TEXT,
        INDEX idx_timestamp (timestamp),
        INDEX idx_session (session_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $conn->exec($sql2);
    echo "<div class='success'>✅ Table 'page_views' created successfully!</div>";
    
    // Create search_queries table
    $sql3 = "CREATE TABLE IF NOT EXISTS search_queries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        query VARCHAR(500),
        results_count INT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_id VARCHAR(100),
        INDEX idx_timestamp (timestamp),
        INDEX idx_query (query)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $conn->exec($sql3);
    echo "<div class='success'>✅ Table 'search_queries' created successfully!</div>";
    
    echo "<div class='success'><strong>🎉 All tables created successfully!</strong></div>";
    echo "<div class='warning'>⚠️ <strong>IMPORTANT:</strong> For security, delete this file (<code>setup-database.php</code>) after setup is complete!</div>";
    echo "<p><a href='../index.html' style='color: blue;'>← Go to Main Site</a></p>";
    echo "<p><a href='../analytics.php' style='color: blue;'>→ View Analytics Dashboard</a></p>";
    
} catch(PDOException $e) {
    echo "<div class='error'>❌ Error: " . $e->getMessage() . "</div>";
    echo "<div class='error'>Please check your database credentials in <code>config.php</code></div>";
}

echo "</body></html>";
?>
