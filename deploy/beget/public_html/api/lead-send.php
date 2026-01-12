<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('POST');

$data = parseJsonBody();
$name = trim((string)($data['name'] ?? ''));
$phone = trim((string)($data['phone'] ?? ''));
$route = trim((string)($data['route'] ?? ''));
$date = trim((string)($data['date'] ?? ''));
$time = trim((string)($data['time'] ?? ''));
$people = trim((string)($data['peopleCount'] ?? $data['people'] ?? ''));
$comment = trim((string)($data['comment'] ?? ''));
$source = trim((string)($data['source'] ?? ''));

if ($name === '' || $phone === '' || $route === '' || $date === '' || $time === '') {
    sendError(400, 'Missing fields');
}

$message = "Заявка (Beget)\nИмя: {$name}\nТелефон: {$phone}\nМаршрут: {$route}\nДата/время: {$date} {$time}\nЛюдей: {$people}\nКомментарий: {$comment}";
if ($source !== '') {
    $message .= "\nИсточник: {$source}";
}

telegram_send_message($message);

sendJson(200, ['ok' => true]);
