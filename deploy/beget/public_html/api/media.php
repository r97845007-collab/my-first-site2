<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('GET');

$id = trim((string)($_GET['id'] ?? ''));
if ($id === '') {
    sendError(404, 'Not found');
}
$thumbSize = isset($_GET['thumb']) ? (int) $_GET['thumb'] : 0;
if ($thumbSize < 1) {
    $thumbSize = 0;
}
if ($thumbSize > 512) {
    $thumbSize = 512;
}
$debug = !empty($_GET['debug']) && $_GET['debug'] === '1';

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
$posterFileId = $media[0]['poster_file_id'] ?? $media[0]['thumb_file_id'] ?? null;
$token = telegram_token();

if ($token === '') {
    sendError(500, 'Telegram token missing');
}

const CACHE_MAX_AGE = 31536000;
$cacheRoot = __DIR__ . '/../uploads/media_cache';
$cacheDir = $cacheRoot . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $id);
$placeholderPath = __DIR__ . '/../assets/images/stories/story-placeholder.svg';

$ensureCacheDir = function () use ($cacheRoot, $cacheDir) {
    if (!is_dir($cacheRoot)) {
        mkdir($cacheRoot, 0755, true);
    }
    if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0755, true);
    }
    $htaccess = $cacheRoot . '/.htaccess';
    if (!file_exists($htaccess)) {
        file_put_contents($htaccess, "Options -Indexes\n<FilesMatch \"\\.php$\">\n  Deny from all\n</FilesMatch>\n");
    }
};

$sendFile = function (string $path, string $contentType, bool $allowRange) {
    $size = filesize($path);
    $mtime = filemtime($path);
    $etag = '"' . sha1($mtime . ':' . $size) . '"';
    if (!empty($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) {
        header('HTTP/1.1 304 Not Modified');
        exit;
    }
    if (!empty($_SERVER['HTTP_IF_MODIFIED_SINCE'])) {
        $since = strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']);
        if ($since !== false && $since >= $mtime) {
            header('HTTP/1.1 304 Not Modified');
            exit;
        }
    }
    header('Cache-Control: public, max-age=' . CACHE_MAX_AGE . ', immutable');
    header('X-Content-Type-Options: nosniff');
    header('Accept-Ranges: bytes');
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $mtime) . ' GMT');
    header('ETag: ' . $etag);
    header('Content-Type: ' . $contentType);

    $range = $_SERVER['HTTP_RANGE'] ?? '';
    if ($allowRange && $range && preg_match('/bytes=(\\d+)-(\\d*)/', $range, $matches)) {
        $start = (int) $matches[1];
        $end = $matches[2] !== '' ? (int) $matches[2] : ($size - 1);
        if ($start > $end || $end >= $size) {
            header('HTTP/1.1 416 Range Not Satisfiable');
            header('Content-Range: bytes */' . $size);
            exit;
        }
        header('HTTP/1.1 206 Partial Content');
        header('Content-Range: bytes ' . $start . '-' . $end . '/' . $size);
        header('Content-Length: ' . ($end - $start + 1));
        $fh = fopen($path, 'rb');
        fseek($fh, $start);
        $remaining = $end - $start + 1;
        while ($remaining > 0 && !feof($fh)) {
            $chunk = fread($fh, min(8192, $remaining));
            echo $chunk;
            $remaining -= strlen($chunk);
        }
        fclose($fh);
        exit;
    }

    header('Content-Length: ' . $size);
    readfile($path);
    exit;
};

$telegramGetFilePath = function (string $token, string $fileId) {
    $getFileUrl = 'https://api.telegram.org/bot' . $token . '/getFile?file_id=' . urlencode($fileId);
    $response = json_decode(file_get_contents($getFileUrl), true);
    if (empty($response['ok'])) {
        return '';
    }
    return $response['result']['file_path'] ?? '';
};

$downloadTelegramFile = function (string $token, string $fileId, string $destPath) use ($telegramGetFilePath, $debug) {
    $filePath = $telegramGetFilePath($token, $fileId);
    if ($filePath === '') {
        return '';
    }
    $fileUrl = 'https://api.telegram.org/file/bot' . $token . '/' . $filePath;
    $fp = fopen($destPath, 'wb');
    if (!$fp) {
        return '';
    }
    $ch = curl_init($fileUrl);
    curl_setopt($ch, CURLOPT_FILE, $fp);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    fclose($fp);
    if ($httpCode !== 200) {
        if ($debug) {
            error_log('[media.php] download failed id=' . $fileId . ' code=' . $httpCode);
        }
        @unlink($destPath);
        return '';
    }
    return $filePath;
};

$generateThumb = function (string $sourcePath, string $targetPath, int $size) use ($debug) {
    if (!extension_loaded('gd')) {
        return false;
    }
    $imageData = @file_get_contents($sourcePath);
    if ($imageData === false) {
        return false;
    }
    $src = @imagecreatefromstring($imageData);
    if (!$src) {
        return false;
    }
    $width = imagesx($src);
    $height = imagesy($src);
    if ($width <= 0 || $height <= 0) {
        imagedestroy($src);
        return false;
    }
    $scale = min($size / $width, $size / $height, 1);
    $newW = (int) round($width * $scale);
    $newH = (int) round($height * $scale);
    $dst = imagecreatetruecolor($newW, $newH);
    imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $width, $height);
    $result = imagejpeg($dst, $targetPath, 82);
    imagedestroy($src);
    imagedestroy($dst);
    if (!$result && $debug) {
        error_log('[media.php] thumb failed for ' . $sourcePath);
    }
    return $result;
};

$ensureCacheDir();

if ($thumbSize > 0) {
    $thumbPath = $cacheDir . '/thumb' . $thumbSize . '.jpg';
    if (file_exists($thumbPath)) {
        $sendFile($thumbPath, 'image/jpeg', false);
    }

    if ($kind === 'video') {
        if ($posterFileId) {
            $tempPoster = $cacheDir . '/poster.tmp';
            $posterPath = $downloadTelegramFile($token, $posterFileId, $tempPoster);
            if ($posterPath !== '') {
                if ($generateThumb($tempPoster, $thumbPath, $thumbSize)) {
                    @unlink($tempPoster);
                    $sendFile($thumbPath, 'image/jpeg', false);
                }
                @unlink($tempPoster);
            }
        }
        if (file_exists($placeholderPath)) {
            $sendFile($placeholderPath, 'image/svg+xml', false);
        }
        sendError(404, 'Not found');
    }

    $existingOrig = glob($cacheDir . '/orig.*');
    $origPath = $existingOrig[0] ?? '';
    if ($origPath === '') {
        $tempOrig = $cacheDir . '/orig.tmp';
        $filePath = $downloadTelegramFile($token, $fileId, $tempOrig);
        if ($filePath === '') {
            if (file_exists($placeholderPath)) {
                $sendFile($placeholderPath, 'image/svg+xml', false);
            }
            sendError(404, 'Not found');
        }
        $ext = pathinfo($filePath, PATHINFO_EXTENSION);
        if ($ext === '') {
            $ext = 'jpg';
        }
        $origPath = $cacheDir . '/orig.' . $ext;
        rename($tempOrig, $origPath);
    }
    if ($generateThumb($origPath, $thumbPath, $thumbSize)) {
        $sendFile($thumbPath, 'image/jpeg', false);
    }
    if (file_exists($placeholderPath)) {
        $sendFile($placeholderPath, 'image/svg+xml', false);
    }
    sendError(404, 'Not found');
}

$existingOrig = glob($cacheDir . '/orig.*');
$origPath = $existingOrig[0] ?? '';
if ($origPath === '') {
    $tempOrig = $cacheDir . '/orig.tmp';
    $filePath = $downloadTelegramFile($token, $fileId, $tempOrig);
    if ($filePath === '') {
        sendError(404, 'Not found');
    }
    $ext = pathinfo($filePath, PATHINFO_EXTENSION);
    if ($ext === '') {
        $ext = $kind === 'video' ? 'mp4' : 'jpg';
    }
    $origPath = $cacheDir . '/orig.' . $ext;
    rename($tempOrig, $origPath);
}

$ext = strtolower(pathinfo($origPath, PATHINFO_EXTENSION));
$types = [
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'gif' => 'image/gif',
    'webp' => 'image/webp',
    'mp4' => 'video/mp4',
];
$contentType = $types[$ext] ?? ($kind === 'video' ? 'video/mp4' : 'application/octet-stream');
$sendFile($origPath, $contentType, $kind === 'video');
