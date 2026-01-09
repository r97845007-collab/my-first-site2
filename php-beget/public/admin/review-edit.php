<?php
require __DIR__ . '/../_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

auth_require_admin();

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$rows = db_query('SELECT * FROM reviews WHERE id = ?', [$id]);
$review = $rows[0] ?? null;
if (!$review) {
    header('Location: /admin/reviews.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $text = trim($_POST['text'] ?? '');
    $status = $_POST['status'] ?? 'pending';
    db_exec('UPDATE reviews SET text = ?, status = ? WHERE id = ?', [$text, $status, $id]);
    header('Location: /admin/reviews.php');
    exit;
}

render_header('Редактировать отзыв');
?>
<main class="container">
  <h1>Редактировать отзыв</h1>
  <form class="card" method="post">
    <?= csrf_field() ?>
    <textarea class="input" name="text" rows="4" required><?= e($review['text']) ?></textarea>
    <select class="input" name="status">
      <?php foreach (['pending', 'approved', 'rejected'] as $status): ?>
        <option value="<?= e($status) ?>" <?= $review['status'] === $status ? 'selected' : '' ?>><?= e($status) ?></option>
      <?php endforeach; ?>
    </select>
    <button class="button" type="submit">Сохранить</button>
  </form>
</main>
<?php render_footer(); ?>
