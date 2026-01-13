<?php
require_once __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$hasStoryMediaTable = null;
const MAX_STORY_MEDIA = 6;
const MAX_VIDEO_MB = 20;
const MAX_IMAGE_MB = 10;

$storyMediaTableExists = function () use (&$hasStoryMediaTable): bool {
    if ($hasStoryMediaTable !== null) {
        return $hasStoryMediaTable;
    }
    $rows = db_query("SHOW TABLES LIKE 'story_media'");
    $hasStoryMediaTable = !empty($rows);
    return $hasStoryMediaTable;
};

$ensureStoryMediaTable = function () use ($storyMediaTableExists, &$hasStoryMediaTable): void {
    if ($storyMediaTableExists()) {
        return;
    }
    db_exec(
        'CREATE TABLE IF NOT EXISTS story_media (
            id INT AUTO_INCREMENT PRIMARY KEY,
            story_id INT NOT NULL,
            media_id VARCHAR(64) NOT NULL,
            kind VARCHAR(16) NOT NULL,
            thumb_media_id VARCHAR(64) DEFAULT NULL,
            sort_order INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX (story_id),
            INDEX (media_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );
    $hasStoryMediaTable = true;
};

$normalizeUploads = function (array $files): array {
    if (empty($files) || empty($files['name'])) {
        return [];
    }
    if (!is_array($files['name'])) {
        return [[
            'name' => $files['name'],
            'tmp_name' => $files['tmp_name'],
            'size' => $files['size'],
            'error' => $files['error'],
        ]];
    }
    $items = [];
    foreach ($files['name'] as $index => $name) {
        $items[] = [
            'name' => $name,
            'tmp_name' => $files['tmp_name'][$index] ?? '',
            'size' => $files['size'][$index] ?? 0,
            'error' => $files['error'][$index] ?? UPLOAD_ERR_NO_FILE,
        ];
    }
    return $items;
};

if ($method === 'GET') {
    $loadStories = function (bool $publishedOnly) use ($storyMediaTableExists) {
        $where = $publishedOnly ? "AND p.is_published = 1" : '';
        $rows = db_query(
            "SELECT p.id, p.type, p.title, p.body AS text, p.route_tag, p.duration_label, p.level_label, p.hashtags, p.funnel_stage, p.media_id,
                    p.is_published, p.created_at
             FROM posts p
             WHERE p.type = 'memory' {$where}
             ORDER BY p.created_at DESC"
        );

        if (!$rows) {
            return [];
        }

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
                    $mediaList[] = [
                        'media_id' => $row['media_id'],
                        'media_type' => 'image',
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
            return $rows;
        }

        foreach ($rows as &$row) {
            $row['media_url'] = $row['media_id'] ? '/api/media.php?id=' . $row['media_id'] : null;
            $row['media'] = $row['media_url']
                ? [[
                    'media_id' => $row['media_id'],
                    'media_type' => 'image',
                    'media_url' => $row['media_url'],
                    'thumb_url' => '/api/media.php?id=' . $row['media_id'] . '&thumb=256',
                ]]
                : [];
        }
        return $rows;
    };

    $isPublic = ($_GET['public'] ?? '') === '1';
    if ($isPublic) {
        $rows = $loadStories(true);
        sendJson(200, ['ok' => true, 'stories' => $rows]);
    }

    requireAdmin();
    $rows = $loadStories(false);
    sendJson(200, ['ok' => true, 'stories' => $rows]);
}

if ($method === 'POST') {
    requireAdmin();
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    $isJson = str_starts_with($contentType, 'application/json');
    $data = $isJson ? parseJsonBody() : $_POST;

    $title = trim((string)($data['title'] ?? $data['caption'] ?? ''));
    $text = trim((string)($data['text'] ?? $data['body'] ?? ''));
    if ($title === '') {
        sendError(400, 'Title is required');
    }

    $mediaId = null;
    $uploads = [];
    if (!$isJson && !empty($_FILES['media'])) {
        $uploads = $normalizeUploads($_FILES['media']);
    }

    if (count($uploads) > MAX_STORY_MEDIA) {
        sendError(400, 'Too many files. Maximum is 6.');
    }

    $videoCount = 0;
    $prepared = [];
    foreach ($uploads as $index => $file) {
        if (!empty($file['error']) && $file['error'] !== UPLOAD_ERR_OK) {
            continue;
        }
        if (!is_uploaded_file($file['tmp_name'])) {
            continue;
        }
        $mime = mime_content_type($file['tmp_name']) ?: '';
        $isVideo = str_starts_with($mime, 'video/');
        $isImage = str_starts_with($mime, 'image/');
        if ($isVideo) {
            if ($mime !== 'video/mp4') {
                sendError(400, 'Only MP4 video is allowed');
            }
            $size = (int)($file['size'] ?? 0);
            if ($size > MAX_VIDEO_MB * 1024 * 1024) {
                sendError(400, 'Video is too large');
            }
            $videoCount += 1;
            if ($videoCount > 1) {
                sendError(400, 'Only one video is allowed per story');
            }
        } elseif ($isImage) {
            $size = (int)($file['size'] ?? 0);
            if ($size > MAX_IMAGE_MB * 1024 * 1024) {
                sendError(400, 'Image is too large');
            }
        } else {
            sendError(400, 'Only images or MP4 video are allowed');
        }
        $prepared[] = [
            'tmp_name' => $file['tmp_name'],
            'kind' => $isVideo ? 'video' : 'photo',
            'index' => $index,
        ];
    }

    $storyId = db_exec(
        "INSERT INTO posts (type, title, body, media_id, is_published) VALUES ('memory', ?, ?, ?, 1)",
        [$title, $text !== '' ? $text : $title, null]
    );

    if ($prepared) {
        $ensureStoryMediaTable();
    }

    $videoThumbIndex = isset($data['video_thumb_index']) ? (int) $data['video_thumb_index'] : null;
    $thumbMediaId = null;
    if (
        !empty($_FILES['video_thumb']) &&
        is_uploaded_file($_FILES['video_thumb']['tmp_name'])
    ) {
        $thumbTmp = $_FILES['video_thumb']['tmp_name'];
        $thumbSize = (int)($_FILES['video_thumb']['size'] ?? 0);
        $thumbMime = mime_content_type($thumbTmp) ?: '';
        $allowedThumbs = ['image/jpeg', 'image/png', 'image/webp'];
        $maxThumbBytes = 2 * 1024 * 1024;
        if (in_array($thumbMime, $allowedThumbs, true) && $thumbSize <= $maxThumbBytes) {
            $thumbFileId = telegram_send_media('photo', $thumbTmp);
            if ($thumbFileId) {
                $thumbMediaId = bin2hex(random_bytes(20));
                db_exec('INSERT INTO media (id, telegram_file_id, kind) VALUES (?, ?, ?)', [$thumbMediaId, $thumbFileId, 'photo']);
            }
        }
    }

    $primaryMediaId = null;
    foreach ($prepared as $order => $item) {
        $fileId = telegram_send_media($item['kind'], $item['tmp_name']);
        if (!$fileId) {
            sendError(500, 'Media upload failed');
        }
        $mediaId = bin2hex(random_bytes(20));
        db_exec('INSERT INTO media (id, telegram_file_id, kind) VALUES (?, ?, ?)', [$mediaId, $fileId, $item['kind']]);
        if ($primaryMediaId === null) {
            $primaryMediaId = $mediaId;
        }
        $thumbId = null;
        if ($thumbMediaId && $item['kind'] === 'video' && $videoThumbIndex === $item['index']) {
            $thumbId = $thumbMediaId;
        }
        if ($storyMediaTableExists()) {
            db_exec(
                'INSERT INTO story_media (story_id, media_id, kind, thumb_media_id, sort_order) VALUES (?, ?, ?, ?, ?)',
                [(int) $storyId, $mediaId, $item['kind'], $thumbId, $order]
            );
        }
    }

    if ($primaryMediaId) {
        db_exec('UPDATE posts SET media_id = ? WHERE id = ?', [$primaryMediaId, (int) $storyId]);
    }

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
