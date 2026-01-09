<?php
function auth_user(): ?array
{
    if (!isset($_SESSION['user_id'])) {
        return null;
    }
    $rows = db_query('SELECT id, email, role FROM users WHERE id = ?', [$_SESSION['user_id']]);
    return $rows[0] ?? null;
}

function auth_require_admin(): array
{
    $user = auth_user();
    if (!$user) {
        header('Location: /login.php');
        exit;
    }
    return $user;
}

function auth_login(string $email, string $password): bool
{
    $rows = db_query('SELECT id, password_hash FROM users WHERE email = ?', [$email]);
    if (!$rows) {
        return false;
    }
    $user = $rows[0];
    if (!password_verify($password, $user['password_hash'])) {
        return false;
    }
    $_SESSION['user_id'] = $user['id'];
    return true;
}

function auth_logout(): void
{
    unset($_SESSION['user_id']);
    session_regenerate_id(true);
}
