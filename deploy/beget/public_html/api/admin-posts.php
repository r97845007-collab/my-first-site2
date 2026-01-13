<?php
require_once __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$hasPostMediaTable = null;
const MAX_POST_MEDIA = 10;
const MAX_POST_VIDEO_MB = 20;
const MAX_POST_IMAGE_MB = 10;

$postMediaTableExists = function () use (&$hasPostMediaTable): bool {
    if ($hasPostMediaTable !== null) {
        return $hasPostMediaTable;
    }
    $rows = db_query("SHOW TABLES LIKE 'post_media'");
    $hasPostMediaTable = !empty($rows);
    return $hasPostMediaTable;
};

$ensurePostMediaTable = function () use ($postMediaTableExists, &$hasPostMediaTable): void {
    if ($postMediaTableExists()) {
        return;
    }
    db_exec(
        'CREATE TABLE IF NOT EXISTS post_media (
            id INT AUTO_INCREMENT PRIMARY KEY,
            post_id INT NOT NULL,
            media_id VARCHAR(64) NOT NULL,
            kind VARCHAR(16) NOT NULL,
            thumb_media_id VARCHAR(64) DEFAULT NULL,
            sort_order INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX (post_id),
            INDEX (media_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );
    $hasPostMediaTable = true;
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
    $loadPosts = function (bool $publishedOnly) use ($postMediaTableExists) {
        $where = $publishedOnly ? "WHERE p.is_published = 1" : '';
        $rows = db_query(
            "SELECT p.id, p.type, p.title, p.body, p.route_tag, p.duration_label, p.level_label, p.hashtags, p.funnel_stage, p.media_id,
                    p.is_published, p.created_at, COALESCE(p.title, p.body) AS caption, m.kind AS media_kind
             FROM posts p
             LEFT JOIN media m ON p.media_id = m.id
             {$where}
             ORDER BY p.created_at DESC"
        );
        if (!$rows) {
            return [];
        }
        if ($postMediaTableExists()) {
            $postIds = array_map(fn ($row) => (int) $row['id'], $rows);
            $placeholders = implode(',', array_fill(0, count($postIds), '?'));
            $mediaRows = db_query(
                "SELECT pm.post_id, pm.media_id, pm.kind, pm.thumb_media_id, pm.sort_order,
                        m.kind AS media_kind
                 FROM post_media pm
                 LEFT JOIN media m ON pm.media_id = m.id
                 WHERE pm.post_id IN ({$placeholders})
                 ORDER BY pm.sort_order ASC, pm.id ASC",
                $postIds
            );
            $mediaByPost = [];
            foreach ($mediaRows as $media) {
                $mediaId = $media['media_id'];
                $thumbId = $media['thumb_media_id'] ?? null;
                $kind = $media['kind'] ?: ($media['media_kind'] ?? 'photo');
                $mediaType = $kind === 'video' ? 'video' : 'image';
                $thumbUrl = $thumbId
                    ? '/api/media.php?id=' . $thumbId . '&thumb=256'
                    : '/api/media.php?id=' . $mediaId . '&thumb=256';
                $mediaByPost[$media['post_id']][] = [
                    'media_id' => $mediaId,
                    'media_type' => $mediaType,
                    'media_url' => $mediaId ? '/api/media.php?id=' . $mediaId : null,
                    'thumb_url' => $thumbUrl,
                ];
            }
            foreach ($rows as &$row) {
                $mediaList = $mediaByPost[$row['id']] ?? [];
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
            return $rows;
        }

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
        return $rows;
    };

    $isPublic = ($_GET['public'] ?? '') === '1';
    if ($isPublic) {
        $rows = $loadPosts(true);
        sendJson(200, ['ok' => true, 'posts' => $rows]);
    }

    requireAdmin();
    $rows = $loadPosts(false);
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
    $uploads = [];
    if (!$isJson && !empty($_FILES['media'])) {
        $uploads = $normalizeUploads($_FILES['media']);
    }
    if (count($uploads) > MAX_POST_MEDIA) {
        sendError(400, 'Too many files. Maximum is 10.');
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
            if ($size > MAX_POST_VIDEO_MB * 1024 * 1024) {
                sendError(400, 'Video is too large');
            }
            $videoCount += 1;
            if ($videoCount > 1) {
                sendError(400, 'Only one video is allowed per post');
            }
        } elseif ($isImage) {
            $size = (int)($file['size'] ?? 0);
            if ($size > MAX_POST_IMAGE_MB * 1024 * 1024) {
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
        if (!empty($prepared)) {
            $first = $prepared[0];
            $fileId = telegram_send_media($first['kind'], $first['tmp_name']);
            if (!$fileId) {
                sendError(500, 'Media upload failed');
            }
            $mediaId = bin2hex(random_bytes(20));
            db_exec('INSERT INTO media (id, telegram_file_id, kind) VALUES (?, ?, ?)', [$mediaId, $fileId, $first['kind']]);
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
            null,
            $isPublished ? 1 : 0,
        ]
    );

    if ($prepared) {
        $ensurePostMediaTable();
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
        if ($postMediaTableExists()) {
            db_exec(
                'INSERT INTO post_media (post_id, media_id, kind, thumb_media_id, sort_order) VALUES (?, ?, ?, ?, ?)',
                [(int) $postId, $mediaId, $item['kind'], $thumbId, $order]
            );
        }
    }

    if ($primaryMediaId) {
        db_exec('UPDATE posts SET media_id = ? WHERE id = ?', [$primaryMediaId, (int) $postId]);
    }

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
