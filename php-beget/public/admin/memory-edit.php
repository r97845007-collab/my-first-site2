<?php
require __DIR__ . '/../_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

auth_require_admin();

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$post = [
    'title' => '',
    'body' => '',
    'is_published' => 1,
];

if ($id) {
    $rows = db_query('SELECT * FROM posts WHERE id = ? AND type = "memory"', [$id]);
    $post = $rows[0] ?? $post;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $data = [
        'title' => trim($_POST['title'] ?? ''),
        'body' => trim($_POST['body'] ?? ''),
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
            db_exec('INSERT INTO media (id, telegram_file_id, kind) VALUES (?, ?, ?)', [$mediaId, $fileId, $mediaType]);
        }
    }

    if ($id) {
        db_exec(
            'UPDATE posts SET title = ?, body = ?, media_id = ?, is_published = ? WHERE id = ? AND type = "memory"',
            [$data['title'], $data['body'], $mediaId, $data['is_published'], $id]
        );
    } else {
        db_exec(
            'INSERT INTO posts (type, title, body, media_id, is_published) VALUES ("memory", ?, ?, ?, ?)',
            [$data['title'], $data['body'], $mediaId, $data['is_published']]
        );
    }

    header('Location: /admin/memories.php');
    exit;
}

render_header('Редактирование воспоминания');
?>
<main class="container">
  <h1>Воспоминание</h1>
  <form class="card" method="post" enctype="multipart/form-data">
    <?= csrf_field() ?>
    <input class="input" name="title" placeholder="Заголовок" value="<?= e($post['title'] ?? '') ?>">
    <textarea class="input" name="body" rows="4" placeholder="Текст" required><?= e($post['body'] ?? '') ?></textarea>
    <input class="input" type="file" name="media" accept="image/*,video/*">
    <label>
      <input type="checkbox" name="is_published" <?= !empty($post['is_published']) ? 'checked' : '' ?>>
      Опубликован
    </label>
    <button class="button" type="submit">Сохранить</button>
  </form>
</main>
<?php render_footer(); ?>
