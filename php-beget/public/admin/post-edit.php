<?php
require __DIR__ . '/../_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

auth_require_admin();

$type = $_GET['type'] ?? 'post';
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$post = [
    'title' => '',
    'body' => '',
    'route_tag' => '',
    'duration_label' => '',
    'level_label' => '',
    'hashtags' => '',
    'is_published' => 1,
];

if ($id) {
    $rows = db_query('SELECT * FROM posts WHERE id = ? AND type = ?', [$id, $type]);
    $post = $rows[0] ?? $post;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $data = [
        'title' => trim($_POST['title'] ?? ''),
        'body' => trim($_POST['body'] ?? ''),
        'route_tag' => trim($_POST['route_tag'] ?? ''),
        'duration_label' => trim($_POST['duration_label'] ?? ''),
        'level_label' => trim($_POST['level_label'] ?? ''),
        'hashtags' => trim($_POST['hashtags'] ?? ''),
        'is_published' => isset($_POST['is_published']) ? 1 : 0,
    ];

    $mediaId = $post['media_id'] ?? null;
    if (!empty($_FILES['media']['tmp_name'])) {
        $filePath = $_FILES['media']['tmp_name'];
        $mime = mime_content_type($filePath);
        $mediaType = str_starts_with($mime, 'video/') ? 'video' : 'photo';
        $fileId = telegram_send_media($mediaType, $filePath);
        if ($fileId) {
            $mediaId = bin2hex(random_bytes(16));
            db_exec(
                'INSERT INTO media (id, telegram_file_id, kind) VALUES (?, ?, ?)',
                [$mediaId, $fileId, $mediaType]
            );
        }
    }

    if ($id) {
        db_exec(
            'UPDATE posts SET title = ?, body = ?, route_tag = ?, duration_label = ?, level_label = ?, hashtags = ?, media_id = ?, is_published = ? WHERE id = ? AND type = ?',
            [
                $data['title'],
                $data['body'],
                $data['route_tag'],
                $data['duration_label'],
                $data['level_label'],
                $data['hashtags'],
                $mediaId,
                $data['is_published'],
                $id,
                $type,
            ]
        );
    } else {
        db_exec(
            'INSERT INTO posts (type, title, body, route_tag, duration_label, level_label, hashtags, media_id, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                $type,
                $data['title'],
                $data['body'],
                $data['route_tag'],
                $data['duration_label'],
                $data['level_label'],
                $data['hashtags'],
                $mediaId,
                $data['is_published'],
            ]
        );
    }

    header('Location: /admin/posts.php');
    exit;
}

render_header('Редактирование поста');
?>
<main class="container">
  <h1>Пост</h1>
  <form class="card" method="post" enctype="multipart/form-data">
    <?= csrf_field() ?>
    <input class="input" name="title" placeholder="Заголовок" value="<?= e($post['title'] ?? '') ?>">
    <textarea class="input" name="body" rows="4" placeholder="Описание" required><?= e($post['body'] ?? '') ?></textarea>
    <div class="form-row">
      <input class="input" name="route_tag" placeholder="Маршрут" value="<?= e($post['route_tag'] ?? '') ?>">
      <input class="input" name="duration_label" placeholder="Длительность" value="<?= e($post['duration_label'] ?? '') ?>">
      <input class="input" name="level_label" placeholder="Уровень" value="<?= e($post['level_label'] ?? '') ?>">
    </div>
    <input class="input" name="hashtags" placeholder="Хэштеги" value="<?= e($post['hashtags'] ?? '') ?>">
    <input class="input" type="file" name="media" accept="image/*,video/*">
    <label>
      <input type="checkbox" name="is_published" <?= !empty($post['is_published']) ? 'checked' : '' ?>>
      Опубликован
    </label>
    <button class="button" type="submit">Сохранить</button>
  </form>
</main>
<?php render_footer(); ?>
