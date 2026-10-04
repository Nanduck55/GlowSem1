<?php
/**
 * Core initialization file included at the top of every API endpoint.
 * Configures CORS, default response content-types, and error handling.
 */

$allowedOrigin = getenv('CORS_ORIGIN') ?: '*';

header("Access-Control-Allow-Origin: $allowedOrigin");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

set_exception_handler(function (Throwable $e) {
    http_response_code(500);
    $response = ['error' => 'An internal server error occurred.'];
    if (getenv('APP_ENV') === 'development') {
        $response['detail'] = $e->getMessage();
    }
    echo json_encode($response);
    exit;
});

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/auth.php';

/**
 * Safely decodes JSON payloads from the HTTP request body.
 */
function body(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}