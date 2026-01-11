import { parseJsonBody, sendJson } from "../lib/http.js";

const isValidPhone = (phone) => /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phone);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const {
      route,
      date,
      time,
      name,
      phone,
      peopleCount,
      level,
      comment,
      source,
    } = await parseJsonBody(req);

    if (!route || !date || !time || !name || !phone) {
      return sendJson(res, 400, { error: "Missing required fields" });
    }
    if (!isValidPhone(phone)) {
      return sendJson(res, 400, { error: "Invalid phone" });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      return sendJson(res, 500, { error: "Telegram env not configured" });
    }

    const text = `Заявка с сайта\nМаршрут: ${route}\nДата/время: ${date} ${time}\nИмя: ${name}\nТелефон: ${phone}\nКол-во людей: ${
      peopleCount || "—"
    }\nУровень: ${level || "—"}\nКомментарий: ${comment || "—"}\nИсточник: ${source || "Сайт"}`;

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    if (!response.ok) {
      return sendJson(res, 500, { error: "Telegram error" });
    }

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendJson(res, 500, { error: "Server error" });
  }
}
