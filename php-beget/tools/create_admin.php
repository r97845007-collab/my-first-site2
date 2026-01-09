<?php
define('APP_PRIVATE_PATH', dirname(__DIR__));
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

$marker = __DIR__ . '/.admin_created';
if (file_exists($marker)) {
    http_response_code(403);
    echo 'Администратор уже создан.';
    exit;
}

$token = $_GET['token'] ?? '';
if (!$token || !hash_equals($GLOBALS['config']['CREATE_ADMIN_TOKEN'], $token)) {
    http_response_code(403);
    echo 'Неверный токен.';
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['confirm'] ?? '';

    if (!$email || !str_contains($email, '@')) {
        $error = 'Неверный email.';
    } elseif (strlen($password) < 10) {
        $error = 'Пароль минимум 10 символов.';
    } elseif ($password !== $confirm) {
        $error = 'Пароли не совпадают.';
    } else {
        $exists = db_query('SELECT id FROM users LIMIT 1');
        if ($exists) {
            $error = 'Администратор уже существует.';
        } else {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            db_exec('INSERT INTO users (email, password_hash, role) VALUES (?, ?, "admin")', [$email, $hash]);
            file_put_contents($marker, 'created');
            echo '<h1>Администратор создан</h1>';
            echo '<p><strong>Удалите файл create_admin.php и закройте доступ.</strong></p>';
            echo '<a href="/login.php">Перейти к входу</a>';
            exit;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Create Admin</title>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <main class="container">
    <h1>Создать администратора</h1>
    <?php if ($error): ?>
      <div class="notice"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>
    <form class="card" method="post">
      <input class="input" type="email" name="email" placeholder="Email" required>
      <input class="input" type="password" name="password" placeholder="Пароль" required>
      <input class="input" type="password" name="confirm" placeholder="Повторите пароль" required>
      <button class="button" type="submit">Создать</button>
    </form>
  </main>
</body>
</html>
