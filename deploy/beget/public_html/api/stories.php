<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('GET');

$limit = (int)($_GET['limit'] ?? 20);
if ($limit < 1) {
    $limit = 20;
}
$limit = min($limit, 50);
$cursor = trim((string)($_GET['cursor'] ?? ''));

$params = [];
$conditions = ["p.type = 'memory'", 'p.is_published = 1'];

if ($cursor !== '') {
    $decoded = base64_decode($cursor, true);
    if ($decoded !== false) {
        [$cursorDate, $cursorId] = array_pad(explode('|', $decoded), 2, null);
        if ($cursorDate && $cursorId) {
            $conditions[] = '(p.created_at < ? OR (p.created_at = ? AND p.id < ?))';
            $params[] = $cursorDate;
            $params[] = $cursorDate;
            $params[] = (int) $cursorId;
        }
    }
}

$whereSql = implode(' AND ', $conditions);

$sql = "SELECT p.id, p.title, p.body AS text, p.route_tag, p.duration_label, p.level_label, p.hashtags, p.funnel_stage, p.media_id,
               p.is_published, p.created_at, m.kind AS media_kind, m.telegram_file_id
        FROM posts p
        LEFT JOIN media m ON p.media_id = m.id
        WHERE {$whereSql}
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT {$limit}";

$rows = db_query($sql, $params);
foreach ($rows as &$row) {
    $row['media_url'] = $row['media_id'] ? '/api/media.php?id=' . $row['media_id'] : null;
}

$nextCursor = null;
if (count($rows) === $limit) {
    $last = $rows[count($rows) - 1];
    $nextCursor = base64_encode($last['created_at'] . '|' . $last['id']);
}

sendJson(200, ['ok' => true, 'items' => $rows, 'next_cursor' => $nextCursor]);
