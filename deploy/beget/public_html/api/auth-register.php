<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('POST');

$data = parseJsonBody();
$email = trim((string)($data['email'] ?? ''));
$password = (string)($data['password'] ?? '');

if ($email === '' || $password === '') {
    sendError(400, 'Email and password are required');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendError(400, 'Invalid email');
}

$existing = db_query('SELECT id FROM users WHERE email = ?', [$email]);
if ($existing) {
    sendError(400, 'User already exists');
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$userId = db_exec('INSERT INTO users (email, password_hash) VALUES (?, ?)', [$email, $hash]);

$payload = [
    'sub' => (int) $userId,
    'email' => $email,
    'exp' => time() + 60 * 60 * 24 * 7,
];
$token = jwt_create($payload);
set_session_cookie($token, 60 * 60 * 24 * 7);

sendJson(200, ['ok' => true]);
