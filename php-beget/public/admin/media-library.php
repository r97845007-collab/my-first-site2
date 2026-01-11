<?php
require __DIR__ . '/../_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

auth_require_admin();

$media = db_query('SELECT * FROM media ORDER BY created_at DESC');

render_header('Админка — Медиа');
?>
<main class="container">
  <h1>Медиа библиотека</h1>
  <?php foreach ($media as $item): ?>
    <article class="card">
      <strong>ID: <?= e($item['id']) ?></strong>
      <p>Тип: <?= e($item['kind']) ?></p>
      <img class="media-placeholder" src="/api/media.php?id=<?= e($item['id']) ?>" alt="Медиа">
    </article>
  <?php endforeach; ?>
</main>
<?php render_footer(); ?>
