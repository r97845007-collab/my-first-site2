<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('GET');

$limit = (int)($_GET['limit'] ?? 6);
if ($limit < 1) {
    $limit = 6;
}
$limit = min($limit, 20);
$cursor = trim((string)($_GET['cursor'] ?? ''));
$sort = ($_GET['sort'] ?? 'new') === 'popular' ? 'popular' : 'new';
$query = trim((string)($_GET['q'] ?? ''));
$tag = trim((string)($_GET['tag'] ?? ''));

$user = current_user();
$userId = $user['id'] ?? null;

$params = [];
$conditions = ["p.type = 'post'", 'p.is_published = 1'];

if ($query !== '') {
    $conditions[] = '(p.title LIKE ? OR p.body LIKE ?)';
    $params[] = '%' . $query . '%';
    $params[] = '%' . $query . '%';
}

if ($tag !== '') {
    $conditions[] = '(p.route_tag LIKE ? OR p.hashtags LIKE ?)';
    $params[] = '%' . $tag . '%';
    $params[] = '%' . $tag . '%';
}

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

$sql = "SELECT p.id, p.type, p.title, p.body, p.route_tag, p.duration_label, p.level_label, p.hashtags, p.funnel_stage, p.media_id,
               p.is_published, p.created_at, COALESCE(p.title, p.body) AS caption,
               m.kind AS media_kind, m.telegram_file_id,
               (SELECT COUNT(*) FROM favorites f WHERE f.post_id = p.id) AS favorites_count,
               (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.is_deleted = 0) AS comments_count";

if ($userId) {
    $sql .= ", EXISTS(SELECT 1 FROM favorites f2 WHERE f2.post_id = p.id AND f2.user_id = ?) AS is_favorited";
    $params = array_merge([$userId], $params);
} else {
    $sql .= ', 0 AS is_favorited';
}

$sql .= " FROM posts p LEFT JOIN media m ON p.media_id = m.id WHERE {$whereSql}";

if ($sort === 'popular') {
    $sql .= ' ORDER BY favorites_count DESC, comments_count DESC, p.created_at DESC, p.id DESC';
} else {
    $sql .= ' ORDER BY p.created_at DESC, p.id DESC';
}

$sql .= ' LIMIT ' . $limit;

$rows = db_query($sql, $params);
foreach ($rows as &$row) {
    $row['media_url'] = $row['media_id'] ? '/api/media.php?id=' . $row['media_id'] : null;
    $row['is_favorited'] = (bool) $row['is_favorited'];
    $row['favorites_count'] = (int) $row['favorites_count'];
    $row['comments_count'] = (int) $row['comments_count'];
}

$nextCursor = null;
if (count($rows) === $limit) {
    $last = $rows[count($rows) - 1];
    $nextCursor = base64_encode($last['created_at'] . '|' . $last['id']);
}

sendJson(200, ['ok' => true, 'items' => $rows, 'next_cursor' => $nextCursor]);
