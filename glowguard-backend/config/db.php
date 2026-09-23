<?php
/**
 * Database connection for GlowGuard (XAMPP / MySQL).
 *
 * Default values match a stock XAMPP install:
 *   host     = localhost
 *   user     = root
 *   password = ''  (empty)
 *   database = glowguard
 *
 * Change these if your XAMPP MySQL is configured differently, or set the
 * matching environment variables (e.g. in an Apache vhost or a .env loader).
 */

define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'glowguard_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_PORT', getenv('DB_PORT') ?: '3306');

function get_db(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'Database connection failed. Is MySQL running in XAMPP, and has schema.sql been imported?',
                'detail' => $e->getMessage(),
            ]);
            exit;
        }
    }

    return $pdo;
}
