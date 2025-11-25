# PHPMailer Installation Guide

## Option 1: Using Composer (Recommended)

1. Navigate to the `php` directory:
   ```bash
   cd php
   ```

2. Install PHPMailer:
   ```bash
   composer install
   ```

   If you don't have Composer installed, download it from https://getcomposer.org/

## Option 2: Manual Installation

1. Download PHPMailer from https://github.com/PHPMailer/PHPMailer
2. Extract the PHPMailer folder to `php/vendor/PHPMailer/PHPMailer/`
3. The autoloader should find it automatically

## Configuration

The contact form will automatically use PHPMailer if it's available, otherwise it will fall back to the basic `mail()` function.

### SMTP Configuration (Optional)

If you need to use SMTP (recommended for production), edit `php/api/contact.php` and configure:

```php
$mail->Host = 'smtp.example.com';
$mail->SMTPAuth = true;
$mail->Username = 'your-smtp-username';
$mail->Password = 'your-smtp-password';
$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
$mail->Port = 587;
```

## Testing

After installation, test the contact form. Check the PHP error logs if emails aren't sending.

