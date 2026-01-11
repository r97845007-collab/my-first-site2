<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('POST');
requireAdmin();

$data = parseJsonBody();
$dateFrom = trim((string)($data['date_from'] ?? ''));
$dateTo = trim((string)($data['date_to'] ?? ''));
$weekdays = $data['weekdays'] ?? [];
$timeSlots = $data['time_slots'] ?? [];
$routeTag = trim((string)($data['route_tag'] ?? ''));
$overwrite = (bool)($data['overwrite'] ?? false);

if (!$dateFrom || !$dateTo) {
    sendError(400, 'Invalid date range');
}

try {
    $start = new DateTime($dateFrom);
    $end = new DateTime($dateTo);
} catch (Throwable $error) {
    sendError(400, 'Invalid date range');
}

if ($end < $start) {
    sendError(400, 'Invalid date range');
}

$intervalDays = (int) $start->diff($end)->days;
if ($intervalDays > 120) {
    sendError(400, 'Date range too large');
}

 $weekdays = _compile_weekdays($weekdays);
if ($weekdays === null) {
    sendError(400, 'Invalid weekdays');
}
if (!is_array($timeSlots) || !$timeSlots) {
    sendError(400, 'Invalid time_slots');
}

$routeTag = $routeTag !== '' ? $routeTag : null;

$pdo = db();
$pdo->beginTransaction();
$inserted = 0;
$updated = 0;
try {
    $stmt = $overwrite
        ? $pdo->prepare('INSERT INTO availability (date, time_slot, route_tag, is_available) VALUES (?, ?, ?, 1) ON DUPLICATE KEY UPDATE is_available = 1')
        : $pdo->prepare('INSERT IGNORE INTO availability (date, time_slot, route_tag, is_available) VALUES (?, ?, ?, 1)');

    $current = clone $start;
    while ($current <= $end) {
        $weekday = (int) $current->format('N');
        if (!in_array($weekday, $weekdays, true)) {
            $current->modify('+1 day');
            continue;
        }
        $dateValue = $current->format('Y-m-d');
        foreach ($timeSlots as $slot) {
            $slot = trim((string) $slot);
            if ($slot === '') {
                continue;
            }
            $stmt->execute([$dateValue, $slot, $routeTag]);
            $affected = $stmt->rowCount();
            if ($overwrite && $affected === 2) {
                $updated++;
            } elseif ($affected > 0) {
                $inserted++;
            }
        }
        $current->modify('+1 day');
    }
    $pdo->commit();
} catch (Throwable $error) {
    $pdo->rollBack();
    sendError(500, 'Slot generation failed');
}

sendJson(200, ['ok' => true, 'inserted' => $inserted, 'updated' => $updated]);

function _compile_weekdays($weekdays): ?array
{
    if (!is_array($weekdays) || !$weekdays) {
        return null;
    }
    $normalized = [];
    foreach ($weekdays as $day) {
        if (!is_int($day) && !ctype_digit((string) $day)) {
            return null;
        }
        $day = (int) $day;
        if ($day < 1 || $day > 7) {
            return null;
        }
        $normalized[] = $day;
    }
    return array_values(array_unique($normalized));
}
