<?php
require __DIR__ . '/../_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'Method not allowed';
    exit;
}

$name = trim($_POST['name'] ?? '');
$rating = (int)($_POST['rating'] ?? 0);
$text = trim($_POST['text'] ?? '');

if (strlen($text) < 10) {
    http_response_code(400);
    echo 'Review too короткий';
    exit;
}

$reviewId = db_exec(
    'INSERT INTO reviews (name, rating, text, status) VALUES (?, ?, ?, "pending")',
    [$name ?: null, $rating ?: null, $text]
);

function normalize_review_uploads(array $sources, int $maxFiles, int $maxSize): array
{
    $items = [];
    $errors = [];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    foreach ($sources as $group) {
        if (empty($group['tmp_name'])) {
            continue;
        }
        $isArray = is_array($group['tmp_name']);
        $count = $isArray ? count($group['tmp_name']) : 1;
        for ($i = 0; $i < $count; $i++) {
            if (count($items) >= $maxFiles) {
                break 2;
            }
            $tmp = $isArray ? ($group['tmp_name'][$i] ?? '') : ($group['tmp_name'] ?? '');
            $error = $isArray ? ($group['error'][$i] ?? UPLOAD_ERR_NO_FILE) : ($group['error'] ?? UPLOAD_ERR_NO_FILE);
            $size = $isArray ? ($group['size'][$i] ?? 0) : ($group['size'] ?? 0);
            if ($error !== UPLOAD_ERR_OK || $tmp === '') {
                continue;
            }
            if ($size > $maxSize) {
                $errors[] = 'Файл слишком большой (лимит 12MB).';
                continue;
            }
            $mime = finfo_file($finfo, $tmp) ?: '';
            if (str_starts_with($mime, 'image/')) {
                $type = 'photo';
            } elseif (str_starts_with($mime, 'video/')) {
                $type = 'video';
            } else {
                $errors[] = 'Допустимы только изображения и видео.';
                continue;
            }
            $items[] = ['path' => $tmp, 'type' => $type];
        }
    }
    finfo_close($finfo);
    return [$items, $errors];
}

$sources = [];
foreach (['review-files', 'files', 'photos', 'videos', 'media'] as $key) {
    if (!empty($_FILES[$key])) {
        $sources[] = $_FILES[$key];
    }
}

[$uploads, $errors] = normalize_review_uploads($sources, 5, 12 * 1024 * 1024);
if ($errors) {
    http_response_code(400);
    echo implode(' ', array_unique($errors));
    exit;
}

$messageText = "Новый отзыв\nИмя: {$name}\nОценка: {$rating}\nТекст: {$text}";
if (!telegram_send_message($messageText)) {
    http_response_code(500);
    echo 'Не удалось отправить отзыв в Telegram';
    exit;
}

if (count($uploads) === 1) {
    $fileId = telegram_send_media($uploads[0]['type'], $uploads[0]['path']);
    if (!$fileId) {
        http_response_code(500);
        echo 'Не удалось отправить медиа в Telegram';
        exit;
    }
    $mediaId = bin2hex(random_bytes(16));
    db_exec('INSERT INTO media (id, telegram_file_id, kind) VALUES (?, ?, ?)', [$mediaId, $fileId, $uploads[0]['type']]);
    db_exec('INSERT INTO review_media (review_id, media_id) VALUES (?, ?)', [$reviewId, $mediaId]);
} elseif (count($uploads) > 1) {
    $fileIds = telegram_send_media_group($uploads);
    if (!$fileIds) {
        http_response_code(500);
        echo 'Не удалось отправить медиа в Telegram';
        exit;
    }
    foreach ($uploads as $index => $upload) {
        $fileId = $fileIds[$index] ?? null;
        if (!$fileId) {
            continue;
        }
        $mediaId = bin2hex(random_bytes(16));
        db_exec('INSERT INTO media (id, telegram_file_id, kind) VALUES (?, ?, ?)', [$mediaId, $fileId, $upload['type']]);
        db_exec('INSERT INTO review_media (review_id, media_id) VALUES (?, ?)', [$reviewId, $mediaId]);
    }
}

header('Location: /reviews.php?sent=1');
