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
## Deploy to Beget (rsync по SSH)
1. Настройте SSH-ключи:
   - `ssh-keygen -t ed25519 -C "beget-deploy"`
   - добавьте публичный ключ в Beget.
2. Создайте `deploy/beget/public_html/api/config.local.php` на сервере (в репо не хранится).
3. Важно:
   - remote path `/` запрещён
   - используйте `~/` (home уже `public_html`)
4. Запуск деплоя (Linux/macOS/WSL):
   - `export BEGET_HOST=.beget.tech`
   - `export BEGET_USER=`
   - `export BEGET_PORT=22`
   - `export BEGET_REMOTE_PATH=~/`
   - `export DRY_RUN=1` (опционально)
   - `./scripts/deploy-beget.sh`
5. Запуск деплоя (Windows PowerShell):
   - `$env:BEGET_HOST=".beget.tech"`
   - `$env:BEGET_USER="`
   - `$env:BEGET_PORT="22"`
   - `$env:BEGET_REMOTE_PATH="~/"`
   - `$env:DRY_RUN="1"` (опционально)
   - `powershell -ExecutionPolicy Bypass -File .\scripts\deploy-beget.ps1`

### Windows + MSYS2 rsync
- Скрипт ищет `C:\msys64\usr\bin\rsync.exe` автоматически.
- Либо добавьте `C:\msys64\usr\bin` в PATH.
- Если rsync не найден, используйте WSL:
  - `wsl rsync -avz --delete --exclude 'config.local.php' --exclude 'uploads/' --exclude '.ssh/' -e ssh -p 22 deploy/beget/public_html/ .beget.tech:~/`

## Deploy via WinSCP (Windows)
1. Установите WinSCP (нужен WinSCP.com в PATH).
2. Создайте `deploy/beget/public_html/api/config.local.php` на сервере (в репо не хранится).
3. Примеры переменных окружения:
   - `BEGET_HOST=.beget.tech`
   - `BEGET_USER=`
   - `BEGET_REMOTE_PATH=/`
   - `BEGET_PRIVATE_KEY=%USERPROFILE%\.ssh\id_ed25519`
   - `BEGET_HOSTKEY=""` (опционально, для фиксации host key)
   - `DRY_RUN=1` (опционально)
4. Запуск:
   - `powershell -ExecutionPolicy Bypass -File .\scripts\deploy-beget-winscp.ps1`
## Deploy via WinSCP CLI (Windows)
���� ������ �������, ����� rsync ������ ��-�� SSH-������� (code 12).
1. ���������� WinSCP (����� WinSCP.com).
2. �������� `deploy/beget/public_html/api/config.local.php` �� ������� (� ���� �� ��������).
3. ������� ���������� ���������:
   - `$env:BEGET_HOST="yaruvlnr.beget.tech"
   - `$env:BEGET_USER="yaruvlnr_1234"
   - `$env:BEGET_PORT="22"
   - `$env:BEGET_REMOTE_PATH="~/"
   - `$env:BEGET_HOSTKEY="ssh-ed25519 255 SHA256:14hNJylDIrQMUKWN/Fz7Lq06hjnnyBmBCE9feqeK53M"
   - `$env:WINSCP_COM="C:\Program Files (x86)\WinSCP\WinSCP.com"
4. ������:
   - `powershell -ExecutionPolicy Bypass -File .\scripts\deploy-beget-winscp-cli.ps1`
