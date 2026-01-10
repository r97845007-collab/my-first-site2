<?php
require_once __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$isPublic = ($_GET['public'] ?? '') === '1';

if ($method === 'GET') {
    if ($isPublic) {
        $routeTag = trim((string)($_GET['route_tag'] ?? $_GET['route'] ?? ''));
        $date = trim((string)($_GET['date'] ?? ''));
        $params = [];
        $conditions = ['is_available = 1'];
        if ($date !== '') {
            $conditions[] = 'date = ?';
            $params[] = $date;
        } else {
            $conditions[] = 'date >= CURDATE()';
        }
        if ($routeTag !== '') {
            $conditions[] = '(route_tag = ? OR route_tag IS NULL OR route_tag = "")';
            $params[] = $routeTag;
        }
        $sql = 'SELECT id, date, time_slot, route_tag, is_available, time_slot AS time FROM availability WHERE ' . implode(' AND ', $conditions) . ' ORDER BY date ASC, time_slot ASC';
        $rows = db_query($sql, $params);
        sendJson(200, ['ok' => true, 'slots' => $rows]);
    }

    requireAdmin();
    $rows = db_query(
        'SELECT id, date, time_slot, route_tag, is_available FROM availability WHERE date >= CURDATE() AND date <= DATE_ADD(CURDATE(), INTERVAL 60 DAY) ORDER BY date ASC, time_slot ASC'
    );
    sendJson(200, ['ok' => true, 'slots' => $rows]);
}

if ($method === 'POST') {
    requireAdmin();
    $data = parseJsonBody();
    $items = $data['items'] ?? null;
    if (!$items) {
        $items = [[
            'date' => $data['date'] ?? null,
            'time_slot' => $data['time_slot'] ?? null,
            'route_tag' => $data['route_tag'] ?? null,
            'is_available' => $data['is_available'] ?? 1,
        ]];
    }
    if (!is_array($items)) {
        sendError(400, 'Invalid payload');
    }

    $pdo = db();
    $pdo->beginTransaction();
    try {
        foreach ($items as $item) {
            if (!is_array($item)) {
                continue;
            }
            $date = $item['date'] ?? null;
            $timeSlot = $item['time_slot'] ?? null;
            if (!$date || !$timeSlot) {
                continue;
            }
            $routeTag = $item['route_tag'] ?? null;
            $isAvailable = (int)($item['is_available'] ?? 1) ? 1 : 0;
            $stmt = $pdo->prepare(
                'INSERT INTO availability (date, time_slot, route_tag, is_available) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE is_available = VALUES(is_available), route_tag = VALUES(route_tag)'
            );
            $stmt->execute([$date, $timeSlot, $routeTag, $isAvailable]);
        }
        $pdo->commit();
    } catch (Throwable $error) {
        $pdo->rollBack();
        sendError(500, 'Availability update failed');
    }

    sendJson(200, ['ok' => true]);
}

if ($method === 'PUT') {
    requireAdmin();
    $data = parseJsonBody();
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) {
        sendError(400, 'Invalid id');
    }
    if (!empty($data['toggle'])) {
        db_exec('UPDATE availability SET is_available = IF(is_available = 1, 0, 1) WHERE id = ?', [$id]);
        sendJson(200, ['ok' => true]);
    }
    $isAvailable = isset($data['is_available']) ? (int)$data['is_available'] : null;
    if ($isAvailable === null) {
        sendError(400, 'Missing is_available');
    }
    db_exec('UPDATE availability SET is_available = ? WHERE id = ?', [$isAvailable ? 1 : 0, $id]);
    sendJson(200, ['ok' => true]);
}

if ($method === 'DELETE') {
    requireAdmin();
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) {
        sendError(400, 'Invalid id');
    }
    db_exec('DELETE FROM availability WHERE id = ?', [$id]);
    sendJson(200, ['ok' => true]);
}

sendError(405, 'Method Not Allowed');
