# Деплой на Beget

Проект содержит **два стека**:

- **Node/Vercel**: корневые папки `api/`, `lib/`, `db/`, `package.json`, `vercel.json`.
- **Beget (PHP)**: подготовленный пакет в `deploy/beget/public_html`.

Для Beget используется **только** папка `deploy/beget/`. Node/Vercel файлы на Beget не нужны.

---

## 1) Что загрузить в public_html (Beget)

В Beget публичный корень фиксирован: `/public_html`.

Нужно загрузить **содержимое** папки:

```
deploy/beget/public_html/
```

Внутри уже лежат:

- `index.html`, `login.html`, `register.html`, `dashboard.html`
- папки `css/`, `js/`, `assets/`
- папки `api/`, `lib/`
- файл `.htaccess`

> Важно: **копируйте содержимое** `deploy/beget/public_html` напрямую в `/public_html`, а не саму папку.

---

## 2) Создать config.local.php

Файл с секретами хранится **только на сервере**, в:

```
/public_html/api/config.local.php
```

Создайте его вручную на основе:

```
/public_html/api/config.example.php
```

### Пример:

```php
return [
    'DB_HOST' => '127.0.0.1',
    'DB_PORT' => 3306,
    'DB_NAME' => 'horse_site',
    'DB_USER' => 'db_user',
    'DB_PASS' => 'db_pass',

    'APP_ORIGIN' => 'https://your-domain.ru',

    'TELEGRAM_BOT_TOKEN' => 'YOUR_BOT_TOKEN',
    'TELEGRAM_CHAT_ID' => 'YOUR_CHAT_ID',
];
```

**Почему нельзя хранить секреты в Git:**
- репозиторий может стать публичным;
- утечка токенов Telegram и БД приведёт к взлому.

---

## 3) Импорт базы данных

Схема находится здесь:

```
deploy/beget/db/schema.sql
```

Импорт через phpMyAdmin:

1. Откройте phpMyAdmin в панели Beget.
2. Создайте базу данных.
3. Импортируйте файл `deploy/beget/db/schema.sql`.
4. Если база уже создана ранее, примените миграцию `deploy/beget/db/migrations/001_user_telegram.sql`.

---

## 4) .htaccess защита

Файл `.htaccess` уже лежит в `deploy/beget/public_html/.htaccess`.
Он:

- отключает листинг директорий;
- блокирует доступ к `lib/` и `db/`;
- блокирует `config*.local*.php`, `.sql`, `.env*`.

**Убедитесь, что он загружен в `/public_html`.**

---

## 5) Проверка после загрузки

После деплоя проверьте:

- `/` открывается
- `/login.html` и `/register.html` открываются
- `/dashboard.html` открывается
- `/api/health.php` возвращает `{ ok: true }` и `db.ok: true` с таблицами
- `/api/me.php` возвращает `401`, если вы не залогинены

### Тест-план (админка и Telegram)

1. Откройте `/api/health.php` → `ok=true`.
2. Зарегистрируйтесь/войдите → `POST /api/auth-register.php` или `POST /api/auth-login.php`.
3. Проверьте `/api/me.php` → `ok=true`, email пользователя.
4. `GET /api/admin-posts.php` → список постов с `media_url`.
5. Создайте пост без медиа, затем с медиа → `POST /api/admin-posts.php`.
6. Откройте `media_url` → должен отдать `image/*` или `video/*` и заголовок `X-Media-Proxy: 1`.
7. Админка показывает превью медиа в списке постов/воспоминаний.
8. Главная лента показывает медиа (фото/видео).
9. `POST /api/telegram-save-token.php` → `{ ok:true }`, затем `GET /api/telegram-status.php` → `telegram` из `getMe`.
10. `POST /api/admin-availability.php` → создаёт слот, выбор маршрута на сайте подтягивает слоты.
11. `POST /api/lead-send.php` → заявка приходит владельцу в Telegram.

---

## 6) Что не нужно для Beget

Папки и файлы Node/Vercel (корневые `api/`, `lib/`, `db/`, `package.json`, `vercel.json`) **не используются** при деплое на Beget.

---

Если что-то не работает:
- проверьте, что все файлы загружены в `/public_html`;
- убедитесь, что `config.local.php` создан вручную;
- проверьте импорт схемы БД.
