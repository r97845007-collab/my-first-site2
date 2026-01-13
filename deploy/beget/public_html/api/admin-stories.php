<?php
require_once __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $isPublic = ($_GET['public'] ?? '') === '1';
    if ($isPublic) {
        $rows = db_query(
            "SELECT p.id, p.type, p.title, p.body AS text, p.route_tag, p.duration_label, p.level_label, p.hashtags, p.funnel_stage, p.media_id,
                    p.is_published, p.created_at, m.kind AS media_kind, m.telegram_file_id
             FROM posts p
             LEFT JOIN media m ON p.media_id = m.id
             WHERE p.type = 'memory' AND p.is_published = 1
             ORDER BY p.created_at DESC"
        );
        foreach ($rows as &$row) {
            $row['media_url'] = $row['media_id'] ? '/api/media.php?id=' . $row['media_id'] : null;
        }
        sendJson(200, ['ok' => true, 'stories' => $rows]);
    }

    requireAdmin();
    $rows = db_query(
        "SELECT p.id, p.type, p.title, p.body AS text, p.route_tag, p.duration_label, p.level_label, p.hashtags, p.funnel_stage, p.media_id,
                p.is_published, p.created_at, m.kind AS media_kind, m.telegram_file_id
         FROM posts p
         LEFT JOIN media m ON p.media_id = m.id
         WHERE p.type = 'memory'
         ORDER BY p.created_at DESC"
    );
    foreach ($rows as &$row) {
        $row['media_url'] = $row['media_id'] ? '/api/media.php?id=' . $row['media_id'] : null;
    }
    sendJson(200, ['ok' => true, 'stories' => $rows]);
}

if ($method === 'POST') {
    requireAdmin();
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    $isJson = str_starts_with($contentType, 'application/json');
    $data = $isJson ? parseJsonBody() : $_POST;

    $title = trim((string)($data['title'] ?? $data['caption'] ?? ''));
    $text = trim((string)($data['text'] ?? $data['body'] ?? ''));
    $maxVideoBytes = 50 * 1024 * 1024;

    if ($title === '') {
        sendError(400, 'Title is required');
    }

    $mediaId = null;
    if (!$isJson && !empty($_FILES['media']) && is_uploaded_file($_FILES['media']['tmp_name'])) {
        $tmp = $_FILES['media']['tmp_name'];
        $mime = mime_content_type($tmp) ?: '';
        $kind = str_starts_with($mime, 'video/') ? 'video' : 'photo';
        if ($kind === 'video') {
            if ($mime !== 'video/mp4') {
                sendError(400, 'Only MP4 video is allowed');
            }
            $size = (int)($_FILES['media']['size'] ?? 0);
            if ($size > $maxVideoBytes) {
                sendError(400, 'Video is too large');
            }
        }
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

    $storyId = db_exec(
        "INSERT INTO posts (type, title, body, media_id, is_published) VALUES ('memory', ?, ?, ?, 1)",
        [$title, $text !== '' ? $text : $title, $mediaId]
    );

    sendJson(200, ['ok' => true, 'id' => (int) $storyId]);
}

if ($method === 'PUT') {
    requireAdmin();
    $data = parseJsonBody();
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) {
        sendError(400, 'Invalid id');
    }
    $title = trim((string)($data['title'] ?? $data['caption'] ?? ''));
    $text = trim((string)($data['text'] ?? $data['body'] ?? ''));
    $fields = [];
    $params = [];
    if ($title !== '') {
        $fields[] = 'title = ?';
        $params[] = $title;
    }
    if ($text !== '') {
        $fields[] = 'body = ?';
        $params[] = $text;
    }
    if (!$fields) {
        sendError(400, 'No fields to update');
    }
    $params[] = $id;
    $sql = 'UPDATE posts SET ' . implode(', ', $fields) . " WHERE id = ? AND type = 'memory'";
    db_exec($sql, $params);
    sendJson(200, ['ok' => true]);
}

if ($method === 'DELETE') {
    requireAdmin();
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) {
        sendError(400, 'Invalid id');
    }
    db_exec("DELETE FROM posts WHERE id = ? AND type = 'memory'", [$id]);
    sendJson(200, ['ok' => true]);
}

sendError(405, 'Method Not Allowed');
