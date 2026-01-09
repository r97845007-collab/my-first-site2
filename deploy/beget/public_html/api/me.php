<?php
require_once __DIR__ . '/_util.php';

require_method('GET');

$user = current_user();
if (!$user) {
    json_response(['error' => 'Unauthorized'], 401);
}

json_response(['id' => (int) $user['id'], 'email' => $user['email'], 'role' => $user['role']], 200);
