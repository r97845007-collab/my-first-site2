<?php
require __DIR__ . '/../_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

auth_require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'delete') {
    csrf_verify();
    $id = (int)($_POST['id'] ?? 0);
    db_exec('DELETE FROM posts WHERE id = ? AND type = "funnel"', [$id]);
}

$items = db_query("SELECT * FROM posts WHERE type = 'funnel' ORDER BY created_at DESC");

render_header('Админка — Воронка');
?>
<main class="container">
  <h1>Воронка</h1>
  <a class="button" href="/admin/funnel-edit.php">Добавить этап</a>
  <?php foreach ($items as $item): ?>
    <article class="card">
      <strong><?= e($item['title'] ?: 'Этап') ?></strong>
      <p><?= e($item['body']) ?></p>
      <div class="badge">Стадия: <?= e($item['funnel_stage'] ?: 'idea') ?></div>
      <div class="form-row">
        <a class="button secondary" href="/admin/funnel-edit.php?id=<?= e((string) $item['id']) ?>">Редактировать</a>
        <form method="post">
          <?= csrf_field() ?>
          <input type="hidden" name="action" value="delete">
          <input type="hidden" name="id" value="<?= e((string) $item['id']) ?>">
          <button class="button secondary" data-confirm="Удалить этап?" type="submit">Удалить</button>
        </form>
      </div>
    </article>
  <?php endforeach; ?>
</main>
<script src="/assets/js/admin.js"></script>
<?php render_footer(); ?>
