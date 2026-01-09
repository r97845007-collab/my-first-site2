<?php
require_once __DIR__ . '/_util.php';

require_method('POST');

$data = read_json_body();
$email = trim((string)($data['email'] ?? ''));
$password = (string)($data['password'] ?? '');

if ($email === '' || $password === '') {
    json_response(['error' => 'Email and password are required'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(['error' => 'Invalid email'], 400);
}

$existing = db_query('SELECT id FROM users WHERE email = ?', [$email]);
if ($existing) {
    json_response(['error' => 'User already exists'], 400);
}

try {
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $userId = db_exec('INSERT INTO users (email, password_hash) VALUES (?, ?)', [$email, $hash]);
    $payload = [
        'sub' => (int) $userId,
        'email' => $email,
        'exp' => time() + 60 * 60 * 24 * 7,
    ];
    $token = jwt_create($payload);
    set_session_cookie($token, 60 * 60 * 24 * 7);
    json_response(['ok' => true, 'user' => ['id' => (int) $userId, 'email' => $email]], 200);
} catch (Throwable $error) {
    json_response(['error' => 'Registration failed'], 500);
}
