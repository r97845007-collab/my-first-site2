<?php
function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function render_header(string $title): void
{
    echo '<!DOCTYPE html><html lang="ru"><head>';
    echo '<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<title>' . e($title) . '</title>';
    echo '<link rel="stylesheet" href="/assets/css/style.css">';
    echo '</head><body>';
    echo '<header class="site-header">';
    echo '<div class="logo">Конная кавалерия</div>';
    echo '<nav class="nav">';
    echo '<a href="/">Главная</a>';
    echo '<a href="/feed.php">Лента</a>';
    echo '<a href="/funnel.php">Воронка</a>';
    echo '<a href="/reviews.php">Отзывы</a>';
    echo '<a href="/request.php">Заявка</a>';
    echo '<a href="/login.php">Вход</a>';
    echo '</nav>';
    echo '</header>';
}

function render_footer(): void
{
    echo '<footer class="site-footer">';
    echo '<div>Конная кавалерия · +7 (988) 341-50-48</div>';
    echo '</footer>';
    echo '</body></html>';
}
