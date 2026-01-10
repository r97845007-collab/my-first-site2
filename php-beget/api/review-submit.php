<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('POST');

$name = trim((string)($_POST['name'] ?? ''));
$rating = (int)($_POST['rating'] ?? 0);
$text = trim((string)($_POST['text'] ?? ''));

if (mb_strlen($text) < 10) {
    sendError(400, 'Review text is too short');
}

$reviewId = db_exec(
    'INSERT INTO reviews (name, rating, text, status) VALUES (?, ?, ?, "pending")',
    [$name !== '' ? $name : null, $rating ?: null, $text]
);

telegram_send_message("Новый отзыв\nИмя: {$name}\nОценка: {$rating}\nТекст: {$text}");

$files = [];
if (!empty($_FILES['photos'])) {
    $files[] = ['key' => 'photos', 'type' => 'photo'];
}
if (!empty($_FILES['videos'])) {
    $files[] = ['key' => 'videos', 'type' => 'video'];
}

foreach ($files as $fileGroup) {
    $group = $_FILES[$fileGroup['key']];
    if (!is_array($group['tmp_name'] ?? null)) {
        continue;
    }
    $count = min(count($group['tmp_name']), 5);
    for ($i = 0; $i < $count; $i++) {
        if (empty($group['tmp_name'][$i])) {
            continue;
        }
        $tmp = $group['tmp_name'][$i];
        $kind = $fileGroup['type'];
        $fileId = telegram_send_media($kind, $tmp);
        if (!$fileId) {
            continue;
        }
        $mediaId = bin2hex(random_bytes(16));
        db_exec(
            'INSERT INTO media (id, telegram_file_id, kind) VALUES (?, ?, ?)',
            [$mediaId, $fileId, $kind]
        );
        db_exec('INSERT INTO review_media (review_id, media_id) VALUES (?, ?)', [$reviewId, $mediaId]);
    }
}

sendJson(200, ['ok' => true]);
