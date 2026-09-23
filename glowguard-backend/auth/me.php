<?php
require_once __DIR__ . '/../config/bootstrap.php';
require_method('GET');

$pdo = get_db();
$user = require_auth($pdo);

json_out(['user' => public_user($user)]);
