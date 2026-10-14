<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Require the 3 manual files from lib/PHPMailer/
require_once __DIR__ . '/../lib/PHPMailer/Exception.php';
require_once __DIR__ . '/../lib/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/../lib/PHPMailer/SMTP.php';

function sendEmail(string $toEmail, string $subject, string $htmlBody): bool 
{
    $mail = new PHPMailer(true);

    try {
        // SMTP Configuration
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        
        // Gmail credentials
        $mail->Username   = 'chans0000q@gmail.com'; 
        $mail->Password   = 'cecgtqkrktmxamjf'; 
        $mail->setFrom('chans0000q@gmail.com', 'GlowGuard Support');
        
        // Change these 2 lines in config/mailer.php
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // SSL instead of STARTTLS
        $mail->Port       = 465;                        // Port 465 instead of 587
        // Message Setup
        $mail->setFrom('chans0000q@gmail.com', 'GlowGuard Support');
        $mail->addAddress($toEmail);
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $htmlBody;

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("PHPMailer Error: {$mail->ErrorInfo}");
        return false;
    }
}