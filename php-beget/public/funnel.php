<?php
require __DIR__ . '/_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

$items = db_query("SELECT * FROM posts WHERE type = 'funnel' AND is_published = 1 ORDER BY created_at DESC");
$groups = ['idea' => [], 'work' => [], 'done' => []];
foreach ($items as $item) {
    $stage = $item['funnel_stage'] ?: 'idea';
    $groups[$stage][] = $item;
}

render_header('Воронка');
?>
<main class="container">
  <h1>Воронка маршрутов</h1>
  <div class="grid grid-2">
    <?php foreach ($groups as $stage => $list): ?>
      <div class="card">
        <h3><?= e(strtoupper($stage)) ?></h3>
        <?php foreach ($list as $item): ?>
          <div class="card">
            <strong><?= e($item['title'] ?: 'Маршрут') ?></strong>
            <p><?= e($item['body']) ?></p>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endforeach; ?>
  </div>
</main>
<?php render_footer(); ?>
