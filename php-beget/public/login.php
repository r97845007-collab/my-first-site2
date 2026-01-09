<?php
require __DIR__ . '/_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $_SESSION['login_attempts'] = ($_SESSION['login_attempts'] ?? 0) + 1;
    if ($_SESSION['login_attempts'] > 5) {
        sleep(2);
    }
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    if (auth_login($email, $password)) {
        $_SESSION['login_attempts'] = 0;
        header('Location: /admin/index.php');
        exit;
    }
    $error = 'Неверные данные для входа.';
}

render_header('Вход');
?>
<main class="container">
  <h1>Вход</h1>
  <?php if ($error): ?>
    <div class="notice"><?= e($error) ?></div>
  <?php endif; ?>
  <form class="card" method="post">
    <?= csrf_field() ?>
    <input class="input" type="email" name="email" placeholder="Email" required>
    <input class="input" type="password" name="password" placeholder="Пароль" required>
    <button class="button" type="submit">Войти</button>
  </form>
</main>
<?php render_footer(); ?>
