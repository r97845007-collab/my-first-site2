<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('GET');
requireAdmin();

if (telegram_token() === '') {
    sendError(500, 'Telegram token missing');
}

$response = telegram_request('getMe', []);
if (empty($response['ok'])) {
    sendError(500, 'Telegram check failed');
}

sendJson(200, ['ok' => true, 'telegram' => $response['result'] ?? []]);
