<?php
require_once __DIR__ . '/config.php';
header('Content-Type: text/plain');

try {
    $db = getDBConnection();

    $db->exec("CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(512) NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        UNIQUE KEY unique_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    $db->exec("CREATE TABLE IF NOT EXISTS company_votes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        rating TINYINT NOT NULL, -- -1,0,1
        comment TEXT NULL,
        ip_address VARCHAR(64) NULL,
        user_agent VARCHAR(512) NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        INDEX idx_company (company_id),
        CONSTRAINT fk_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Seed initial companies if table is empty
    $count = (int)$db->query('SELECT COUNT(*) AS c FROM companies')->fetch()['c'];
    if ($count === 0) {
        $seed = [
            ['Peptide Sciences','https://www.peptidesciences.com'],
            ['Science.bio','https://science.bio'],
            ['Pure Rawz','https://purerawz.com'],
            ['Limitless Life Nootropics (Limitless Biotech)','https://www.limitlesslifenootropics.com'],
            ['Soma Chems','https://somachems.com'],
            ['Core Peptides','https://www.corepeptides.com'],
            ['Biotech Peptides','https://biotechpeptides.com'],
            ['Phoenix Pharmaceuticals','https://phoenixpeptide.com'],
            ['Bachem','https://www.bachem.com'],
            ['NuScience Peptides','https://nusciencepeptides.com'],
            ['Direct Peptides','https://directpeptides.com'],
            ['AmbioPharm','https://www.ambiopharm.com'],
            ['PolyPeptide Group','https://www.polypeptide.com'],
            ['Chinese Peptide Company','https://www.chinesepeptide.com'],
            ['rPeptide','https://www.rpeptide.com'],
            ['AAPPTec','https://www.aapptec.com'],
            ['CPC Scientific','https://www.cpcscientific.com'],
            ['BCN Peptides','https://www.bcnpeptides.com'],
            ['Auspep','https://www.auspep.com.au'],
            ['GenScript','https://www.genscript.com'],
            ['Advanced Peptides','https://advancedpeptides.com'],
            ['QYAOBio (China Peptides)','https://www.qyaobio.com'],
            ['Synpeptide','https://www.synpeptide.com'],
            ['Synbio Technologies','https://www.synbio-tech.com'],
            ['Peptide Institute','https://www.peptide.co.jp'],
            ['LifeTein','https://www.lifetein.com'],
            ['Thermo Fisher Scientific','https://www.thermofisher.com'],
            ['AnaSpec','https://www.anaspec.com'],
            ['Activotec','https://www.activotec.com'],
            ['Bio-Synthesis (BSI)','https://www.biosyn.com'],
            ['CSBio','https://www.csbio.com'],
            ['CordenPharma','https://www.cordenpharma.com'],
        ];
        $stmt = $db->prepare('INSERT INTO companies (name, url, created_at, updated_at) VALUES (:name, :url, NOW(), NOW())');
        foreach ($seed as $row) {
            $stmt->execute([':name'=>$row[0], ':url'=>$row[1]]);
        }
        echo "Created tables and seeded companies.\n";
    } else {
        echo "Tables ensured. Companies count: $count\n";
    }

} catch (Exception $e) {
    http_response_code(500);
    echo "Error: " . $e->getMessage();
}
