<?php
if (!defined('APP_PRIVATE_PATH')) {
    http_response_code(500);
    echo 'APP_PRIVATE_PATH is not defined.';
    exit;
}

$configPath = APP_PRIVATE_PATH . '/config.local.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo 'config.local.php not found.';
    exit;
}

$config = require $configPath;

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/crypto.php';
require_once __DIR__ . '/csrf.php';
require_once __DIR__ . '/telegram.php';
require_once __DIR__ . '/render.php';

session_start();
