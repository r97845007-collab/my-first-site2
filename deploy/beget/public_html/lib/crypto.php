<?php
function crypto_key(): string
{
    $config = $GLOBALS['config'];
    $raw = base64_decode($config['MASTER_KEY'], true);
    if ($raw === false || strlen($raw) !== 32) {
        throw new RuntimeException('MASTER_KEY must be 32 bytes base64');
    }
    return $raw;
}

function crypto_encrypt(string $plain): array
{
    $iv = random_bytes(12);
    $tag = '';
    $cipher = openssl_encrypt(
        $plain,
        'aes-256-gcm',
        crypto_key(),
        OPENSSL_RAW_DATA,
        $iv,
        $tag
    );
    return [
        'enc' => base64_encode($cipher),
        'iv' => base64_encode($iv),
        'tag' => base64_encode($tag),
    ];
}

function crypto_decrypt(array $payload): string
{
    $cipher = base64_decode($payload['enc']);
    $iv = base64_decode($payload['iv']);
    $tag = base64_decode($payload['tag']);
    $plain = openssl_decrypt(
        $cipher,
        'aes-256-gcm',
        crypto_key(),
        OPENSSL_RAW_DATA,
        $iv,
        $tag
    );
    if ($plain === false) {
        throw new RuntimeException('Decryption failed');
    }
    return $plain;
}
