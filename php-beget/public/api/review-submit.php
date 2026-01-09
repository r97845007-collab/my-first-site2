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

telegram_send_message("Новый отзыв\nИмя: {$name}\nОценка: {$rating}\nТекст: {$text}");

$files = $_FILES['media'] ?? null;
if ($files && is_array($files['tmp_name'])) {
    $count = min(count($files['tmp_name']), 5);
    for ($i = 0; $i < $count; $i++) {
        if (!$files['tmp_name'][$i]) {
            continue;
        }
        $tmp = $files['tmp_name'][$i];
        $mime = mime_content_type($tmp);
        $kind = str_starts_with($mime, 'video/') ? 'video' : 'photo';
        $fileId = telegram_send_media($kind, $tmp);
        if ($fileId) {
            $mediaId = bin2hex(random_bytes(16));
            db_exec(
                'INSERT INTO media (id, telegram_file_id, kind) VALUES (?, ?, ?)',
                [$mediaId, $fileId, $kind]
            );
            db_exec('INSERT INTO review_media (review_id, media_id) VALUES (?, ?)', [$reviewId, $mediaId]);
        }
    }
}

header('Location: /reviews.php?sent=1');
