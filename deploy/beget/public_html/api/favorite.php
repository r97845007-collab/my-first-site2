<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('POST');
$user = requireLogin();

$data = parseJsonBody();
$postId = (int)($data['post_id'] ?? 0);
$state = $data['state'] ?? null;

if ($postId <= 0) {
    sendError(400, 'Invalid post_id');
}

if (!is_bool($state)) {
    sendError(400, 'Invalid state');
}

if ($state) {
    db_exec('INSERT IGNORE INTO favorites (user_id, post_id) VALUES (?, ?)', [$user['id'], $postId]);
} else {
    db_exec('DELETE FROM favorites WHERE user_id = ? AND post_id = ?', [$user['id'], $postId]);
}

sendJson(200, ['ok' => true]);
