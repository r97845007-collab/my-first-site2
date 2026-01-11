<?php
require __DIR__ . '/../_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

auth_require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $id = (int)($_POST['id'] ?? 0);
    $action = $_POST['action'] ?? '';
    if ($action === 'approve') {
        db_exec("UPDATE reviews SET status = 'approved' WHERE id = ?", [$id]);
    } elseif ($action === 'reject') {
        db_exec("UPDATE reviews SET status = 'rejected' WHERE id = ?", [$id]);
    }
}

$reviews = db_query('SELECT * FROM reviews ORDER BY created_at DESC');

render_header('Админка — Отзывы');
?>
<main class="container">
  <h1>Отзывы</h1>
  <?php foreach ($reviews as $review): ?>
    <article class="card">
      <strong><?= e($review['name'] ?: 'Гость') ?></strong>
      <p><?= e($review['text']) ?></p>
      <div class="badge">Статус: <?= e($review['status']) ?></div>
      <div class="form-row">
        <a class="button secondary" href="/admin/review-edit.php?id=<?= e((string) $review['id']) ?>">Редактировать</a>
        <form method="post">
          <?= csrf_field() ?>
          <input type="hidden" name="id" value="<?= e((string) $review['id']) ?>">
          <button class="button secondary" name="action" value="approve" type="submit">Одобрить</button>
          <button class="button secondary" name="action" value="reject" type="submit">Отклонить</button>
        </form>
      </div>
    </article>
  <?php endforeach; ?>
</main>
<?php render_footer(); ?>
