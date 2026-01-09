<?php
require __DIR__ . '/../_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

auth_require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'delete') {
    csrf_verify();
    $id = (int)($_POST['id'] ?? 0);
    db_exec('DELETE FROM posts WHERE id = ? AND type = "post"', [$id]);
}

$posts = db_query("SELECT * FROM posts WHERE type = 'post' ORDER BY created_at DESC");

render_header('Админка — Посты');
?>
<main class="container">
  <h1>Посты</h1>
  <a class="button" href="/admin/post-edit.php?type=post">Добавить пост</a>
  <?php foreach ($posts as $post): ?>
    <article class="card">
      <strong><?= e($post['title'] ?: 'Пост') ?></strong>
      <p><?= e($post['body']) ?></p>
      <div class="badge"><?= e($post['route_tag'] ?: 'маршрут') ?></div>
      <div class="form-row">
        <a class="button secondary" href="/admin/post-edit.php?id=<?= e((string) $post['id']) ?>&type=post">Редактировать</a>
        <form method="post">
          <?= csrf_field() ?>
          <input type="hidden" name="action" value="delete">
          <input type="hidden" name="id" value="<?= e((string) $post['id']) ?>">
          <button class="button secondary" data-confirm="Удалить пост?" type="submit">Удалить</button>
        </form>
      </div>
    </article>
  <?php endforeach; ?>
</main>
<script src="/assets/js/admin.js"></script>
<?php render_footer(); ?>
