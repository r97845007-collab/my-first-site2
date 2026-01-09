# Конная кавалерия — PHP версия для Beget (из коробки)

Эта ветка содержит **отдельную PHP‑версию сайта** для хостинга Beget. Она лежит в каталоге `php-beget/` и **не влияет на существующий HTML/CSS/JS сайт** в корне репозитория.

Главная идея: вы копируете содержимое `php-beget/public` в `/public_html`, а приватную часть (`lib/`, `db/`, `tools/`, `config.local.php`) храните **вне** публичной директории.

---

## 1) Что куда копировать на Beget (важно!)

### 1.1. Публичная часть (DocumentRoot `/public_html`)

Скопируйте **всё содержимое** папки `php-beget/public/` прямо в `/public_html`:

```
/public_html
  index.php
  feed.php
  funnel.php
  reviews.php
  request.php
  login.php
  logout.php
  admin/
  api/
  assets/
  _bootstrap_path.php
```

### 1.2. Приватная часть (вне `/public_html`)

Создайте приватную папку, например:

```
/home/<user>/site-private/horse-site/
```

И положите туда:

```
php-beget/lib/
php-beget/db/
php-beget/tools/
php-beget/config.local.php
```

---

## 2) Настройка пути к приватной папке

В файле `/public_html/_bootstrap_path.php` **одна строка**:

```php
define('APP_PRIVATE_PATH', '/home/<user>/site-private/horse-site');
```

Замените путь на свой приватный каталог. Это единственное место, где нужно менять путь.

---

## 3) Настройка конфигурации (config.local.php)

1. Скопируйте `php-beget/config.local.sample.php` в `php-beget/config.local.php`.
2. Заполните значения:

```php
return [
  'DB_HOST' => '127.0.0.1',
  'DB_PORT' => 3306,
  'DB_NAME' => 'horse_site',
  'DB_USER' => 'db_user',
  'DB_PASS' => 'db_pass',

  // 32 байта в base64
  'MASTER_KEY' => 'BASE64_32_BYTES',

  'APP_ORIGIN' => 'https://your-domain.ru',

  'TELEGRAM_OWNER_BOT_TOKEN' => 'YOUR_BOT_TOKEN',
  'TELEGRAM_OWNER_CHAT_ID' => 'YOUR_CHAT_ID',

  'CREATE_ADMIN_TOKEN' => 'CHANGE_ME',
];
```

### Как сгенерировать MASTER_KEY

Нужен **32‑байтный ключ в base64**. Пример генерации:

```
php -r "echo base64_encode(random_bytes(32)) . PHP_EOL;"
```

---

## 4) Создание базы данных и импорт схемы

1. Создайте БД в панели Beget.
2. Импортируйте файл `php-beget/db/schema.sql`.

Таблицы:
- `users` (админ)
- `posts` (post/memory/funnel)
- `media` (Telegram file_id)
- `reviews` + `review_media`
- `availability`

---

## 5) Первичный админ (create_admin.php)

Скрипт лежит в `php-beget/tools/create_admin.php` (в приватной зоне). Его **нельзя держать публично** постоянно.

### Безопасный способ (рекомендуется для Beget)

1. Временно скопируйте `create_admin.php` в `/public_html/tools/`.
2. Создайте в `/public_html/tools/.htaccess`:
   ```
   Deny from all
   ```
3. Временно разрешите доступ только через токен:
   - Откройте URL:
     ```
     https://your-domain.ru/tools/create_admin.php?token=ВАШ_ТОКЕН
     ```
4. Создайте администратора (email + пароль минимум 10 символов).
5. Скрипт создаст маркер `/tools/.admin_created`.
6. **Удалите create_admin.php из публичной зоны**.

---

## 6) Проверка основных URL

После установки должны работать:

- `/` — главная
- `/feed.php` — лента
- `/funnel.php` — воронка
- `/reviews.php` — отзывы + форма
- `/request.php` — заявка
- `/login.php` — вход
- `/admin/` — админка

---

## 7) Админка (CRUD + календарь)

В админке доступны:

- **Посты** (`/admin/posts.php`)
- **Воспоминания** (`/admin/memories.php`)
- **Воронка** (`/admin/funnel.php`)
- **Отзывы (модерация)** (`/admin/reviews.php`)
- **Календарь** (`/admin/calendar.php`)
- **Медиа библиотека** (`/admin/media-library.php`)

Все публикации появляются на публичной части **только после админки**.

---

## 8) Telegram интеграция

- Токен и chat_id берутся только из `config.local.php`.
- Заявки с `/request.php` → Telegram владельцу.
- Отзывы с `/reviews.php` → Telegram владельцу + запись в БД со статусом `pending`.
- Медиа хранится как **Telegram file_id** в таблице `media`.

### Прокси медиа

Доступ к медиа идёт через `/api/media.php?id=...`. Скрипт отдаёт файл **только если запись опубликована или отзыв одобрен**.

---

## 9) Безопасность

- `config.local.php` и папка `lib/` находятся вне `public_html`.
- Админка защищена сессиями и CSRF.
- `media.php` выдаёт только опубликованные/одобренные файлы.
- create_admin.php одноразовый и после использования удаляется.

---

## 10) Подсказки по наполнению

1. Сначала создайте посты/воспоминания в админке.
2. Потом добавьте этапы воронки.
3. Настройте календарь слотов.
4. Проверьте публичные страницы и форму заявки.

---

Если что-то не работает — проверьте:
- путь `APP_PRIVATE_PATH`
- корректность DB‑настроек
- наличие таблиц после импорта schema.sql
- доступность Telegram токена
