<?php
require __DIR__ . '/_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

render_header('Заявка');
?>
<main class="container">
  <h1>Оставить заявку</h1>
  <?php if (!empty($_GET['sent'])): ?>
    <div class="card">Спасибо! Заявка отправлена.</div>
  <?php endif; ?>
  <section class="card">
    <form action="/api/lead-submit.php" method="post">
      <div class="form-row">
        <input class="input" name="name" placeholder="Имя" required>
        <input class="input" name="phone" placeholder="Телефон" required>
        <input class="input" name="route" placeholder="Маршрут" required>
      </div>
      <div class="form-row">
        <input class="input" name="date" type="date" required>
        <input class="input" name="time" type="time" required>
        <input class="input" name="people" type="number" min="1" max="6" value="1">
      </div>
      <textarea class="input" name="comment" rows="3" placeholder="Комментарий"></textarea>
      <button class="button" type="submit">Отправить заявку</button>
    </form>
  </section>
</main>
<?php render_footer(); ?>
