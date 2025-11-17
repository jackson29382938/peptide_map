<?php
// Vendor Rating System Database Setup
// Run this ONCE to create the vendor rating tables

require_once 'config.php';

echo "<!DOCTYPE html>
<html>
<head>
    <title>Vendor Rating Database Setup</title>
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
    <h1>🏢 Vendor Rating System Setup</h1>";

try {
    $conn = getDBConnection();
    
    echo "<div class='success'>✅ Database connection successful!</div>";
    
    // Create peptide_vendors table
    $sql1 = "CREATE TABLE IF NOT EXISTS peptide_vendors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_url (url(191)),
        INDEX idx_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $conn->exec($sql1);
    echo "<div class='success'>✅ Table 'peptide_vendors' created successfully!</div>";
    
    // Create vendor_ratings table
    $sql2 = "CREATE TABLE IF NOT EXISTS vendor_ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendor_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        user_session VARCHAR(100),
        user_ip VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_id) REFERENCES peptide_vendors(id) ON DELETE CASCADE,
        INDEX idx_vendor (vendor_id),
        INDEX idx_session (user_session),
        INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $conn->exec($sql2);
    echo "<div class='success'>✅ Table 'vendor_ratings' created successfully!</div>";
    
    // Create vendor_comments table
    $sql3 = "CREATE TABLE IF NOT EXISTS vendor_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendor_id INT NOT NULL,
        comment TEXT NOT NULL,
        user_session VARCHAR(100),
        user_ip VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_id) REFERENCES peptide_vendors(id) ON DELETE CASCADE,
        INDEX idx_vendor (vendor_id),
        INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $conn->exec($sql3);
    echo "<div class='success'>✅ Table 'vendor_comments' created successfully!</div>";
    
    // Pre-populate with initial vendors
    $initialVendors = [
        ['Peptide Sciences', 'https://www.peptidesciences.com'],
        ['Core Peptides', 'https://corepeptides.com'],
        ['Peptide Pros', 'https://peptidepros.net'],
        ['Bachem', 'https://www.bachem.com'],
        ['GenScript', 'https://www.genscript.com'],
        ['Limitless Life Nootropics', 'https://limitlesslifenootropics.com'],
        ['Aapptec Peptides', 'https://www.peptide.com'],
        ['Pure Rawz', 'https://purerawz.co'],
        ['Science.bio', 'https://science.bio'],
        ['Phoenix Pharmaceuticals', 'https://www.phoenixpeptide.com'],
        ['Polaris Peptides', 'https://polarispeptides.com']
    ];
    
    $stmt = $conn->prepare("INSERT IGNORE INTO peptide_vendors (name, url) VALUES (?, ?)");
    $insertedCount = 0;
    foreach ($initialVendors as $vendor) {
        $stmt->execute($vendor);
        if ($stmt->rowCount() > 0) $insertedCount++;
    }
    
    echo "<div class='success'>✅ Pre-populated $insertedCount vendor(s)!</div>";
    
    echo "<div class='success'><strong>🎉 Vendor rating system ready!</strong></div>";
    echo "<div class='warning'>⚠️ <strong>IMPORTANT:</strong> For security, delete this file (<code>setup-vendors-database.php</code>) after setup is complete!</div>";
    echo "<p><a href='../index.html' style='color: blue;'>← Go to Main Site</a></p>";
    
} catch(PDOException $e) {
    echo "<div class='error'>❌ Error: " . $e->getMessage() . "</div>";
    echo "<div class='error'>Please check your database credentials in <code>config.php</code></div>";
}

echo "</body></html>";
?>
