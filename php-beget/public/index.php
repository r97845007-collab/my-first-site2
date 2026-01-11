<?php
require __DIR__ . '/_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

render_header('Конная кавалерия — главная');
?>
<main class="container">
  <section class="card">
    <h1>Конная кавалерия</h1>
    <p>Конные прогулки в Геленджике. Лента маршрутов, отзывы и быстрая заявка.</p>
    <div class="grid grid-2">
      <a class="card" href="/feed.php">Перейти в ленту</a>
      <a class="card" href="/funnel.php">Маршруты и воронка</a>
      <a class="card" href="/reviews.php">Отзывы</a>
      <a class="card" href="/request.php">Оставить заявку</a>
    </div>
  </section>

  <section class="card">
    <h2>Контакты</h2>
    <p>Телефон: <a href="tel:+79883415048">+7 (988) 341-50-48</a></p>
    <p>
      <a class="button secondary" target="_blank" rel="noopener"
         href="https://yandex.ru/maps/org/konnaya_kavaleriya/181659825778/?ll=38.164409%2C44.545723&z=17">
        Открыть в Яндекс Картах
      </a>
    </p>
    <div class="map-embed">
      <a href="https://yandex.ru/maps/org/konnaya_kavaleriya/181659825778/?utm_medium=mapframe&utm_source=maps">Конная Кавалерия</a>
      <a href="https://yandex.ru/maps/10995/krasnodar-krai/category/horse_riding/184107287/?utm_medium=mapframe&utm_source=maps">Конный клуб в Краснодарском крае</a>
      <iframe src="https://yandex.ru/map-widget/v1/org/konnaya_kavaleriya/181659825778/?ll=38.164151%2C44.546366&z=17" allowfullscreen="true"></iframe>
    </div>
  </section>
</main>
<?php render_footer(); ?>
