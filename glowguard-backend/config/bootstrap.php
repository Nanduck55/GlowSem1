<?php
/**
 * Included at the top of every endpoint.
 * Sets up CORS (so the Vite dev server on a different port can call this
 * API), forces JSON, and handles the CORS preflight (OPTIONS) request.
 */

// Allow the Vite dev server (default port 5173) and same-origin requests.
// If you deploy the built frontend to the same XAMPP vhost as this API,
// you can tighten this to that single origin instead of '*'.
$allowedOrigin = getenv('CORS_ORIGIN') ?: '*';

header("Access-Control-Allow-Origin: $allowedOrigin");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/auth.php';

/** Decode the JSON request body into an associative array. */
function body(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}
