<?php
require __DIR__ . '/_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

$filter = $_GET['route'] ?? '';
$sort = $_GET['sort'] ?? 'new';

$params = [];
$sql = "SELECT * FROM posts WHERE type = 'post' AND is_published = 1";
if ($filter) {
    $sql .= " AND route_tag = ?";
    $params[] = $filter;
}
$sql .= $sort === 'popular' ? " ORDER BY created_at DESC" : " ORDER BY created_at DESC";
$posts = db_query($sql, $params);

render_header('Лента');
?>
<main class="container">
  <h1>Лента</h1>
  <form class="card" method="get">
    <div class="form-row">
      <input class="input" type="text" name="route" placeholder="Фильтр по маршруту" value="<?= e($filter) ?>">
      <select class="input" name="sort">
        <option value="new" <?= $sort === 'new' ? 'selected' : '' ?>>Новые</option>
        <option value="popular" <?= $sort === 'popular' ? 'selected' : '' ?>>Популярные</option>
      </select>
      <button class="button" type="submit">Применить</button>
    </div>
  </form>

  <?php foreach ($posts as $post): ?>
    <article class="card">
      <?php if ($post['media_id']): ?>
        <img class="media-placeholder" src="/api/media.php?id=<?= e($post['media_id']) ?>" alt="Медиа">
      <?php else: ?>
        <div class="media-placeholder">Медиа будет добавлено</div>
      <?php endif; ?>
      <h3><?= e($post['title'] ?: 'Маршрут') ?></h3>
      <p><?= nl2br(e($post['body'])) ?></p>
      <div class="badge"><?= e($post['route_tag'] ?: 'Маршрут') ?></div>
    </article>
  <?php endforeach; ?>
</main>
<?php render_footer(); ?>
