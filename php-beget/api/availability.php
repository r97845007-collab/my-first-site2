<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('GET');

$routeTag = trim((string)($_GET['route'] ?? $_GET['route_tag'] ?? ''));
$conditions = ['is_available = 1', 'date >= CURDATE()', 'date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)'];
$params = [];
if ($routeTag !== '') {
    $conditions[] = '(route_tag = ? OR route_tag IS NULL OR route_tag = "")';
    $params[] = $routeTag;
}
$sql = 'SELECT id, date, time_slot, route_tag, is_available, time_slot AS time FROM availability WHERE ' . implode(' AND ', $conditions) . ' ORDER BY date ASC, time_slot ASC';
$rows = db_query($sql, $params);

sendJson(200, ['ok' => true, 'slots' => $rows]);
