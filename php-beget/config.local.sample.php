<?php
// Пример локального конфига. Скопируйте в config.local.php и заполните.

return [
    'DB_HOST' => '127.0.0.1',
    'DB_PORT' => 3306,
    'DB_NAME' => 'horse_site',
    'DB_USER' => 'db_user',
    'DB_PASS' => 'db_pass',

    // 32 байта в base64 (см. README)
    'MASTER_KEY' => 'BASE64_32_BYTES',

    'APP_ORIGIN' => 'https://your-domain.ru',

    // Telegram для уведомлений владельцу
    'TELEGRAM_OWNER_BOT_TOKEN' => 'YOUR_BOT_TOKEN',
    'TELEGRAM_OWNER_CHAT_ID' => 'YOUR_CHAT_ID',

    // Одноразовый токен для create_admin.php
    'CREATE_ADMIN_TOKEN' => 'CHANGE_ME',
];
