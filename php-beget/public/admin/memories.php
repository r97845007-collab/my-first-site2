<?php
require __DIR__ . '/../_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

auth_require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'delete') {
    csrf_verify();
    $id = (int)($_POST['id'] ?? 0);
    db_exec('DELETE FROM posts WHERE id = ? AND type = "memory"', [$id]);
}

$memories = db_query("SELECT * FROM posts WHERE type = 'memory' ORDER BY created_at DESC");

render_header('Админка — Воспоминания');
?>
<main class="container">
  <h1>Воспоминания</h1>
  <a class="button" href="/admin/memory-edit.php">Добавить воспоминание</a>
  <?php foreach ($memories as $item): ?>
    <article class="card">
      <strong><?= e($item['title'] ?: 'Воспоминание') ?></strong>
      <p><?= e($item['body']) ?></p>
      <div class="form-row">
        <a class="button secondary" href="/admin/memory-edit.php?id=<?= e((string) $item['id']) ?>">Редактировать</a>
        <form method="post">
          <?= csrf_field() ?>
          <input type="hidden" name="action" value="delete">
          <input type="hidden" name="id" value="<?= e((string) $item['id']) ?>">
          <button class="button secondary" data-confirm="Удалить воспоминание?" type="submit">Удалить</button>
        </form>
      </div>
    </article>
  <?php endforeach; ?>
</main>
<script src="/assets/js/admin.js"></script>
<?php render_footer(); ?>
