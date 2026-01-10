<?php
ini_set('display_errors', '0');

require_once __DIR__ . '/../lib/http.php';

set_exception_handler(function () {
    sendError(500, 'Server error');
});

set_error_handler(function () {
    sendError(500, 'Server error');
});

$configPath = __DIR__ . '/config.local.php';
if (!file_exists($configPath)) {
    sendError(500, 'Server error');
}

$config = require $configPath;
if (!is_array($config)) {
    sendError(500, 'Server error');
}

$GLOBALS['config'] = $config;

require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/crypto.php';
require_once __DIR__ . '/../lib/telegram.php';

function jwt_create(array $payload): string
{
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $segments = [
        rtrim(strtr(base64_encode(json_encode($header)), '+/', '-_'), '='),
        rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '='),
    ];
    $signingInput = implode('.', $segments);
    $signature = hash_hmac('sha256', $signingInput, crypto_key(), true);
    $segments[] = rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');
    return implode('.', $segments);
}

function jwt_verify(string $token): ?array
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }
    [$headerB64, $payloadB64, $signatureB64] = $parts;
    $signingInput = $headerB64 . '.' . $payloadB64;
    $expected = rtrim(strtr(base64_encode(hash_hmac('sha256', $signingInput, crypto_key(), true)), '+/', '-_'), '=');
    if (!hash_equals($expected, $signatureB64)) {
        return null;
    }
    $payloadJson = base64_decode(strtr($payloadB64, '-_', '+/'));
    $payload = json_decode($payloadJson, true);
    if (!is_array($payload)) {
        return null;
    }
    if (isset($payload['exp']) && time() >= (int) $payload['exp']) {
        return null;
    }
    return $payload;
}

function set_session_cookie(string $token, int $maxAge): void
{
    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    setcookie('session', $token, [
        'expires' => time() + $maxAge,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function clear_session_cookie(): void
{
    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    setcookie('session', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function current_user(): ?array
{
    $token = $_COOKIE['session'] ?? '';
    if ($token === '') {
        return null;
    }
    $payload = jwt_verify($token);
    if (!$payload || empty($payload['sub'])) {
        return null;
    }
    $rows = db_query('SELECT id, email, role FROM users WHERE id = ?', [$payload['sub']]);
    return $rows[0] ?? null;
}

if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
    sendError(403, 'Forbidden');
}
