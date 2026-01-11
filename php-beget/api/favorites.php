<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('GET');
$user = requireLogin();

$idsRaw = trim((string)($_GET['ids'] ?? ''));
if ($idsRaw === '') {
    sendJson(200, ['ok' => true, 'map' => new stdClass()]);
}

$ids = array_filter(array_map('intval', explode(',', $idsRaw)), fn($id) => $id > 0);
if (!$ids) {
    sendJson(200, ['ok' => true, 'map' => new stdClass()]);
}

$placeholders = implode(',', array_fill(0, count($ids), '?'));
$params = array_merge([$user['id']], $ids);
$rows = db_query(
    "SELECT post_id FROM favorites WHERE user_id = ? AND post_id IN ({$placeholders})",
    $params
);

$map = [];
foreach ($ids as $id) {
    $map[(string) $id] = false;
}
foreach ($rows as $row) {
    $map[(string) $row['post_id']] = true;
}

sendJson(200, ['ok' => true, 'map' => $map]);
