<?php
require __DIR__ . '/../_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

auth_require_admin();

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$item = [
    'title' => '',
    'body' => '',
    'funnel_stage' => 'idea',
    'is_published' => 1,
];

if ($id) {
    $rows = db_query('SELECT * FROM posts WHERE id = ? AND type = "funnel"', [$id]);
    $item = $rows[0] ?? $item;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $data = [
        'title' => trim($_POST['title'] ?? ''),
        'body' => trim($_POST['body'] ?? ''),
        'funnel_stage' => $_POST['funnel_stage'] ?? 'idea',
        'is_published' => isset($_POST['is_published']) ? 1 : 0,
    ];

    if ($id) {
        db_exec(
            'UPDATE posts SET title = ?, body = ?, funnel_stage = ?, is_published = ? WHERE id = ? AND type = "funnel"',
            [$data['title'], $data['body'], $data['funnel_stage'], $data['is_published'], $id]
        );
    } else {
        db_exec(
            'INSERT INTO posts (type, title, body, funnel_stage, is_published) VALUES ("funnel", ?, ?, ?, ?)',
            [$data['title'], $data['body'], $data['funnel_stage'], $data['is_published']]
        );
    }

    header('Location: /admin/funnel.php');
    exit;
}

render_header('Редактирование воронки');
?>
<main class="container">
  <h1>Этап воронки</h1>
  <form class="card" method="post">
    <?= csrf_field() ?>
    <input class="input" name="title" placeholder="Название" value="<?= e($item['title'] ?? '') ?>">
    <textarea class="input" name="body" rows="4" placeholder="Описание" required><?= e($item['body'] ?? '') ?></textarea>
    <select class="input" name="funnel_stage">
      <?php foreach (['idea' => 'Idea', 'work' => 'Work', 'done' => 'Done'] as $value => $label): ?>
        <option value="<?= e($value) ?>" <?= $item['funnel_stage'] === $value ? 'selected' : '' ?>><?= e($label) ?></option>
      <?php endforeach; ?>
    </select>
    <label>
      <input type="checkbox" name="is_published" <?= !empty($item['is_published']) ? 'checked' : '' ?>>
      Опубликован
    </label>
    <button class="button" type="submit">Сохранить</button>
  </form>
</main>
<?php render_footer(); ?>
