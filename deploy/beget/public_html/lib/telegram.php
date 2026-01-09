<?php
function telegram_token(): string
{
    return $GLOBALS['config']['TELEGRAM_OWNER_BOT_TOKEN'];
}

function telegram_chat_id(): string
{
    return $GLOBALS['config']['TELEGRAM_OWNER_CHAT_ID'];
}

function telegram_request(string $method, array $payload, array $files = []): array
{
    $url = 'https://api.telegram.org/bot' . telegram_token() . '/' . $method;
    $ch = curl_init($url);
    $data = $payload;
    foreach ($files as $key => $path) {
        $data[$key] = new CURLFile($path);
    }
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POSTFIELDS => $data,
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    $decoded = json_decode($response, true);
    return $decoded ?: ['ok' => false];
}

function telegram_send_message(string $text): bool
{
    $payload = [
        'chat_id' => telegram_chat_id(),
        'text' => $text,
    ];
    $res = telegram_request('sendMessage', $payload);
    return !empty($res['ok']);
}

function telegram_send_media(string $type, string $filePath): ?string
{
    $payload = ['chat_id' => telegram_chat_id()];
    $key = $type === 'video' ? 'video' : 'photo';
    $res = telegram_request($type === 'video' ? 'sendVideo' : 'sendPhoto', $payload, [$key => $filePath]);
    if (empty($res['ok'])) {
        return null;
    }
    if ($type === 'video') {
        return $res['result']['video']['file_id'] ?? null;
    }
    $photos = $res['result']['photo'] ?? [];
    $last = end($photos);
    return $last['file_id'] ?? null;
}

function telegram_send_media_group(array $mediaFiles): ?string
{
    $payload = ['chat_id' => telegram_chat_id()];
    $files = [];
    $media = [];
    foreach ($mediaFiles as $index => $item) {
        $attachKey = 'file' . $index;
        $files[$attachKey] = $item['path'];
        $media[] = [
            'type' => $item['type'],
            'media' => 'attach://' . $attachKey,
        ];
    }
    $payload['media'] = json_encode($media);
    $res = telegram_request('sendMediaGroup', $payload, $files);
    if (empty($res['ok'])) {
        return null;
    }
    $first = $res['result'][0] ?? [];
    if (isset($first['video']['file_id'])) {
        return $first['video']['file_id'];
    }
    $photos = $first['photo'] ?? [];
    $last = end($photos);
    return $last['file_id'] ?? null;
}
