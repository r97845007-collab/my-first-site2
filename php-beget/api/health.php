<?php
function json_response(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

define('APP_PRIVATE_PATH', __DIR__);
$configPath = APP_PRIVATE_PATH . '/config.local.php';
if (!file_exists($configPath)) {
    json_response(['ok' => false, 'error' => 'config.local.php not found'], 500);
}

$config = require $configPath;
if (!is_array($config)) {
    json_response(['ok' => false, 'error' => 'config.local.php invalid'], 500);
}

$GLOBALS['config'] = $config;
require_once __DIR__ . '/../lib/db.php';

try {
    $pdo = db();
    $tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    json_response([
        'ok' => true,
        'php_version' => PHP_VERSION,
        'db' => [
            'ok' => true,
            'tables' => $tables,
        ],
    ], 200);
} catch (Throwable $error) {
    json_response(['ok' => false, 'error' => 'Database connection failed'], 500);
}
