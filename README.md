# Конная кавалерия — сайт-лента

Одностраничный сайт в формате «лента как Instagram» для бренда «Конная кавалерия».

## Как запустить

- Откройте `index.html` в браузере.
- Или используйте Live Server (например, в VS Code) для локального сервера.

## Где менять контент ленты

Контент находится в массиве `posts` и `stories` в `script.js`:
- `posts` — карточки ленты (photo / reel), подписи, хэштеги, теги маршрутов.
- `stories` — кружочки Stories.

## Как заполнить цены вручную

Секция «Маршруты и цены» находится в `index.html`. Заполняйте таблицы внутри блоков:

```
<details class="price-spoiler">
  <summary>Название маршрута</summary>
  <table>...</table>
</details>
```

## Telegram интеграция

Поддерживаются два режима:

### Режим A (безопасный, рекомендованный)

Фронтенд отправляет POST на `/api/telegram`. Данные для Telegram Bot API должны храниться в переменных окружения.

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

Переменные окружения: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

### Режим B (demo, небезопасный)

В интерфейсе есть «Настройки интеграции». Там можно вручную вставить токен/чат ID и отправлять заявку напрямую в Telegram.
Режим по умолчанию выключен и сопровождается предупреждением.

## Контакты

- Телефон: +7 (988) 341-50-48
- Яндекс Карты: https://yandex.ru/maps/org/konnaya_kavaleriya/181659825778/?ll=38.164409%2C44.545723&z=17
