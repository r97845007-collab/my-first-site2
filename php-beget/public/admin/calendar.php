<?php
require __DIR__ . '/../_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

auth_require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $date = $_POST['date'] ?? '';
    $time = $_POST['time_slot'] ?? '';
    $route = $_POST['route_tag'] ?? null;
    $available = isset($_POST['is_available']) ? 1 : 0;
    if ($date && $time) {
        db_exec(
            'INSERT INTO availability (date, time_slot, route_tag, is_available) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE is_available = VALUES(is_available)',
            [$date, $time, $route, $available]
        );
    }
}

$slots = db_query('SELECT * FROM availability ORDER BY date, time_slot');

render_header('Админка — Календарь');
?>
<main class="container">
  <h1>Календарь</h1>
  <form class="card" method="post">
    <?= csrf_field() ?>
    <div class="form-row">
      <input class="input" type="date" name="date" required>
      <input class="input" type="time" name="time_slot" required>
      <input class="input" name="route_tag" placeholder="Маршрут (опционально)">
      <label>
        <input type="checkbox" name="is_available" checked>
        Доступен
      </label>
      <button class="button" type="submit">Сохранить</button>
    </div>
  </form>

  <table class="table">
    <thead>
      <tr>
        <th>Дата</th>
        <th>Время</th>
        <th>Маршрут</th>
        <th>Доступен</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($slots as $slot): ?>
        <tr>
          <td><?= e($slot['date']) ?></td>
          <td><?= e($slot['time_slot']) ?></td>
          <td><?= e($slot['route_tag'] ?: 'любая') ?></td>
          <td><?= $slot['is_available'] ? 'Да' : 'Нет' ?></td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</main>
<?php render_footer(); ?>
