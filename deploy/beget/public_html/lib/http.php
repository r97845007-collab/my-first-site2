<?php
function sendJson(int $code, array $data): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function sendError(int $code, string $message): void
{
    sendJson($code, ['ok' => false, 'error' => $message]);
}

function requireMethod(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        sendError(405, 'Method Not Allowed');
    }
}

function parseJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        sendError(400, 'Invalid JSON');
    }
    return $data;
}
