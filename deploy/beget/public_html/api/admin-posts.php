<?php
require_once __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $isPublic = ($_GET['public'] ?? '') === '1';
    if ($isPublic) {
        $rows = db_query(
            "SELECT p.id, p.type, p.title, p.body, p.route_tag, p.duration_label, p.level_label, p.hashtags, p.funnel_stage, p.media_id,
                    p.is_published, p.created_at, COALESCE(p.title, p.body) AS caption, m.kind AS media_kind, m.telegram_file_id
             FROM posts p
             LEFT JOIN media m ON p.media_id = m.id
             WHERE p.is_published = 1 AND p.type IN ('post','memory')
             ORDER BY p.created_at DESC"
        );
        foreach ($rows as &$row) {
            $row['media_url'] = $row['media_id'] ? '/api/media.php?id=' . $row['media_id'] : null;
        }
        sendJson(200, ['ok' => true, 'posts' => $rows]);
    }

    requireAdmin();
    $rows = db_query(
        "SELECT p.id, p.type, p.title, p.body, p.route_tag, p.duration_label, p.level_label, p.hashtags, p.funnel_stage, p.media_id,
                p.is_published, p.created_at, COALESCE(p.title, p.body) AS caption, m.kind AS media_kind, m.telegram_file_id
         FROM posts p
         LEFT JOIN media m ON p.media_id = m.id
         ORDER BY p.created_at DESC"
    );
    foreach ($rows as &$row) {
        $row['media_url'] = $row['media_id'] ? '/api/media.php?id=' . $row['media_id'] : null;
    }
    sendJson(200, ['ok' => true, 'posts' => $rows]);
}

if ($method === 'POST') {
    requireAdmin();
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    $isJson = str_starts_with($contentType, 'application/json');
    $data = $isJson ? parseJsonBody() : $_POST;

    $rawType = strtolower(trim((string)($data['type'] ?? 'post')));
    $normalizedType = in_array($rawType, ['photo', 'reel'], true) ? 'post' : $rawType;
    $type = in_array($normalizedType, ['post', 'memory', 'funnel'], true) ? $normalizedType : 'post';
    $title = trim((string)($data['title'] ?? $data['caption'] ?? ''));
    $body = trim((string)($data['body'] ?? $data['caption'] ?? ''));
    $routeTag = trim((string)($data['route_tag'] ?? $data['routeTag'] ?? ''));
    $duration = trim((string)($data['duration_label'] ?? $data['durationLabel'] ?? ''));
    $level = trim((string)($data['level_label'] ?? $data['levelLabel'] ?? ''));
    $hashtags = $data['hashtags'] ?? '';
    $funnelStage = trim((string)($data['funnel_stage'] ?? $data['funnelStage'] ?? ''));
    $isPublished = (int)($data['is_published'] ?? $data['isPublished'] ?? 1);
    $rating = isset($data['rating']) ? (int) $data['rating'] : null;
    if ($rating !== null && ($rating < 1 || $rating > 5)) {
        $rating = null;
    }

    if ($body === '' && $title === '') {
        sendError(400, 'Caption is required');
    }

    if (is_array($hashtags)) {
        $hashtags = json_encode($hashtags, JSON_UNESCAPED_UNICODE);
    } else {
        $hashtags = trim((string)$hashtags);
    }

    $mediaId = null;
    if (!$isJson && !empty($_FILES['media']) && is_uploaded_file($_FILES['media']['tmp_name'])) {
        $tmp = $_FILES['media']['tmp_name'];
        $mime = mime_content_type($tmp) ?: '';
        $kind = str_starts_with($mime, 'video/') ? 'video' : 'photo';
        $fileId = telegram_send_media($kind, $tmp);
        if (!$fileId) {
            sendError(500, 'Media upload failed');
        }
        $mediaId = bin2hex(random_bytes(20));
        db_exec(
            'INSERT INTO media (id, telegram_file_id, kind) VALUES (?, ?, ?)',
            [$mediaId, $fileId, $kind]
        );
    }

    if ($rawType === 'review') {
        $reviewText = $body !== '' ? $body : $title;
        if ($reviewText === '') {
            sendError(400, 'Review text is required');
        }
        $status = $isPublished ? 'approved' : 'pending';
        $reviewId = db_exec(
            'INSERT INTO reviews (name, rating, text, status) VALUES (?, ?, ?, ?)',
            [null, $rating, $reviewText, $status]
        );
        if ($mediaId) {
            db_exec('INSERT INTO review_media (review_id, media_id) VALUES (?, ?)', [$reviewId, $mediaId]);
        }
        sendJson(200, ['ok' => true, 'id' => (int) $reviewId]);
    }

    $postId = db_exec(
        'INSERT INTO posts (type, title, body, route_tag, duration_label, level_label, hashtags, funnel_stage, media_id, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
            $type,
            $title !== '' ? $title : null,
            $body !== '' ? $body : $title,
            $routeTag !== '' ? $routeTag : null,
            $duration !== '' ? $duration : null,
            $level !== '' ? $level : null,
            $hashtags !== '' ? $hashtags : null,
            $funnelStage !== '' ? $funnelStage : null,
            $mediaId,
            $isPublished ? 1 : 0,
        ]
    );

    sendJson(200, ['ok' => true, 'id' => (int) $postId]);
}

if ($method === 'PUT') {
    requireAdmin();
    $data = parseJsonBody();
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) {
        sendError(400, 'Invalid id');
    }

    $fields = [];
    $params = [];
    $map = [
        'title' => 'title',
        'body' => 'body',
        'caption' => 'title',
        'route_tag' => 'route_tag',
        'routeTag' => 'route_tag',
        'duration_label' => 'duration_label',
        'durationLabel' => 'duration_label',
        'level_label' => 'level_label',
        'levelLabel' => 'level_label',
        'hashtags' => 'hashtags',
        'funnel_stage' => 'funnel_stage',
        'funnelStage' => 'funnel_stage',
        'is_published' => 'is_published',
        'isPublished' => 'is_published',
    ];
    foreach ($map as $key => $column) {
        if (!array_key_exists($key, $data)) {
            continue;
        }
        $value = $data[$key];
        if ($column === 'hashtags' && is_array($value)) {
            $value = json_encode($value, JSON_UNESCAPED_UNICODE);
        }
        if ($column === 'is_published') {
            $value = (int) $value ? 1 : 0;
        }
        $fields[$column] = $value;
    }

    if (!$fields) {
        sendError(400, 'No fields to update');
    }

    $sets = [];
    foreach ($fields as $column => $value) {
        $sets[] = "$column = ?";
        $params[] = $value;
    }
    $params[] = $id;
    $sql = 'UPDATE posts SET ' . implode(', ', $sets) . ' WHERE id = ?';
    db_exec($sql, $params);

    sendJson(200, ['ok' => true]);
}

if ($method === 'DELETE') {
    requireAdmin();
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) {
        sendError(400, 'Invalid id');
    }
    db_exec('DELETE FROM posts WHERE id = ?', [$id]);
    sendJson(200, ['ok' => true]);
}

sendError(405, 'Method Not Allowed');
