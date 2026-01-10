<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('GET');

$id = trim((string)($_GET['id'] ?? ''));
if ($id === '') {
    sendError(404, 'Not found');
}

$media = db_query('SELECT * FROM media WHERE id = ?', [$id]);
if (!$media) {
    sendError(404, 'Not found');
}

$allowed = false;
$post = db_query('SELECT is_published FROM posts WHERE media_id = ? LIMIT 1', [$id]);
if ($post && (int) $post[0]['is_published'] === 1) {
    $allowed = true;
}

$review = db_query(
    'SELECT r.status FROM review_media rm JOIN reviews r ON rm.review_id = r.id WHERE rm.media_id = ? LIMIT 1',
    [$id]
);
if ($review && $review[0]['status'] === 'approved') {
    $allowed = true;
}

if (!$allowed) {
    sendError(403, 'Forbidden');
}

$fileId = $media[0]['telegram_file_id'];
$kind = $media[0]['kind'] ?? 'photo';
$token = telegram_token();

if ($token === '') {
    sendError(500, 'Telegram token missing');
}

$getFileUrl = 'https://api.telegram.org/bot' . $token . '/getFile?file_id=' . urlencode($fileId);
$response = json_decode(file_get_contents($getFileUrl), true);
if (empty($response['ok'])) {
    sendError(404, 'Not found');
}

$filePath = $response['result']['file_path'] ?? '';
if ($filePath === '') {
    sendError(404, 'Not found');
}

$fileUrl = 'https://api.telegram.org/file/bot' . $token . '/' . $filePath;

$httpCode = 0;
$contentType = null;
$contentTypeSet = false;
$fallbackType = $kind === 'video' ? 'video/mp4' : 'image/jpeg';

header('Cache-Control: public, max-age=86400');
header('X-Content-Type-Options: nosniff');
header('X-Media-Proxy: 1');

$ch = curl_init($fileUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
curl_setopt($ch, CURLOPT_HEADERFUNCTION, function ($curl, $header) use (&$contentType, &$httpCode, &$contentTypeSet, $fallbackType) {
    if (str_starts_with($header, 'HTTP/')) {
        $parts = explode(' ', trim($header));
        $httpCode = isset($parts[1]) ? (int) $parts[1] : 0;
    }
    if (stripos($header, 'Content-Type:') === 0) {
        $contentType = trim(substr($header, strlen('Content-Type:')));
        if ($httpCode === 200 && !$contentTypeSet) {
            header('Content-Type: ' . $contentType);
            $contentTypeSet = true;
        }
    }
    return strlen($header);
});
curl_setopt($ch, CURLOPT_WRITEFUNCTION, function ($curl, $data) use (&$httpCode, &$contentTypeSet, $fallbackType) {
    if ($httpCode !== 200) {
        return strlen($data);
    }
    if (!$contentTypeSet) {
        header('Content-Type: ' . $fallbackType);
        $contentTypeSet = true;
    }
    echo $data;
    return strlen($data);
});
curl_exec($ch);
$infoCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if (($httpCode ?: $infoCode) !== 200) {
    sendError(404, 'Not found');
}
