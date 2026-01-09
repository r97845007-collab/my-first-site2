import Busboy from "busboy";
import { getUserIdFromRequest } from "../lib/auth.js";
import { query } from "../lib/db.js";
import { parseJsonBody, sendJson } from "../lib/http.js";

const parseMultipart = (req) =>
  new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers, limits: { files: 1 } });
    const fields = {};
    let fileData = null;

    busboy.on("field", (name, value) => {
      fields[name] = value;
    });

    busboy.on("file", (name, file, info) => {
      const chunks = [];
      file.on("data", (data) => chunks.push(data));
      file.on("end", () => {
        fileData = {
          filename: info.filename,
          mimeType: info.mimeType,
          buffer: Buffer.concat(chunks),
        };
      });
    });

    busboy.on("finish", () => resolve({ fields, fileData }));
    busboy.on("error", reject);

    req.pipe(busboy);
  });

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
  return { ok: true, kind: isVideo ? "telegram_video" : "telegram_photo", fileId };
};

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const isPublic = url.searchParams.get("public") === "1";

  if (req.method === "GET") {
    if (!isPublic && !getUserIdFromRequest(req)) {
      return sendJson(res, 401, { error: "Unauthorized" });
    }
    const sql =
      "SELECT id, type, caption, route_tag, duration_label, level_label, hashtags, media_kind, telegram_file_id, created_at, is_published FROM posts" +
      (isPublic ? " WHERE is_published = 1" : "");
    const rows = await query(sql);
    return sendJson(res, 200, { posts: rows });
  }

  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return sendJson(res, 401, { error: "Unauthorized" });
  }

  if (req.method === "POST") {
    try {
      const contentType = req.headers["content-type"] || "";
      let fields = {};
      let fileData = null;
      if (contentType.includes("multipart/form-data")) {
        const parsed = await parseMultipart(req);
        fields = parsed.fields;
        fileData = parsed.fileData;
      } else {
        fields = await parseJsonBody(req);
      }

      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      let mediaKind = "none";
      let telegramFileId = null;
      if (fileData && token && chatId) {
        const media = await sendSingleMedia(token, chatId, fileData);
        if (media.ok) {
          mediaKind = media.kind;
          telegramFileId = media.fileId;
        }
      }

      const hashtags = fields.hashtags
        ? JSON.stringify(fields.hashtags.split(" ").filter(Boolean))
        : null;

      const result = await query(
        "INSERT INTO posts (user_id, type, caption, route_tag, duration_label, level_label, hashtags, media_kind, telegram_file_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          userId,
          fields.type || "photo",
          fields.caption || "",
          fields.routeTag || null,
          fields.durationLabel || null,
          fields.levelLabel || null,
          hashtags,
          mediaKind,
          telegramFileId,
        ]
      );
      return sendJson(res, 200, { ok: true, id: result.insertId });
    } catch (error) {
      return sendJson(res, 500, { error: "Failed to create post" });
    }
  }

  if (req.method === "PUT") {
    const data = await parseJsonBody(req);
    if (!data.id) return sendJson(res, 400, { error: "Missing id" });
    await query("UPDATE posts SET caption = ? WHERE id = ?", [data.caption || "", data.id]);
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "DELETE") {
    const id = url.searchParams.get("id");
    if (!id) return sendJson(res, 400, { error: "Missing id" });
    await query("DELETE FROM posts WHERE id = ?", [id]);
    return sendJson(res, 200, { ok: true });
  }

  res.setHeader("Allow", "GET, POST, PUT, DELETE");
  return sendJson(res, 405, { error: "Method not allowed" });
}
