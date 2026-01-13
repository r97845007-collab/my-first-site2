<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('GET');

$hasStoryMediaTable = null;
$storyMediaTableExists = function () use (&$hasStoryMediaTable): bool {
    if ($hasStoryMediaTable !== null) {
        return $hasStoryMediaTable;
    }
    $rows = db_query("SHOW TABLES LIKE 'story_media'");
    $hasStoryMediaTable = !empty($rows);
    return $hasStoryMediaTable;
};

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
               p.is_published, p.created_at, m.kind AS media_kind
        FROM posts p
        LEFT JOIN media m ON p.media_id = m.id
        WHERE {$whereSql}
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT {$limit}";

$rows = db_query($sql, $params);
if ($rows) {
    if ($storyMediaTableExists()) {
        $storyIds = array_map(fn ($row) => (int) $row['id'], $rows);
        $placeholders = implode(',', array_fill(0, count($storyIds), '?'));
        $mediaRows = db_query(
            "SELECT sm.story_id, sm.media_id, sm.kind, sm.thumb_media_id, sm.sort_order,
                    m.kind AS media_kind
             FROM story_media sm
             LEFT JOIN media m ON sm.media_id = m.id
             WHERE sm.story_id IN ({$placeholders})
             ORDER BY sm.sort_order ASC, sm.id ASC",
            $storyIds
        );
        $mediaByStory = [];
        foreach ($mediaRows as $media) {
            $mediaId = $media['media_id'];
            $thumbId = $media['thumb_media_id'] ?? null;
            $kind = $media['kind'] ?: ($media['media_kind'] ?? 'photo');
            $mediaType = $kind === 'video' ? 'video' : 'image';
            $thumbUrl = $thumbId
                ? '/api/media.php?id=' . $thumbId . '&thumb=256'
                : '/api/media.php?id=' . $mediaId . '&thumb=256';
            $mediaByStory[$media['story_id']][] = [
                'media_id' => $mediaId,
                'media_type' => $mediaType,
                'media_url' => $mediaId ? '/api/media.php?id=' . $mediaId : null,
                'thumb_url' => $thumbUrl,
            ];
        }
        foreach ($rows as &$row) {
            $mediaList = $mediaByStory[$row['id']] ?? [];
            if (!$mediaList && !empty($row['media_id'])) {
                $mediaType = ($row['media_kind'] ?? '') === 'video' ? 'video' : 'image';
                $mediaList[] = [
                    'media_id' => $row['media_id'],
                    'media_type' => $mediaType,
                    'media_url' => '/api/media.php?id=' . $row['media_id'],
                    'thumb_url' => '/api/media.php?id=' . $row['media_id'] . '&thumb=256',
                ];
            }
            $row['media'] = $mediaList;
            $row['media_url'] = $row['media_id'] ? '/api/media.php?id=' . $row['media_id'] : null;
            if (!$row['media_url'] && !empty($mediaList[0]['media_url'])) {
                $row['media_url'] = $mediaList[0]['media_url'];
            }
        }
    } else {
        foreach ($rows as &$row) {
            $row['media_url'] = $row['media_id'] ? '/api/media.php?id=' . $row['media_id'] : null;
            $mediaType = ($row['media_kind'] ?? '') === 'video' ? 'video' : 'image';
            $row['media'] = $row['media_url']
                ? [[
                    'media_id' => $row['media_id'],
                    'media_type' => $mediaType,
                    'media_url' => $row['media_url'],
                    'thumb_url' => '/api/media.php?id=' . $row['media_id'] . '&thumb=256',
                ]]
                : [];
        }
    }
}

$nextCursor = null;
if (count($rows) === $limit) {
    $last = $rows[count($rows) - 1];
    $nextCursor = base64_encode($last['created_at'] . '|' . $last['id']);
}

sendJson(200, ['ok' => true, 'items' => $rows, 'next_cursor' => $nextCursor]);
