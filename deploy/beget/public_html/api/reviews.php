<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('GET');

$rows = db_query(
    "SELECT r.id, r.name, r.rating, r.text, r.created_at,
            m.id AS media_id, m.kind AS media_kind, m.telegram_file_id
     FROM reviews r
     LEFT JOIN review_media rm ON rm.review_id = r.id
     LEFT JOIN media m ON rm.media_id = m.id
     WHERE r.status = 'approved'
     ORDER BY r.created_at DESC"
);

$items = [];
foreach ($rows as $row) {
    $id = (int) $row['id'];
    if (!isset($items[$id])) {
        $items[$id] = [
            'id' => $id,
            'name' => $row['name'] ?? null,
            'rating' => isset($row['rating']) ? (int) $row['rating'] : null,
            'text' => $row['text'] ?? '',
            'created_at' => $row['created_at'] ?? null,
            'media_id' => null,
            'media_kind' => null,
            'telegram_file_id' => null,
            'media_url' => null,
        ];
    }
    if ($row['media_id'] && !$items[$id]['media_id']) {
        $items[$id]['media_id'] = $row['media_id'];
        $items[$id]['media_kind'] = $row['media_kind'] ?? null;
        $items[$id]['telegram_file_id'] = $row['telegram_file_id'] ?? null;
        $items[$id]['media_url'] = '/api/media.php?id=' . $row['media_id'];
    }
}

sendJson(200, ['ok' => true, 'items' => array_values($items)]);
