<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('POST');
$user = requireLogin();

$data = parseJsonBody();
$token = trim((string)($data['botToken'] ?? ''));

if ($token === '' || strlen($token) < 20 || !str_contains($token, ':')) {
    sendError(400, 'Invalid token');
}

$payload = crypto_encrypt($token);
db_exec(
    'INSERT INTO user_telegram (user_id, bot_token_enc, bot_token_iv, bot_token_tag) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE bot_token_enc = VALUES(bot_token_enc), bot_token_iv = VALUES(bot_token_iv), bot_token_tag = VALUES(bot_token_tag)',
    [$user['id'], $payload['enc'], $payload['iv'], $payload['tag']]
);

sendJson(200, ['ok' => true]);
