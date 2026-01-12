<?php
require_once __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $postId = (int)($_GET['post_id'] ?? 0);
    if ($postId <= 0) {
        sendError(400, 'Invalid post_id');
    }
    $limit = (int)($_GET['limit'] ?? 20);
    if ($limit < 1) {
        $limit = 20;
    }
    $limit = min($limit, 50);
    $cursor = trim((string)($_GET['cursor'] ?? ''));

    $params = [$postId];
    $conditions = ['c.post_id = ?', 'c.is_deleted = 0'];

    if ($cursor !== '') {
        $decoded = base64_decode($cursor, true);
        if ($decoded !== false) {
            [$cursorDate, $cursorId] = array_pad(explode('|', $decoded), 2, null);
            if ($cursorDate && $cursorId) {
                $conditions[] = '(c.created_at < ? OR (c.created_at = ? AND c.id < ?))';
                $params[] = $cursorDate;
                $params[] = $cursorDate;
                $params[] = (int) $cursorId;
            }
        }
    }

    $whereSql = implode(' AND ', $conditions);
    $sql = "SELECT c.id, c.body, c.created_at, c.user_id, u.email
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE {$whereSql}
            ORDER BY c.created_at DESC, c.id DESC
            LIMIT {$limit}";

    $rows = db_query($sql, $params);
    $items = array_map(function ($row) {
        return [
            'id' => (int) $row['id'],
            'body' => $row['body'],
            'created_at' => $row['created_at'],
            'user' => $row['user_id'] ? ['id' => (int) $row['user_id'], 'email' => $row['email']] : null,
        ];
    }, $rows);

    $nextCursor = null;
    if (count($rows) === $limit) {
        $last = $rows[count($rows) - 1];
        $nextCursor = base64_encode($last['created_at'] . '|' . $last['id']);
    }

    sendJson(200, ['ok' => true, 'items' => $items, 'next_cursor' => $nextCursor]);
}

if ($method === 'POST') {
    $user = requireLogin();
    $data = parseJsonBody();
    $postId = (int)($data['post_id'] ?? 0);
    $body = trim((string)($data['body'] ?? ''));
    if ($postId <= 0) {
        sendError(400, 'Invalid post_id');
    }
    if ($body === '' || mb_strlen($body) > 1000) {
        sendError(400, 'Invalid body');
    }

    $commentId = db_exec(
        'INSERT INTO comments (post_id, user_id, body) VALUES (?, ?, ?)',
        [$postId, $user['id'], $body]
    );

    sendJson(200, [
        'ok' => true,
        'comment' => [
            'id' => (int) $commentId,
            'body' => $body,
            'created_at' => date('Y-m-d H:i:s'),
            'user' => ['id' => (int) $user['id'], 'email' => $user['email']],
        ],
    ]);
}

if ($method === 'DELETE') {
    $user = requireLogin();
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) {
        sendError(400, 'Invalid id');
    }
    $rows = db_query('SELECT user_id FROM comments WHERE id = ? AND is_deleted = 0', [$id]);
    if (!$rows) {
        sendError(404, 'Not found');
    }
    $ownerId = (int) $rows[0]['user_id'];
    if ($ownerId !== (int) $user['id'] && ($user['role'] ?? '') !== 'admin') {
        sendError(403, 'Forbidden');
    }
    db_exec('UPDATE comments SET is_deleted = 1 WHERE id = ?', [$id]);
    sendJson(200, ['ok' => true]);
}

sendError(405, 'Method Not Allowed');
