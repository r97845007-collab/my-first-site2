<?php
require __DIR__ . '/_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

$reviews = db_query("SELECT * FROM reviews WHERE status = 'approved' ORDER BY created_at DESC");

render_header('Отзывы');
?>
<main class="container">
  <h1>Отзывы</h1>
  <?php if (!empty($_GET['sent'])): ?>
    <div class="card">Спасибо! Отзыв отправлен и ожидает модерации.</div>
  <?php endif; ?>
  <?php foreach ($reviews as $review): ?>
    <article class="card">
      <strong><?= e($review['name'] ?: 'Гость') ?></strong>
      <?php if ($review['rating']): ?>
        <div class="badge">Оценка: <?= e((string) $review['rating']) ?>/5</div>
      <?php endif; ?>
      <p><?= nl2br(e($review['text'])) ?></p>
      <?php
      $media = db_query('SELECT media_id FROM review_media WHERE review_id = ?', [$review['id']]);
      foreach ($media as $item):
      ?>
        <img class="media-placeholder" src="/api/media.php?id=<?= e($item['media_id']) ?>" alt="Медиа">
      <?php endforeach; ?>
    </article>
  <?php endforeach; ?>

  <section class="card">
    <h2>Оставить отзыв</h2>
    <form action="/api/review-submit.php" method="post" enctype="multipart/form-data">
      <div class="form-row">
        <input class="input" name="name" placeholder="Ваше имя">
        <input class="input" type="number" name="rating" min="1" max="5" placeholder="Оценка 1-5">
      </div>
      <textarea class="input" name="text" rows="4" placeholder="Текст отзыва" required></textarea>
      <input class="input" type="file" name="media[]" multiple accept="image/*,video/*">
      <button class="button" type="submit">Отправить отзыв</button>
    </form>
  </section>
</main>
<?php render_footer(); ?>
