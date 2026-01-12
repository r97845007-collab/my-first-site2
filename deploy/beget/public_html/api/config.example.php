<?php
$example = [
    'DB_HOST' => '127.0.0.1',
    'DB_PORT' => 3306,
    'DB_NAME' => 'horse_site',
    'DB_USER' => 'db_user',
    'DB_PASS' => 'db_pass',

    // 32 bytes in base64
    'MASTER_KEY' => 'BASE64_32_BYTES',

    'APP_ORIGIN' => 'https://your-domain.ru',

    'TELEGRAM_BOT_TOKEN' => 'YOUR_BOT_TOKEN',
    'TELEGRAM_CHAT_ID' => 'YOUR_CHAT_ID',

    'CREATE_ADMIN_TOKEN' => 'CHANGE_ME',
];

if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($example, JSON_UNESCAPED_UNICODE);
    exit;
}

return $example;
