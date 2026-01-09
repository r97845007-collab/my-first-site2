<?php
require_once __DIR__ . '/_util.php';

require_method('POST');

$data = read_json_body();
$email = trim((string)($data['email'] ?? ''));
$password = (string)($data['password'] ?? '');

if ($email === '' || $password === '') {
    json_response(['error' => 'Email and password are required'], 400);
}

$rows = db_query('SELECT id, email, password_hash FROM users WHERE email = ?', [$email]);
if (!$rows) {
    json_response(['error' => 'Invalid credentials'], 401);
}

$user = $rows[0];
if (!password_verify($password, $user['password_hash'])) {
    json_response(['error' => 'Invalid credentials'], 401);
}

$payload = [
    'sub' => (int) $user['id'],
    'email' => $user['email'],
    'exp' => time() + 60 * 60 * 24 * 7,
];
$token = jwt_create($payload);
set_session_cookie($token, 60 * 60 * 24 * 7);

json_response(['ok' => true, 'user' => ['id' => (int) $user['id'], 'email' => $user['email']]], 200);
