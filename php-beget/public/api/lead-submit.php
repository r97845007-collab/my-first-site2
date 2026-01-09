<?php
require __DIR__ . '/../_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'Method not allowed';
    exit;
}

$name = trim($_POST['name'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$route = trim($_POST['route'] ?? '');
$date = trim($_POST['date'] ?? '');
$time = trim($_POST['time'] ?? '');
$people = trim($_POST['people'] ?? '');
$comment = trim($_POST['comment'] ?? '');

if (!$name || !$phone || !$route || !$date || !$time) {
    http_response_code(400);
    echo 'Missing fields';
    exit;
}

$message = "Заявка (Beget)\nИмя: {$name}\nТелефон: {$phone}\nМаршрут: {$route}\nДата/время: {$date} {$time}\nЛюдей: {$people}\nКомментарий: {$comment}";
telegram_send_message($message);

header('Location: /request.php?sent=1');
