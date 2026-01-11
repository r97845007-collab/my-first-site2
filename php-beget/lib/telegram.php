<?php
function telegram_token(): string
{
    $config = $GLOBALS['config'];
    return $config['TELEGRAM_OWNER_BOT_TOKEN'] ?? $config['TELEGRAM_BOT_TOKEN'] ?? '';
}

function telegram_chat_id(): string
{
    $config = $GLOBALS['config'];
    return $config['TELEGRAM_OWNER_CHAT_ID'] ?? $config['TELEGRAM_CHAT_ID'] ?? '';
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

function telegram_send_media_group(array $mediaFiles, string $caption = ''): array
{
    $payload = ['chat_id' => telegram_chat_id()];
    $files = [];
    $media = [];
    foreach ($mediaFiles as $index => $item) {
        $attachKey = 'file' . $index;
        $files[$attachKey] = $item['path'];
        $entry = [
            'type' => $item['type'],
            'media' => 'attach://' . $attachKey,
        ];
        if ($caption !== '' && $index === 0) {
            $entry['caption'] = $caption;
        }
        $media[] = $entry;
    }
    $payload['media'] = json_encode($media);
    $res = telegram_request('sendMediaGroup', $payload, $files);
    if (empty($res['ok'])) {
        return [];
    }
    $ids = [];
    foreach ($res['result'] as $item) {
        if (isset($item['video']['file_id'])) {
            $ids[] = $item['video']['file_id'];
            continue;
        }
        $photos = $item['photo'] ?? [];
        $last = end($photos);
        if (!empty($last['file_id'])) {
            $ids[] = $last['file_id'];
        }
    }
    return $ids;
}
