<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('POST');

$data = parseJsonBody();
$email = trim((string)($data['email'] ?? ''));
$password = (string)($data['password'] ?? '');

if ($email === '' || $password === '') {
    sendError(400, 'Email and password are required');
}

$rows = db_query('SELECT id, email, password_hash FROM users WHERE email = ?', [$email]);
if (!$rows) {
    sendError(401, 'Invalid credentials');
}

$user = $rows[0];
if (!password_verify($password, $user['password_hash'])) {
    sendError(401, 'Invalid credentials');
}

$payload = [
    'sub' => (int) $user['id'],
    'email' => $user['email'],
    'exp' => time() + 60 * 60 * 24 * 7,
];
$token = jwt_create($payload);
set_session_cookie($token, 60 * 60 * 24 * 7);

sendJson(200, ['ok' => true]);
