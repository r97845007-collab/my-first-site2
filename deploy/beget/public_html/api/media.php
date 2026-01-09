<?php
require __DIR__ . '/../_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

$id = $_GET['id'] ?? '';
if (!$id) {
    http_response_code(404);
    exit;
}

$media = db_query('SELECT * FROM media WHERE id = ?', [$id]);
if (!$media) {
    http_response_code(404);
    exit;
}

$allowed = false;
$post = db_query('SELECT is_published FROM posts WHERE media_id = ? LIMIT 1', [$id]);
if ($post && (int)$post[0]['is_published'] === 1) {
    $allowed = true;
}

$review = db_query('SELECT r.status FROM review_media rm JOIN reviews r ON rm.review_id = r.id WHERE rm.media_id = ? LIMIT 1', [$id]);
if ($review && $review[0]['status'] === 'approved') {
    $allowed = true;
}

if (!$allowed) {
    http_response_code(403);
    exit;
}

$fileId = $media[0]['telegram_file_id'];
$token = telegram_token();

$getFileUrl = 'https://api.telegram.org/bot' . $token . '/getFile?file_id=' . urlencode($fileId);
$response = json_decode(file_get_contents($getFileUrl), true);
if (empty($response['ok'])) {
    http_response_code(404);
    exit;
}

$filePath = $response['result']['file_path'];
$fileUrl = 'https://api.telegram.org/file/bot' . $token . '/' . $filePath;

$ch = curl_init($fileUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$content = curl_exec($ch);
$info = curl_getinfo($ch);
curl_close($ch);

if (!$content) {
    http_response_code(404);
    exit;
}

header('Content-Type: ' . ($info['content_type'] ?? 'application/octet-stream'));
echo $content;
