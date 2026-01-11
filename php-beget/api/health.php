<?php
ini_set('display_errors', '0');

require_once __DIR__ . '/../lib/http.php';
requireMethod('GET');

$configPath = __DIR__ . '/config.local.php';
if (!file_exists($configPath)) {
    sendJson(500, ['ok' => false, 'error' => 'config.local.php not found']);
}

$config = require $configPath;
if (!is_array($config)) {
    sendJson(500, ['ok' => false, 'error' => 'config.local.php invalid']);
}

$GLOBALS['config'] = $config;
require_once __DIR__ . '/../lib/db.php';

try {
    $pdo = db();
    $pdo->query('SELECT 1');
    $tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    sendJson(200, [
        'ok' => true,
        'php' => PHP_VERSION,
        'db' => [
            'ok' => true,
            'tables' => $tables,
        ],
    ]);
} catch (Throwable $error) {
    sendJson(500, ['ok' => false, 'error' => 'Database connection failed']);
}
