<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('GET');

$user = current_user();
if (!$user) {
    sendError(401, 'Unauthorized');
}

sendJson(200, [
    'ok' => true,
    'id' => (int) $user['id'],
    'email' => $user['email'],
    'role' => $user['role'],
]);
