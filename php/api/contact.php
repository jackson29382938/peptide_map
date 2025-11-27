<?php
// API Endpoint: Send Contact Email
require_once '../config.php';

// Try to load PHPMailer
$phpmailerAvailable = false;
if (file_exists(__DIR__ . '/../../vendor/autoload.php')) {
    require_once __DIR__ . '/../../vendor/autoload.php';
    $phpmailerAvailable = class_exists('PHPMailer\PHPMailer\PHPMailer');
} elseif (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
    $phpmailerAvailable = class_exists('PHPMailer\PHPMailer\PHPMailer');
}

setJSONHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $data = getJSONInput();
    
    // Validate required fields
    if (!isset($data['email']) || !isset($data['message'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit();
    }
    
    // Sanitize inputs
    $email = sanitize($data['email']);
    $message = sanitize($data['message']);
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email address']);
        exit();
    }
    
    // Validate message length
    if (strlen($message) < 10) {
        http_response_code(400);
        echo json_encode(['error' => 'Message must be at least 10 characters long']);
        exit();
    }
    
    // Recipient email
    $to = 'bodymappeptide@gmail.com';
    
    // Email subject
    $subject = 'Contact Form Submission from Peptide Map';
    
    // Email body
    $emailBody = "New contact form submission from Peptide Map\n\n";
    $emailBody .= "From: " . $email . "\n";
    $emailBody .= "Date: " . date('Y-m-d H:i:s') . "\n\n";
    $emailBody .= "Message:\n";
    $emailBody .= $message . "\n\n";
    $emailBody .= "---\n";
    $emailBody .= "This email was sent from the contact form on the Peptide Map website.\n";
    
    $mailSent = false;
    
    // Use PHPMailer if available, otherwise fall back to mail()
    if ($phpmailerAvailable) {
        $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
        
        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host = 'localhost'; // Default to localhost, can be configured
            $mail->SMTPAuth = false; // Set to true if SMTP authentication is required
            $mail->Port = 25; // Default SMTP port
            $mail->CharSet = 'UTF-8';
            
            // If SMTP credentials are needed, uncomment and configure:
            // $mail->SMTPAuth = true;
            // $mail->Username = 'your-smtp-username';
            // $mail->Password = 'your-smtp-password';
            // $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS; // or \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
            
            // Recipients
            $mail->setFrom($email, 'Peptide Map Contact Form');
            $mail->addAddress($to, 'Peptide Map');
            $mail->addReplyTo($email, 'Contact Form User');
            
            // Content
            $mail->isHTML(false);
            $mail->Subject = $subject;
            $mail->Body = $emailBody;
            $mail->AltBody = $emailBody;
            
            $mail->send();
            $mailSent = true;
        } catch (\PHPMailer\PHPMailer\Exception $e) {
            // If SMTP fails, try using mail() as fallback
            error_log("PHPMailer Error: " . $mail->ErrorInfo);
            $mailSent = false;
        } catch (\Exception $e) {
            // Generic exception fallback
            error_log("PHPMailer Error: " . $e->getMessage());
            $mailSent = false;
        }
    }
    
    // Fallback to mail() if PHPMailer not available or failed
    if (!$mailSent) {
        $headers = "From: " . $email . "\r\n";
        $headers .= "Reply-To: " . $email . "\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        
        $mailSent = mail($to, $subject, $emailBody, $headers);
    }
    
    if ($mailSent) {
        echo json_encode([
            'success' => true,
            'message' => 'Email sent successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to send email. Please try again later.']);
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>

