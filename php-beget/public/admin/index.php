<?php
require __DIR__ . '/../_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

$user = auth_require_admin();

render_header('Админка');
?>
<main class="container">
  <h1>Админка</h1>
  <div class="card">
    <p>Вы вошли как <?= e($user['email']) ?>.</p>
    <a class="button secondary" href="/logout.php">Выйти</a>
  </div>
  <div class="grid grid-2">
    <a class="card" href="/admin/posts.php">Посты</a>
    <a class="card" href="/admin/memories.php">Воспоминания</a>
    <a class="card" href="/admin/funnel.php">Воронка</a>
    <a class="card" href="/admin/reviews.php">Отзывы</a>
    <a class="card" href="/admin/calendar.php">Календарь</a>
    <a class="card" href="/admin/media-library.php">Медиа библиотека</a>
  </div>
</main>
<?php render_footer(); ?>
