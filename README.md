# Конная кавалерия — сайт-лента

Одностраничный сайт в формате «лента как Instagram» для бренда «Конная кавалерия». Проект полностью статический: чистый HTML/CSS/JS, без фреймворков и без бинарных медиа-файлов.

---

## 1. Как запустить (самый простой способ)

**Вариант A (самый быстрый):**
1. Откройте файл `index.html` в браузере двойным кликом.
2. Готово — сайт работает локально.

**Вариант B (чуть удобнее, если хотите автообновление):**
1. Установите расширение **Live Server** для VS Code.
2. Откройте репозиторий в VS Code.
3. Кликните `index.html` → **Open with Live Server**.
4. Страница откроется по адресу `http://127.0.0.1:5500`.

---

## 2. Где менять контент (лента, stories, отзывы, слоты)

Все данные находятся в `script.js`. Ниже список ключевых массивов:

- `posts` — основная лента (посты/рилсы)
- `stories` — кружочки Stories
- `reviews` — отзывы
- `slots` — слоты для календаря и воронки

Пример структуры поста:

```js
{
  id: 1,
  type: "photo", // или "reel"
  caption: "Текст подписи",
  routeTag: "Закат",
  durationLabel: "2 часа",
  level: "Новичок",
  hashtags: ["#закат", "#прогулка"],
  dateCreated: "2025-01-15",
}
```

---

## 3. Где менять цены

Цены находятся прямо в `index.html` внутри секции **«Маршруты и цены»**.

Каждый блок — это `<details class="price-spoiler">` со скрытой таблицей:

```html
<details class="price-spoiler">
  <summary>Название маршрута</summary>
  <p>Описание маршрута</p>
  <table>
    <thead>...</thead>
    <tbody>
      <tr>
        <td>—</td>
        <td>1 час</td>
        <td>заполню позже</td>
        <td>—</td>
        <td>—</td>
      </tr>
    </tbody>
  </table>
</details>
```

Заполняйте вручную — сайт сразу покажет изменения.

---

## 4. Структура папок для контента

Папка `assets/` разбита по типу контента. Это сделано специально, чтобы легко находить и заменять медиа:

```
assets/
  images/
    posts/       # Заглушки для фото и рилсов
    stories/     # Заглушки для stories
    ui/          # UI-заглушки (например отзывы)
```

**Важно:** SVG-файлы — это текст, а не бинарные файлы, поэтому они разрешены.

---

## 5. Заглушки для медиа и анимации

- Все изображения — SVG-заглушки из папки `assets/images/`.
- Для рилсов используется анимированный оверлей (мигающая подсветка), чтобы показать, что в будущем будет видео.

Это сделано без видеофайлов и без внешних библиотек.

---

## 6. Telegram интеграция (2 режима)

### Режим A — безопасный (рекомендуется)

Сайт отправляет заявку на endpoint `/api/telegram`. Токен и chat_id не хранятся в браузере, а находятся на сервере.

**Пример для Vercel (`/api/telegram.js`):**

```js
export default async function handler(req, res) {
  const { text } = req.body;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  res.status(response.ok ? 200 : 500).json({ ok: response.ok });
}
```

**Пример для Cloudflare Worker (`worker.js`):**

```js
export default {
  async fetch(request, env) {
    const { text } = await request.json();

    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
    });

    return new Response(JSON.stringify({ ok: response.ok }), {
      status: response.ok ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  },
};
```

**Переменные окружения:**
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

---

### Режим B — demo (небезопасный, включён по умолчанию)

В интерфейсе есть блок **«Настройки интеграции»** — там можно включить demo-режим и вставить токен/чат ID напрямую.

⚠️ **Важно:** не используйте это в публичном продакшн-сайте.

Сейчас demo-режим включён по умолчанию, чтобы сайт работал сразу. В `script.js` уже прописаны значения:

```js
const state = {
  demoMode: true,
  demoToken: "8198438564:AAGca7TI0xwRXu4RtKuNCAfyoEJPnAx13co",
  demoChatId: "784718265",
};
```

Если хотите выключить demo по умолчанию — просто поставьте `demoMode: false`.

---

## 7. Контакты

- Телефон: **+7 (988) 341-50-48**
- Яндекс Карты: https://yandex.ru/maps/org/konnaya_kavaleriya/181659825778/?ll=38.164409%2C44.545723&z=17

---

## 8. Полезные подсказки для редактирования

1. **Поменять ленту** — откройте `script.js` и измените массив `posts`.
2. **Поменять stories** — тот же файл, массив `stories`.
3. **Поменять отзывы** — массив `reviews`.
4. **Поменять слоты** — массив `slots`.
5. **Вставить реальные фото/видео** — замените SVG-файлы в `assets/images/` на реальные файлы (но не коммитьте бинарники).
6. **Сменить цвета** — редактируйте CSS-переменные в `styles.css`.

---

## 9. Как отключить demo и перейти на безопасный режим

1. В `script.js` установите `demoMode: false`.
2. Настройте backend `/api/telegram` по примерам выше.
3. Проверьте, что переменные окружения заданы.

---

## 10. Лицензия

Проект использует лицензию из файла `LICENSE`.
