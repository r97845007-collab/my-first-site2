import Busboy from "busboy";
import { query } from "../lib/db.js";
import { sendJson } from "../lib/http.js";

const parseMultipart = (req) =>
  new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers, limits: { files: 5 } });
    const fields = {};
    const files = [];

    busboy.on("field", (name, value) => {
      fields[name] = value;
    });

    busboy.on("file", (name, file, info) => {
      const chunks = [];
      file.on("data", (data) => chunks.push(data));
      file.on("limit", () => {
        reject(new Error("File limit exceeded"));
      });
      file.on("end", () => {
        files.push({
          field: name,
          filename: info.filename,
          mimeType: info.mimeType,
          buffer: Buffer.concat(chunks),
        });
      });
    });

    busboy.on("finish", () => resolve({ fields, files }));
    busboy.on("error", reject);

    req.pipe(busboy);
  });

const sendTelegramText = async (token, chatId, text) => {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  return response.ok;
};

const sendMediaGroup = async (token, chatId, files) => {
  const form = new FormData();
  const media = files.map((file, index) => {
    const isVideo = file.mimeType.startsWith("video/");
    const key = `file${index}`;
    form.append(key, new Blob([file.buffer]), file.filename);
    return {
      type: isVideo ? "video" : "photo",
      media: `attach://${key}`,
    };
  });
  form.append("chat_id", chatId);
  form.append("media", JSON.stringify(media));

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMediaGroup`, {
    method: "POST",
    body: form,
  });
  const data = await response.json();
  if (!data.ok) return { ok: false };
  const first = data.result?.[0];
  const fileId = first?.photo?.at(-1)?.file_id || first?.video?.file_id || null;
  return { ok: true, fileId, kind: files.length > 1 ? "telegram_album" : "none" };
};

const sendSingleMedia = async (token, chatId, file) => {
  const form = new FormData();
  form.append("chat_id", chatId);
  const isVideo = file.mimeType.startsWith("video/");
  form.append(isVideo ? "video" : "photo", new Blob([file.buffer]), file.filename);
  const endpoint = isVideo ? "sendVideo" : "sendPhoto";
  const response = await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
    method: "POST",
    body: form,
  });
  const data = await response.json();
  if (!data.ok) return { ok: false };
  const fileId = isVideo
    ? data.result.video?.file_id
    : data.result.photo?.at(-1)?.file_id;
  return { ok: true, fileId, kind: isVideo ? "telegram_video" : "telegram_photo" };
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return sendJson(res, 500, { error: "Telegram env not configured" });
  }

  try {
    const { fields, files } = await parseMultipart(req);
    const text = (fields.text || "").trim();
    const rating = Number(fields.rating || 0);
    if (!text || text.length < 10) {
      return sendJson(res, 400, { error: "Review text too short" });
    }
    if (rating && (rating < 1 || rating > 5)) {
      return sendJson(res, 400, { error: "Invalid rating" });
    }

    const message = `Новый отзыв\nИмя: ${fields.name || "—"}\nОценка: ${
      rating || "—"
    }\nТекст: ${text}`;
    await sendTelegramText(token, chatId, message);

    let mediaKind = "none";
    let telegramFileId = null;

    if (files.length === 1) {
      const result = await sendSingleMedia(token, chatId, files[0]);
      if (result.ok) {
        mediaKind = result.kind;
        telegramFileId = result.fileId;
      }
    }

    if (files.length > 1) {
      const result = await sendMediaGroup(token, chatId, files);
      if (result.ok) {
        mediaKind = "telegram_album";
        telegramFileId = result.fileId;
      }
    }

    await query(
      "INSERT INTO reviews_inbox (name, rating, text, media_kind, telegram_file_id) VALUES (?, ?, ?, ?, ?)",
      [fields.name || null, rating || null, text, mediaKind, telegramFileId]
    );

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || "Review upload failed" });
  }
}
