<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('GET');
$user = requireLogin();

$rows = db_query('SELECT bot_token_enc, bot_token_iv, bot_token_tag FROM user_telegram WHERE user_id = ?', [$user['id']]);
if (!$rows) {
    sendError(404, 'Token not found');
}

try {
    $token = crypto_decrypt([
        'enc' => $rows[0]['bot_token_enc'],
        'iv' => $rows[0]['bot_token_iv'],
        'tag' => $rows[0]['bot_token_tag'],
    ]);
} catch (Throwable $error) {
    sendError(500, 'Server error');
}

$url = 'https://api.telegram.org/bot' . $token . '/getMe';
$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POSTFIELDS => [],
]);
$raw = curl_exec($ch);
curl_close($ch);
$response = json_decode($raw ?: '', true);
if (empty($response['ok'])) {
    sendError(400, 'Invalid token');
}

sendJson(200, ['ok' => true, 'telegram' => $response['result'] ?? []]);
