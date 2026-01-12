# Конная кавалерия — деплой на Beget

## Структура проекта
- `deploy/beget/public_html` — рабочая директория деплоя, копируется в `public_html` на Beget.
- Внутри `public_html`: `api/`, `assets/`, `css/`, `js/`, `lib/`, `vendor/` + `.htaccess`, `index.html`, `login.html`, `register.html`, `dashboard.html`, `favicon.svg`.

## Конфиг и база
- Боевой конфиг лежит в `deploy/beget/public_html/api/config.local.php` (в git не хранится).
- Пример структуры см. `deploy/beget/public_html/api/config.example.php`.
- Схему БД импортируйте перед запуском (MySQL). Таблицы: `users`, `media`, `posts`, `reviews`, `review_media`, `availability`, `user_telegram`, `comments`, `favorites`.

## Как проверить
1. Главная страница: лента, stories и рилсы грузятся из API.
2. `/api/health.php` возвращает `ok: true` и список таблиц.
3. Лента: `/api/feed.php`.
4. Stories: `/api/stories.php`.
5. Календарь: `/api/admin-availability.php?public=1`.
6. Отзывы: `/api/reviews.php` (берутся только `approved`).

## Деплой на Beget
1. Скопируйте содержимое `deploy/beget/public_html/` в `public_html` хостинга.
2. Создайте `deploy/beget/public_html/api/config.local.php` на сервере.
3. Проверьте права и работу API:
   - `/api/health.php`
   - `/api/feed.php`
   - `/api/stories.php`
   - `/api/reviews.php`

## Важно
- `vendor/` — фронтенд-зависимости (jquery/slick). PHP-исполнение там запрещено через `.htaccess`.
- Если появится `uploads/`, запретите выполнение PHP и листинг (как в корне).
